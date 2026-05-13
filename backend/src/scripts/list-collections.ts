import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function listCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const collections = await mongoose.connection.db!.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

listCollections();
