const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');
const path = require('path');

async function main() {
  console.log('Starting in-memory MongoDB...');
  const mongod = await MongoMemoryServer.create({ instance: { port: 27017 } });
  const uri = mongod.getUri();
  console.log('MongoDB started at:', uri);

  process.env.MONGO_URI = uri;
  process.env.PORT = '5000';
  process.env.JWT_SECRET = 'padelpro_secret_key_2024';

  const server = spawn('node', [path.join(__dirname, 'server.js')], {
    cwd: '/sessions/gifted-hopeful-hypatia/mnt/padel/backend',
    env: { ...process.env },
    stdio: 'inherit'
  });

  server.on('exit', async (code) => {
    await mongod.stop();
    process.exit(code);
  });
}

main().catch(console.error);
