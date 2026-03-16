import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';

dotenv.config();

console.log('--- Database Connection Verification Test ---');

// Set a short timeout for the test
const testTimeout = setTimeout(() => {
    console.error('Test timed out after 10 seconds. Connection likely hanging.');
    process.exit(1);
}, 10000);

try {
    await connectDB();
    
    // Give it a moment to stabilize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Mongoose Ready State:', mongoose.connection.readyState);
    
    if (mongoose.connection.readyState === 1) {
        console.log('SUCCESS: Connected to database.');
    } else {
        console.log('WARNING: Not connected. ReadyState:', mongoose.connection.readyState);
        console.log('This is expected if your credentials in .env are still placeholders.');
    }
} catch (error) {
    console.error('Test caught an error:', error);
} finally {
    clearTimeout(testTimeout);
    await mongoose.disconnect();
    process.exit(0);
}
