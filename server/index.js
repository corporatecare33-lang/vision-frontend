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
import Category from "./models/Category.js";
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

// Seed Categories
const seedCategoriesData = [
  {
    id: "tvs", name: "TVs", shortName: "Televisions", path: "/category/tvs",
    tone: "from-cyan-50 via-white to-blue-100", accent: "#0b3474", image: "",
    tagline: "Brilliant screens for every room",
    description: "Smart entertainment, sharp color, and immersive sound for modern homes.",
    isActive: true, sortOrder: 1,
    subcategories: [
      { id: "smart-tv", name: "Smart TV", tagline: "Streaming-ready displays with easy controls.", path: "/category/tvs/smart-tv", banner: "/banners/smart-tv.jpg" },
      { id: "android-tv", name: "Android TV", tagline: "Apps, voice search, and cinematic clarity.", path: "/category/tvs/android-tv", banner: "/banners/android-tv.jpg" },
      { id: "led-tv", name: "LED TV", tagline: "Reliable everyday entertainment.", path: "/category/tvs/led-tv", banner: "/banners/led-tv.jpg" },
      { id: "4k-uhd-tv", name: "4K UHD TV", tagline: "Ultra-sharp picture with richer contrast.", path: "/category/tvs/4k-uhd-tv", banner: "/banners/4k-uhd-tv.jpg" },
    ],
  },
  {
    id: "kettles", name: "Kettles", shortName: "Kettles", path: "/category/kettles",
    tone: "from-cyan-50 via-white to-emerald-50", accent: "#28c7cf", image: "",
    tagline: "Fast boiling, clean design",
    description: "Compact kitchen essentials for tea, coffee, and everyday cooking.",
    isActive: true, sortOrder: 2,
    subcategories: [
      { id: "electric-kettle", name: "Electric Kettle", tagline: "Quick boil performance with durable bodies.", path: "/category/kettles/electric-kettle", banner: "/banners/electric-kettle.jpg" },
      { id: "smart-kettle", name: "Smart Kettle", tagline: "Temperature presets and keep-warm comfort.", path: "/category/kettles/smart-kettle", banner: "/banners/smart-kettle.jpg" },
    ],
  },
  {
    id: "refrigerators", name: "Refrigerators / Freezers", shortName: "Cooling", path: "/category/refrigerators",
    tone: "from-blue-50 via-white to-cyan-100", accent: "#0b3474", image: "",
    tagline: "Freshness made beautifully simple",
    description: "Energy-aware cooling systems for homes, stores, and busy kitchens.",
    isActive: true, sortOrder: 3,
    subcategories: [
      { id: "side-by-side", name: "Side by Side", tagline: "Wide storage, dispenser-ready convenience.", path: "/category/refrigerators/side-by-side", banner: "/banners/side-by-side.jpg" },
      { id: "no-frost", name: "No Frost", tagline: "Even cooling without manual defrosting.", path: "/category/refrigerators/no-frost", banner: "/banners/no-frost.jpg" },
      { id: "direct-cool", name: "Direct Cool", tagline: "Durable cooling for everyday family use.", path: "/category/refrigerators/direct-cool", banner: "/banners/direct-cool.jpg" },
      { id: "beverage-cooler", name: "Beverage Cooler", tagline: "Commercial display cooling for drinks.", path: "/category/refrigerators/beverage-cooler", banner: "/banners/beverage-cooler.jpg" },
      { id: "commercial-freezer", name: "Deep Freezer", tagline: "High-capacity frozen storage.", path: "/category/refrigerators/commercial-freezer", banner: "/banners/commercial-freezer.jpg" },
      { id: "four-door", name: "Four Door", tagline: "Flexible premium storage zones.", path: "/category/refrigerators/four-door", banner: "/banners/four-door.jpg" },
      { id: "single-door", name: "Single Door", tagline: "Compact in size, big on freshness.", path: "/category/refrigerators/single-door", banner: "/banners/single-door.jpg" },
    ],
  },
  {
    id: "home-appliances", name: "Home Appliances", shortName: "Home Appliances", path: "/category/home-appliances",
    tone: "from-cyan-50 via-white to-slate-50", accent: "#159ba5", image: "",
    tagline: "Daily comfort, quietly handled",
    description: "Practical home appliances for cleaning, comfort, and routine care.",
    isActive: true, sortOrder: 4,
    subcategories: [
      { id: "washing-machine", name: "Washing Machine", tagline: "Gentle wash programs with strong motors.", path: "/category/home-appliances/washing-machine", banner: "/banners/washing-machine.jpg" },
      { id: "air-conditioner", name: "Air Conditioner", tagline: "Efficient cooling for hot days.", path: "/category/home-appliances/air-conditioner", banner: "/banners/air-conditioner.jpg" },
      { id: "microwave-oven", name: "Microwave Oven", tagline: "Fast heating, cooking, and reheating.", path: "/category/home-appliances/microwave-oven", banner: "/banners/microwave-oven.jpg" },
      { id: "fan", name: "Fan", tagline: "Reliable air flow for every room.", path: "/category/home-appliances/fan", banner: "/banners/fan.jpg" },
    ],
  },
  {
    id: "kitchen-appliances", name: "Kitchen Appliances", shortName: "Kitchen", path: "/category/kitchen-appliances",
    tone: "from-emerald-50 via-white to-cyan-50", accent: "#159ba5", image: "",
    tagline: "Helpful tools for everyday cooking",
    description: "Smart kitchen appliances for faster prep, cooking, and serving.",
    isActive: true, sortOrder: 5,
    subcategories: [
      { id: "rice-cooker", name: "Rice Cooker", tagline: "Simple cooking with steady heat control.", path: "/category/kitchen-appliances/rice-cooker", banner: "/banners/rice-cooker.jpg" },
      { id: "blender", name: "Blender", tagline: "Smooth blending for drinks and recipes.", path: "/category/kitchen-appliances/blender", banner: "/banners/blender.jpg" },
      { id: "induction-cooker", name: "Induction Cooker", tagline: "Fast electric cooking with precise control.", path: "/category/kitchen-appliances/induction-cooker", banner: "/banners/induction-cooker.jpg" },
    ],
  },
  {
    id: "small-appliances", name: "Small Appliances", shortName: "Small Appliances", path: "/category/small-appliances",
    tone: "from-slate-50 via-white to-cyan-50", accent: "#0b3474", image: "",
    tagline: "Everyday helpers for a smoother home",
    description: "Compact appliances for cleaning, garment care, water heating, and daily comfort.",
    isActive: true, sortOrder: 6,
    subcategories: [
      { id: "vacuum-cleaner", name: "Vacuum Cleaner", tagline: "Easy cleaning power.", path: "/category/small-appliances/vacuum-cleaner", banner: "/banners/vacuum-cleaner.jpg" },
      { id: "electric-iron", name: "Electric Iron", tagline: "Quick heat and smooth pressing.", path: "/category/small-appliances/electric-iron", banner: "/banners/electric-iron.jpg" },
      { id: "water-heater", name: "Water Heater", tagline: "Reliable warm water comfort.", path: "/category/small-appliances/water-heater", banner: "/banners/water-heater.jpg" },
      { id: "room-heater", name: "Room Heater", tagline: "Compact warmth for winter evenings.", path: "/category/small-appliances/room-heater", banner: "/banners/room-heater.jpg" },
      { id: "hair-dryer", name: "Hair Dryer", tagline: "Fast drying with simple control.", path: "/category/small-appliances/hair-dryer", banner: "/banners/hair-dryer.jpg" },
    ],
  },
  {
    id: "audio", name: "Audio", shortName: "Audio", path: "/category/audio",
    tone: "from-blue-50 via-white to-slate-100", accent: "#159ba5", image: "",
    tagline: "Sound for movies, music, and daily entertainment",
    description: "Home audio products that pair naturally with televisions.",
    isActive: true, sortOrder: 7,
    subcategories: [
      { id: "soundbar", name: "Soundbar", tagline: "Slim TV sound upgrades.", path: "/category/audio/soundbar", banner: "/banners/soundbar.jpg" },
      { id: "bluetooth-speaker", name: "Bluetooth Speaker", tagline: "Portable wireless sound.", path: "/category/audio/bluetooth-speaker", banner: "/banners/bluetooth-speaker.jpg" },
      { id: "home-theater", name: "Home Theater", tagline: "Bigger surround sound.", path: "/category/audio/home-theater", banner: "/banners/home-theater.jpg" },
    ],
  },
  {
    id: "commercial", name: "Commercial Appliances", shortName: "Commercial", path: "/category/commercial",
    tone: "from-cyan-50 via-white to-blue-50", accent: "#0b3474", image: "",
    tagline: "Appliances built for business use",
    description: "Commercial-ready cooling and utility appliances.",
    isActive: true, sortOrder: 8,
    subcategories: [
      { id: "water-dispenser", name: "Water Dispenser", tagline: "Hot and cold drinking water.", path: "/category/commercial/water-dispenser", banner: "/banners/water-dispenser.jpg" },
      { id: "display-freezer", name: "Display Freezer", tagline: "Visible frozen storage.", path: "/category/commercial/display-freezer", banner: "/banners/display-freezer.jpg" },
      { id: "display-cooler", name: "Display Cooler", tagline: "Glass-door beverage display.", path: "/category/commercial/display-cooler", banner: "/banners/display-cooler.jpg" },
    ],
  },
];

app.post("/api/categories/seed", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database not connected" });
    }

    await Category.deleteMany({});
    const created = await Category.insertMany(seedCategoriesData);
    res.status(201).json({ message: `${created.length} categories seeded successfully!`, categories: created });
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