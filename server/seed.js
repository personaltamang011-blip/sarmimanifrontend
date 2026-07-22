const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.log('Custom DNS set skipped');
}

const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGO_URI = "mongodb+srv://sarmimani12345:sarmimani12345@cluster0.bu0zbla.mongodb.net/mymartDB?retryWrites=true&w=majority&appName=Cluster0";

const initialProducts = [
  {
    name: "Wireless ANC Headphones",
    description: "High-fidelity active noise canceling headphones with 30hr battery life and crisp bass.",
    costPrice: 2500,
    sellingPrice: 4200,
    stock: 12,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Smart Watch Ultra Series",
    description: "AMOLED touchscreen smartwatch with Heart Rate, SpO2 sensor, and GPS tracking.",
    costPrice: 3800,
    sellingPrice: 6500,
    stock: 8,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Mechanical RGB Gaming Keyboard",
    description: "Custom mechanical switches with customizable RGB lighting and ergonomic wrist rest.",
    costPrice: 1800,
    sellingPrice: 3200,
    stock: 5,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Ergonomic Optical Gaming Mouse",
    description: "16000 DPI high precision sensor with ultra-lightweight honeycomb design.",
    costPrice: 900,
    sellingPrice: 1650,
    stock: 0,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Portable Bluetooth Speaker 20W",
    description: "IPX7 Waterproof outdoor speaker with deep bass and 15-hour playback time.",
    costPrice: 1500,
    sellingPrice: 2800,
    stock: 15,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80"
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas for Seeding!');

    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(initialProducts);
      console.log('✅ Successfully seeded initial products to MongoDB Atlas database (mymartDB)!');
    } else {
      console.log(`ℹ️ Database already contains ${count} products. Skipping seeding.`);
    }
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
