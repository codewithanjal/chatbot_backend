import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error('MONGO_URI is not defined in environment variables');
            return;
        }

        // Mongoose connection options for better failure handling
        const options = {
            serverSelectionTimeoutMS: 5000, // Fail after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        };

        console.log('Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(uri, options);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Connection Event Listeners
        mongoose.connection.on('error', err => {
            console.error(`MongoDB Runtime Error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB Disconnected. Attempting to reconnect...');
        });

    } catch (error) {
        console.error(`MongoDB Connection Error Detail: ${error.name} - ${error.message}`);
        
        if (error.name === 'MongooseServerSelectionError') {
            console.error('CRITICAL: Could not connect to any MongoDB servers. Check your IP whitelist and credentials.');
        }

        // Log the URI (sanitized) to help the user verify it's being loaded
        const sanitizedUri = process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@') : 'MISSING';
        console.log(`Connection attempted with URI: ${sanitizedUri}`);
    }
};

export default connectDB;
