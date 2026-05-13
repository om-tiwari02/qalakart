import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../modules/products/product.model.js';

dotenv.config();

async function listProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const products = await Product.find({ isDeleted: false });
    console.log(`Found ${products.length} products:`);
    
    products.forEach((p, index) => {
      console.log(`${index + 1}. Title: ${p.title}, Images: ${JSON.stringify(p.images)}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

listProducts();
