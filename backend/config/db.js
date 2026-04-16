import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      family: 4, // Force IPv4
      directConnection: false,
      retryWrites: true,
      w: 'majority'
    });

    console.log("MongoDB Connected");
  } catch (error) {
    console.log("DB Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;