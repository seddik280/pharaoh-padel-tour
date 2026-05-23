// Shared test helpers and setup
const mongoose = require('mongoose');

const TEST_DB = 'mongodb://localhost:27017/padelpro_test';

const connectTestDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB);
  }
};

const disconnectTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
};

const clearCollections = async (...models) => {
  for (const Model of models) {
    await Model.deleteMany({});
  }
};

module.exports = { connectTestDB, disconnectTestDB, clearCollections, TEST_DB };
