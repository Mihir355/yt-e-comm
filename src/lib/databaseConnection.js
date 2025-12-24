const MONGODB_URL = process.env.MONGODB_URI;
import mongoose from "mongoose";
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

export const connectDB = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise)
    cached.promise = mongoose.connect(MONGODB_URL, {
      bufferCommands: false,
      dbName: "ecommerce-db",
    });

  return (cached.conn = await cached.promise);
};
