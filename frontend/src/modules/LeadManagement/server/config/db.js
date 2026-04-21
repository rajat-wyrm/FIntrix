import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Added default DB name 'finedge' to MongoDB URI
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finedge';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;