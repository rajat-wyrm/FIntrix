import axios from 'axios';

const API_URL = 'http://localhost:3000/api/organizations';

const organizationService = {
    getAllOrganizations: async () => {
        const response = await axios.get(API_URL);
        // Backend returns { success: true, organizations: [] }
        return response.data.organizations || [];
    },

    createOrganization: async (orgData) => {
        // Send region, type, contactName directly to the backend
        const response = await axios.post(API_URL, orgData);
        return response.data;
    },

    updateOrganization: async (id, orgData) => {
        const response = await axios.put(`${API_URL}/${id}`, orgData);
        return response.data;
    },

    deleteOrganization: async (id) => {
        await axios.delete(`${API_URL}/${id}`);
        return true;
    }
};

export default organizationService;