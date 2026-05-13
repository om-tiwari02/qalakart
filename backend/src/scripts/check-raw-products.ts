import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const products = await mongoose.connection.db!.collection('products').find({}).toArray();
    console.log(`Raw products count: ${products.length}`);
    if (products.length > 0) {
      console.log('First product sample:', JSON.stringify(products[0], null, 2));
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProducts();
