import dns from 'node:dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config();

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, { family: 4 });
    const users = await mongoose.connection.db!.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users:`);
    users.forEach(u => console.log(`ID: ${u._id}, Email: ${u.email}, Role: ${u.role}`));
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

listUsers();
