import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error('MONGO_URI is not defined in environment variables');
            return;
        }
        console.log('Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error Detail: ${error.name} - ${error.message}`);
        // Log the URI (sanitized) to help the user verify it's being loaded
        const sanitizedUri = process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@') : 'MISSING';
        console.log(`Connection attempted with URI: ${sanitizedUri}`);
    }
};

export default connectDB;
