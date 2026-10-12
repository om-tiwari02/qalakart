import dns from 'node:dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function deleteAllUsers() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in backend/.env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      family: 4
    });

    const db = mongoose.connection.db!;
    const usersCollection = db.collection('users');

    const totalUsers = await usersCollection.countDocuments({});
    console.log(`Found ${totalUsers} user account(s) in the database.`);

    if (totalUsers === 0) {
      console.log('No user accounts to delete.');
    } else {
      const result = await usersCollection.deleteMany({});
      console.log(`Successfully deleted ${result.deletedCount} user account(s).`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  } catch (error: any) {
    console.error('Failed to delete users:', error?.message || error);
    if (error?.name === 'MongooseServerSelectionError') {
      console.log(
        '\n[IP Whitelist Warning] MongoDB Atlas rejected the connection.\n' +
        'Please whitelist your current IP address (or 0.0.0.0/0 for dev) in the MongoDB Atlas dashboard under Network Access.'
      );
    }
    process.exit(1);
  }
}

deleteAllUsers();
