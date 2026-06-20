import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import Product from "./models/Product.js";
import Admin from "./models/Admin.js";
import Order from "./models/Order.js";
import Page from "./models/Page.js";
import dashboardRoutes from "./routes/dashboard.js";
import stockRoutes from "./routes/stock.js";
import categoryRoutes from "./routes/categories.js";

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const port = process.env.PORT || 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseSpecs = (value) => {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeProduct = (body, imageData = {}) => {
  const baseId = body.id || `${body.name || "product"}-${body.model || Date.now()}`;

  return {
    id: slugify(baseId),
    name: body.name,
    model: body.model,
    price: Number(body.price),
    originalPrice: body.originalPrice ? Number(body.originalPrice) : 0,
    category: body.category,
    subcategory: body.subcategory,
    visual: body.visual || "fridge",
    color: body.color || "#0b3474",
    image: imageData.secure_url || body.image || "",
    imagePublicId: imageData.public_id || body.imagePublicId || "",
    description: body.description || "",
    specs: parseSpecs(body.specs),
    stock: body.stock !== undefined ? Number(body.stock) : 10,
    lowStockThreshold: body.lowStockThreshold !== undefined ? Number(body.lowStockThreshold) : 5,
    isActive: body.isActive !== undefined ? body.isActive : true,
  };
};

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve({});
      return;
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "vision-products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(file.buffer);
  });

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "vision-dashboard-api" });
});

// Root route
app.get("/", (_req, res) => {
  res.send(`
    <html>
      <head><title>Vision Dashboard API</title></head>
      <body>
        <h1>🚀 Vision Dashboard API is Running!</h1>
        <p>Health Check: <a href="/api/health">/api/health</a></p>
        <p>Frontend: Go to <a href="http://localhost:5173">http://localhost:5173</a></p>
      </body>
    </html>
  `);
});

