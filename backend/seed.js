const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();

const importData = async () => {
  try {
    await connectDB();
    const existingAdmin = await User.findOne({ email: 'admin@shopnest.com' });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      await User.create({
        name: 'Admin User',
        email: 'admin@shopnest.com',
        password: hashedPassword,
        role: 'admin'
      });
    }

    const products = [
      {
        name: 'Wireless Noise-Cancelling Headphones',
        description: 'Immersive sound experience with advanced active noise cancellation.',
        price: 299.99,
        category: 'Electronics',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.8,
        numReviews: 24
      },
      {
        name: 'Minimalist Modern Chair',
        description: 'A stylish and comfortable addition to any contemporary living room.',
        price: 150.00,
        category: 'Furniture',
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.2,
        numReviews: 12
      },
      {
        name: 'Professional DSLR Camera',
        description: 'Capture stunning moments with high-resolution clarity and speed.',
        price: 1199.99,
        category: 'Electronics',
        stock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.9,
        numReviews: 50
      },
      {
        name: 'Classic White Sneakers',
        description: 'Versatile and comfortable, a staple for any casual outfit.',
        price: 85.00,
        category: 'Clothing',
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.5,
        numReviews: 89
      },
      {
        name: 'Bluetooth Portable Speaker',
        description: 'Rich, portable sound with a long-lasting battery for music on the go.',
        price: 2499.00,
        category: 'Electronics',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.6,
        numReviews: 18
      },
      {
        name: 'Everyday Leather Backpack',
        description: 'A practical, durable backpack with room for daily essentials.',
        price: 3299.00,
        category: 'Accessories',
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.4,
        numReviews: 16
      },
      {
        name: 'Minimal Desk Lamp',
        description: 'A clean, adjustable lamp to brighten your desk or bedside table.',
        price: 1599.00,
        category: 'Home',
        stock: 32,
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.3,
        numReviews: 11
      },
      {
        name: 'Insulated Stainless Steel Bottle',
        description: 'Reusable double-wall bottle that keeps drinks at the right temperature.',
        price: 799.00,
        category: 'Accessories',
        stock: 40,
        imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.7,
        numReviews: 27
      },
      {
        name: 'Classic Analog Wristwatch',
        description: 'A versatile everyday watch with a simple, timeless design.',
        price: 2799.00,
        category: 'Accessories',
        stock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.5,
        numReviews: 21
      },
      {
        name: 'Ceramic Coffee Mug Set',
        description: 'A set of two sturdy ceramic mugs for your morning coffee or tea.',
        price: 649.00,
        category: 'Home',
        stock: 35,
        imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        ratings: 4.6,
        numReviews: 14
      }
    ];

    for (const product of products) {
      await Product.updateOne(
        { name: product.name },
        { $setOnInsert: product },
        { upsert: true }
      );
    }
    
    console.log('Demo products are ready. Existing users and products were preserved.');
    await mongoose.connection.close();
    process.exit();
  } catch (error) {
    console.error(`❌ Error with data import: ${error.message}`);
    await mongoose.connection.close();
    process.exit(1);
  }
};

importData();
