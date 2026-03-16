import mongoose from 'mongoose';

let cachedConnection = null;
let cachedPromise = null;

const connectDB = async () => {
    // If we have a cached connection that is already connected, return it
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }

    // If we are currently connecting, return the existing promise
    if (cachedPromise) {
        return cachedPromise;
    }

    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('MONGO_URI is not defined in environment variables');
        return;
    }

    // Serverless-optimized connection options
    const options = {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        minPoolSize: 1,  // Maintain at least 1 socket connection
        connectTimeoutMS: 10000, // Initial handshake timeout
    };

    console.log('Attempting to connect to MongoDB (New Connection)...');
    
    // Store the connection promise to prevent multiple simultaneous attempts
    cachedPromise = mongoose.connect(uri, options);

    try {
        const conn = await cachedPromise;
        cachedConnection = conn;
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Connection Event Listeners
        mongoose.connection.on('error', err => {
            console.error(`MongoDB Runtime Error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB Disconnected.');
            cachedConnection = null;
            cachedPromise = null;
        });

        return conn;
    } catch (error) {
        cachedPromise = null; // Clear promise on error so next call retries
        console.error(`MongoDB Connection Error Detail: ${error.name} - ${error.message}`);
        
        if (error.name === 'MongooseServerSelectionError') {
            console.error('CRITICAL: Could not connect to any MongoDB servers. Check your IP whitelist (Allow 0.0.0.0/0 for Vercel) and credentials.');
        }

        const sanitizedUri = process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@') : 'MISSING';
        console.log(`Connection attempted with URI: ${sanitizedUri}`);
        throw error; // Throw so the caller knows connection failed
    }
};

export default connectDB;
