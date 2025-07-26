import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection details from Clacky environment
const MONGO_HOST = '127.0.0.1';
const MONGO_PORT = '27017';
const MONGO_USER = 'admin';
const MONGO_PASSWORD = 'GNUGxJlp';
const MONGO_DB = 'hotel_management';

const MONGODB_URI = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

interface MongoConnection {
  client: MongoClient;
  db: Db;
}

let cachedConnection: MongoConnection | null = null;

export async function connectToDatabase(): Promise<MongoConnection> {
  if (cachedConnection) {
    return cachedConnection;
  }

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(MONGO_DB);
    
    cachedConnection = {
      client,
      db,
    };
    
    console.log('Connected to MongoDB successfully');
    return cachedConnection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  if (cachedConnection) {
    await cachedConnection.client.close();
    cachedConnection = null;
  }
}