# vision-frontend

## Run the catalog

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Run with MongoDB and Cloudinary dashboard

1. Create a `.env` file from `.env.example`.
2. Add your MongoDB connection string.
3. Add your Cloudinary cloud name, API key, and API secret.
4. Start both frontend and backend:

```bash
npm run dev:full
```

Open `http://localhost:5173/dashboard` to add products. Product images upload to Cloudinary, and product data saves in MongoDB.

Required `.env` values:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vision-dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
VITE_API_URL=http://localhost:5000/api
```
