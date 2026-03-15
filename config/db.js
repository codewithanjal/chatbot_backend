import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // In production, we don't want to kill the process immediately, 
        // as it might be a temporary issue or we want to return a 500 error instead of a crash.
    }
};

export default connectDB;
