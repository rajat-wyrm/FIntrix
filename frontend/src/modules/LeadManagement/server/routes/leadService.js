import Lead from '../models/Lead.js';

export const findLeads = async ({ search, status, type, managementLevel, department, industry, location, companySize, revenue }) => {
    const query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { domain: { $regex: search, $options: 'i' } },
            { companyName: { $regex: search, $options: 'i' } },
        ];
    }
    if (status) {
        query.status = status;
    }
    if (type) {
        // Assuming type is not directly in the model, perhaps map to something else or ignore for now
    }
    if (managementLevel) {
        query.managementLevel = managementLevel;
    }
    if (department) {
        query.department = department;
    }
    if (industry) {
        query.industry = industry;
    }
    if (location) {
        query.location = { $regex: location, $options: 'i' };
    }
    if (companySize) {
        query.companySize = companySize;
    }
    if (revenue) {
        query.revenue = revenue;
    }
    return await Lead.find(query);
};

export const findLeadById = async (id) => {
    return await Lead.findById(id);
};

export const createLead = async (leadData) => {
    if (!leadData.name || !leadData.email) {
        const error = new Error('Name and email are required');
        error.statusCode = 400;
        throw error;
    }
    const newLead = new Lead(leadData);
    await newLead.save();
    return newLead;
};

export const updateLead = async (id, updateData) => {
    const updatedLead = await Lead.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedLead) {
        const error = new Error('Lead not found');
        error.statusCode = 404;
        throw error;
    }
    return updatedLead;
};

export const deleteLead = async (id) => {
    const result = await Lead.findByIdAndDelete(id);
    return !!result;
};