// Auth Middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret");
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Admin Routes
app.post("/api/admin/register", async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;
    
    if (!username) {
      return res.status(400).json({ message: "ইউজারনেম আবশ্যক" });
    }
    
    const existingAdmin = await Admin.findOne({
      $or: [
        { email: email?.toLowerCase() },
        { username: username?.toLowerCase() },
      ],
    });
    
    if (existingAdmin) {
      const field = existingAdmin.email === email?.toLowerCase() ? "ইমেইল" : "ইউজারনেম";
      return res.status(400).json({ message: `এই ${field} ইতিমধ্যে ব্যবহার হচ্ছে` });
    }
    
    const admin = await Admin.create({
      name,
      username,
      email,
      password, // pre-save hook auto-hash করবে
      role: role || "admin",
    });
    
    const token = jwt.sign(
      { id: admin._id, email: admin.email, username: admin.username, role: admin.role },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );
    
    res.status(201).json({
      token,
      admin: admin.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const loginId = username || req.body.email;
    
    // Demo mode: if no DB, still allow login with demo credentials
    if (mongoose.connection.readyState !== 1) {
      if ((loginId === "superadmin" || loginId === "superadmin@gmail.com") && password === "admin123") {
        const token = jwt.sign(
          { id: "demo-id", email: "superadmin@gmail.com", username: "superadmin", role: "superadmin" },
          process.env.JWT_SECRET || "fallback-secret",
          { expiresIn: "7d" }
        );
        
        return res.json({
          token,
          admin: {
            id: "demo-id",
            name: "কামাল হোসেন",
            username: "superadmin",
            email: "superadmin@gmail.com",
            role: "superadmin",
          },
        });
      } else {
        return res.status(400).json({ message: "ভুল ব্যবহারকারীর নাম বা পাসওয়ার্ড!" });
      }
    }
    
    // Real DB mode - schema.statics.findByCredentials ব্যবহার করে
    const admin = await Admin.findByCredentials(loginId);
    if (!admin) {
      return res.status(400).json({ message: "ভুল ব্যবহারকারীর নাম বা পাসওয়ার্ড!" });
    }
    
    // schema.methods.comparePassword ব্যবহার করে
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "ভুল ব্যবহারকারীর নাম বা পাসওয়ার্ড!" });
    }
    
    // lastLogin আপডেট
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });
    
    const token = jwt.sign(
      { id: admin._id, email: admin.email, username: admin.username, role: admin.role },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );
    
    res.json({
      token,
      admin: admin.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fix existing admins - add username field
app.post("/api/admin/fix-usernames", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database not connected" });
    }

    const result = await Admin.updateMany(
      { username: { $exists: false } },
      { $set: { username: "superadmin" } }
    );

    res.json({ message: `Fixed ${result.modifiedCount} admin(s)`, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Seed Admin
app.post("/api/admin/seed", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database not connected" });
    }

    const existingAdmin = await Admin.findOne({ email: "superadmin@gmail.com" });
    if (existingAdmin) {
      return res.status(400).json({ message: "Seed admin already exists" });
    }
    
    const admin = await Admin.create({
      name: "কামাল হোসেন",
      username: "superadmin",
      email: "superadmin@gmail.com",
      password: "admin123", // pre-save hook auto-hash করবে
      role: "superadmin",
    });
    
    res.status(201).json({ message: "Admin seeded successfully!", admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected Product Routes
app.get("/api/products", async (_req, res, next) => {
  try {
    const products = mongoose.connection.readyState === 1 
      ? await Product.find().sort({ createdAt: -1 }).lean()
      : [];
    res.json(products);
  } catch (error) {
    next(error);
  }
});

app.get("/api/products/:id", async (req, res, next) => {
  try {
    const product = mongoose.connection.readyState === 1
      ? await Product.findOne({ id: req.params.id }).lean()
      : null;

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

app.post("/api/products", authMiddleware, upload.single("image"), async (req, res, next) => {
  try {
    let imageData = {};
    if (req.file) {
      imageData = await uploadToCloudinary(req.file);
    }
    
    const payload = normalizeProduct(req.body, imageData);
    const product = mongoose.connection.readyState === 1
      ? await Product.create(payload)
      : payload;
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

app.put("/api/products/:id", authMiddleware, upload.single("image"), async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database not connected" });
    }
    
    const existing = await Product.findOne({ id: req.params.id });
    if (!existing) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    let imageData = {};
    if (req.file) {
      imageData = await uploadToCloudinary(req.file);
      if (existing.imagePublicId) {
        await cloudinary.uploader.destroy(existing.imagePublicId);
      }
    }

    const payload = normalizeProduct(
      {
        ...existing.toObject(),
        ...req.body,
        id: req.params.id,
      },
      imageData.secure_url ? imageData : { image: existing.image, imagePublicId: existing.imagePublicId }
    );

    const product = await Product.findOneAndUpdate({ id: req.params.id }, payload, { new: true });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/products/:id", authMiddleware, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database not connected" });
    }
    
    const product = await Product.findOneAndDelete({ id: req.params.id });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

// Dashboard Routes
app.use("/api/dashboard", dashboardRoutes);
// Stock Management Routes
app.use("/api/stock", stockRoutes);
// Category Management Routes
app.use("/api/categories", categoryRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  const status = error.name === "ValidationError" || error.code === 11000 ? 400 : 500;
  res.status(status).json({
    message: error.code === 11000 ? "A product with this id already exists." : error.message || "Server error",
  });
});

const start = async () => {
  if (process.env.MONGODB_URI) {
    console.log("🔗 Connecting to MongoDB...");
    console.log("   URI:", process.env.MONGODB_URI.replace(/:[^:]*@/, ":***@")); // Hide password
    
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("✅ MongoDB connected successfully!");
      console.log("📊 Database name:", mongoose.connection.name);
    } catch (error) {
      console.warn("⚠️ MongoDB connection failed. Server running without DB.");
      console.warn("   Error:", error.name);
      console.warn("   Message:", error.message);
    }
  } else {
    console.warn("⚠️ No MONGODB_URI provided. Server running without DB.");
  }
  
  app.listen(port, () => {
    console.log("🚀 Vision dashboard API running on http://localhost:" + port);
    console.log("📍 Health check: http://localhost:" + port + "/api/health");
  });
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});