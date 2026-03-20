const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
let MONGODB_URI = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('MONGODB_URI=')) {
    MONGODB_URI = line.replace('MONGODB_URI=', '').trim();
  }
});

async function run() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const bets = await db.collection('bets').find({}).toArray();
    console.log(`TOTAL BETS IN DB: ${bets.length}`);
    const users = await db.collection('users').find({}).toArray();
    console.log(`TOTAL USERS IN DB: ${users.length}`);
  } finally {
    await client.close();
  }
}
run().catch(console.error);
