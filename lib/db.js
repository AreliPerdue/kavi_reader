import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI;


if (!MONGO_URI) {
  throw new Error("Debes definir MONGO_URI en tu archivo .env");
}

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGO_URI);
}
