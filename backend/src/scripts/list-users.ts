import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const users = await mongoose.connection.db!.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users:`);
    users.forEach(u => console.log(`ID: ${u._id}, Email: ${u.email}, Role: ${u.role}`));
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

listUsers();
