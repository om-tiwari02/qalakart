import mongoose from 'mongoose';
import { Product } from './modules/products/product.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const products = await Product.find().limit(100);
  console.log(JSON.stringify(products, null, 2));
  process.exit(0);
}

run().catch(console.error);
