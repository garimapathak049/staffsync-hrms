const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', '.mongo_data');
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

(async () => {
  try {
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbPath: dbPath,
        storageEngine: 'wiredTiger',
      },
    });

    console.log(`[MongoMemoryServer] MongoDB is running at: ${mongod.getUri()}`);
    console.log(`[MongoMemoryServer] Data stored in: ${dbPath}`);

    const cleanup = async () => {
      console.log('\n[MongoMemoryServer] Stopping MongoDB...');
      await mongod.stop();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  } catch (err) {
    console.error('[MongoMemoryServer] Error starting MongoDB:', err);
    process.exit(1);
  }
})();
