const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.log('Custom DNS set skipped');
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Product = require('./models/Product');
const Order = require('./models/Order');
const { getFormattedDates } = require('./utils/nepaliDate');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON payload parser up to 50mb for image uploads
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Atlas Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://sarmimani12345:sarmimani12345@cluster0.bu0zbla.mongodb.net/mymartDB?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas successfully! (mymartDB)'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// ================= ADMIN AUTH API =================
app.post('/api/admin/verify', (req, res) => {
  const { password } = req.body;
  if (password === '246810') {
    return res.json({ success: true, message: 'Authentication successful' });
  }
  return res.status(401).json({ success: false, message: 'Invalid Admin Password' });
});

// ================= PRODUCT API ROUTES =================

// Get all products (with optional search filter)
app.get('/api/products', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, costPrice, sellingPrice, stock, image } = req.body;
    
    if (!name || costPrice === undefined || sellingPrice === undefined || stock === undefined || !image) {
      return res.status(400).json({ error: 'All fields (Name, Cost Price, Selling Price, Stock, Image) are required' });
    }

    const newProduct = new Product({
      name,
      description: description || '',
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      stock: Number(stock),
      image
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { name, description, costPrice, sellingPrice, stock, image } = req.body;

    const updatedData = {
      name,
      description,
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      stock: Number(stock)
    };
    if (image) {
      updatedData.image = image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product', details: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ================= ORDER API ROUTES =================

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create new customer order
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, phone, address, items } = req.body;

    if (!customerName || !phone || !address || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer Name, Phone No, Address, and at least one Item are required.' });
    }

    // Verify and calculate totals, and update stock
    let totalCostPrice = 0;
    let totalSellingPrice = 0;
    const processedItems = [];

    for (const item of items) {
      const dbProduct = await Product.findById(item.productId);
      if (!dbProduct) {
        return res.status(400).json({ error: `Product "${item.name}" is no longer available.` });
      }

      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for "${dbProduct.name}". Remaining stock: ${dbProduct.stock}` 
        });
      }

      const itemCost = (dbProduct.costPrice || item.costPrice || 0) * item.quantity;
      const itemSelling = (dbProduct.sellingPrice || item.sellingPrice || 0) * item.quantity;

      totalCostPrice += itemCost;
      totalSellingPrice += itemSelling;

      processedItems.push({
        productId: dbProduct._id,
        name: dbProduct.name,
        quantity: item.quantity,
        costPrice: dbProduct.costPrice,
        sellingPrice: dbProduct.sellingPrice
      });

      // Deduct product stock
      dbProduct.stock -= item.quantity;
      await dbProduct.save();
    }

    // Generate custom Order ID and dates
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const orderId = `SM-${randomCode}`;
    const dateInfo = getFormattedDates(new Date());

    const newOrder = new Order({
      orderId,
      dateEnglish: dateInfo.english,
      dateNepali: dateInfo.nepali,
      customerName,
      phone,
      address,
      items: processedItems,
      totalCostPrice,
      totalSellingPrice,
      totalAmount: totalSellingPrice,
      status: 'Pending'
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Update order status (Pending, Confirmed, Delivered, Canceled)
app.put('/api/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Delivered', 'Canceled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );

    if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Delete order
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Delete ALL orders (Clear All Orders)
app.delete('/api/orders', async (req, res) => {
  try {
    await Order.deleteMany({});
    res.json({ message: 'All orders cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear all orders' });
  }
});

// CSV import endpoint removed

// ================= DASHBOARD MONITORING SYSTEM API =================
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const allOrders = await Order.find();

    const totalOrders = allOrders.length;
    
    // Revenue & Profit calculations (Profit added ONLY if status === 'Delivered')
    let totalRevenue = 0;
    let totalProfit = 0;

    allOrders.forEach(order => {
      if (order.status !== 'Canceled') {
        totalRevenue += order.totalAmount || 0;
      }
      // Add profit ONLY if status is Delivered
      if (order.status === 'Delivered') {
        const profit = (order.totalSellingPrice || 0) - (order.totalCostPrice || 0);
        totalProfit += profit;
      }
    });

    res.json({
      totalOrders,
      totalProducts,
      totalRevenue,
      totalProfit
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Serve static frontend build
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Sarmimani Mart Server running on port ${PORT}`);
});
