import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    domain: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
        default: 'new',
    },
    profilePic: {
        type: String,
        trim: true
    },
    jobTitle: {
        type: String,
        trim: true
    },
    managementLevel: {
        type: String,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    industry: {
        type: String,
        trim: true
    },
    skills: {
        type: String,
        trim: true
    },
    companyName: {
        type: String,
        trim: true
    },
    companyLocation: {
        type: String,
        trim: true
    },
    companySize: {
        type: String,
        trim: true
    },
    revenue: {
        type: String,
        trim: true
    },
    addedById: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
leadSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;