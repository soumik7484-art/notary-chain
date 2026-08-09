const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is missing.');
  process.exit(1);
}

async function clearDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully.');

    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      const collectionName = collection.collectionName;
      await collection.deleteMany({});
      console.log(`🧹 Cleared collection: ${collectionName}`);
    }

    console.log('🎉 Database successfully wiped clean for launch!');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

clearDatabase();
