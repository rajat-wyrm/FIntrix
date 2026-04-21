import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Lead from '../models/Lead.js';

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';

const fixMalformedLeads = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const result = await Lead.updateMany(
            { $or: [{ status: { $exists: false } }, { status: null }] },
            { $set: { status: 'new' } }
        );

        console.log(`Updated ${result.modifiedCount} leads with missing or null status to 'new'.`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (err) {
        console.error('Error updating leads:', err);
        process.exit(1);
    }
};

fixMalformedLeads();
