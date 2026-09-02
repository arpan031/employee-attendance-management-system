require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env")
});

const mongoose = require("mongoose");

jest.setTimeout(30000);

beforeAll(async () => {
  process.env.NODE_ENV = "test";

  process.env.JWT_SECRET = "test-secret-key";
  process.env.APP_TIMEZONE = "Asia/Kolkata";

  const mongoUri = process.env.TEST_MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "TEST_MONGODB_URI is not configured in server/.env"
    );
  }

  await mongoose.connect(mongoUri);

  console.log("Test MongoDB connected");
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});