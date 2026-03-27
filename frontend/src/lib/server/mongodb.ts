import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/webforge';
const client = new MongoClient(uri);

let db: Db;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }
  
  await client.connect();
  db = client.db('RealtyBuilder');
  console.log('Connected to MongoDB - RealtyBuilder');
  
  return db;
}

export async function getUsersCollection() {
  const database = await connectToDatabase();
  return database.collection('users');
}

export async function getSitesCollection() {
  const database = await connectToDatabase();
  return database.collection('sites');
}

export default client;