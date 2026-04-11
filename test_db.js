const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  console.log("Users:", users.map(u => ({ name: u.name, hasPhoto: !!u.photo, photoLen: u.photo ? u.photo.length : 0 })));
  process.exit(0);
}
check();
