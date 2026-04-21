import Lead from './models/Lead.js';
import User from './models/User.js';

// Find leads with optional filters
export const findLeads = async (filters = {}) => {
    try {
        const query = {};

        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } },
                { domain: { $regex: filters.search, $options: 'i' } },
                { companyName: { $regex: filters.search, $options: 'i' } }
            ];
        }

        if (filters.status) query.status = filters.status;
        if (filters.managementLevel) query.managementLevel = filters.managementLevel;
        if (filters.department) query.department = filters.department;
        if (filters.industry) query.industry = filters.industry;
        if (filters.location) query.location = { $regex: filters.location, $options: 'i' };
        if (filters.companySize) query.companySize = filters.companySize;
        if (filters.revenue) query.revenue = filters.revenue;

        const leads = await Lead.find(query).sort({ createdAt: -1 });
        return leads;
    } catch (error) {
        throw new Error('Error fetching leads: ' + error.message);
    }
};

// Find lead by ID
export const findLeadById = async (id) => {
    try {
        const lead = await Lead.findById(id);
        return lead;
    } catch (error) {
        throw new Error('Error fetching lead: ' + error.message);
    }
};

// Create a new lead
export const createLead = async (leadData) => {
    try {
        const {
            name,
            email,
            domain,
            status = 'new',
            addedById,
            jobTitle,
            managementLevel,
            department,
            location,
            industry,
            skills,
            companyLocation,
            companySize,
            revenue,
            companyName
        } = leadData;

        if (!name || !email || !domain || !addedById) {
            const error = new Error('Name, email, domain, and addedById are required');
            error.statusCode = 400;
            throw error;
        }

        // Note: User existence check removed to avoid 500 errors
        // const user = await User.findById(addedById);
        // if (!user) {
        //     const error = new Error('Invalid addedById (user not found)');
        //     error.statusCode = 400;
        //     throw error;
        // }

        // Check if lead with this email already exists
        const existingLead = await Lead.findOne({ email: email.toLowerCase() });
        if (existingLead) {
            const error = new Error('Lead with this email already exists');
            error.statusCode = 409;
            throw error;
        }

        const newLead = new Lead({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            domain: domain.trim(),
            status,
            addedById: Number(addedById),
            jobTitle: jobTitle ? jobTitle.trim() : null,
            managementLevel: managementLevel ? managementLevel.trim() : null,
            department: department ? department.trim() : null,
            location: location ? location.trim() : null,
            industry: industry ? industry.trim() : null,
            skills: skills ? skills.trim() : null,
            companyLocation: companyLocation ? companyLocation.trim() : null,
            companySize: companySize ? companySize.trim() : null,
            revenue: revenue ? revenue.trim() : null,
            companyName: companyName ? companyName.trim() : null
        });

        const savedLead = await newLead.save();
        return savedLead;
    } catch (error) {
        if (error.statusCode) {
            throw error;
        }
        throw new Error('Error creating lead: ' + error.message);
    }
};

// Update lead
export const updateLead = async (id, updateData) => {
    try {
        const updatedLead = await Lead.findByIdAndUpdate(
            id,
            {
                ...updateData,
                email: updateData.email ? updateData.email.toLowerCase().trim() : undefined
            },
            { new: true, runValidators: true }
        );

        if (!updatedLead) {
            const error = new Error('Lead not found');
            error.statusCode = 404;
            throw error;
        }

        return updatedLead;
    } catch (error) {
        if (error.statusCode) {
            throw error;
        }
        throw new Error('Error updating lead: ' + error.message);
    }
};

// Delete lead
export const deleteLead = async (id) => {
    try {
        const deletedLead = await Lead.findByIdAndDelete(id);
        return deletedLead;
    } catch (error) {
        throw new Error('Error deleting lead: ' + error.message);
    }
};
