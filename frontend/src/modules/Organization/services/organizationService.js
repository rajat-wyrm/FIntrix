import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const ORGANIZATION_ENDPOINT = `${API_URL}/organizations`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const mapToFrontendFormat = (org) => ({
    id: org.id,
    _id: org.id,
    name: org.name,
    website: org.website || '',
    region: org.region || 'Global',
    type: org.type || 'Startup',
    contactName: org.contactName || '',
    created: org.createdAt,
    createdAt: org.createdAt,
});

const mapToBackendFormat = (formData) => ({
    name: formData.name,
    website: formData.website,
    region: formData.region,
    type: formData.type,
    contactName: formData.contactName,
});

const OrganizationService = {
    getOrganizations: async (params = {}) => {
        try {
            const response = await axios.get(ORGANIZATION_ENDPOINT, {
                headers: getAuthHeaders(),
                params,
            });

            return (response.data.data || []).map(mapToFrontendFormat);
        } catch (error) {
            console.error("API Error: Failed to fetch organizations.", error.response?.data);
            throw error;
        }
    },

    getOrganizationDetails: async (id) => {
        try {
            const response = await axios.get(`${ORGANIZATION_ENDPOINT}/${id}`, {
                headers: getAuthHeaders(),
            });

            return mapToFrontendFormat(response.data.data);
        } catch (error) {
            console.error(`API Error: Failed to fetch details for organization ${id}.`, error.response?.data);
            throw error;
        }
    },

    createOrganization: async (orgData) => {
        const dataToSend = mapToBackendFormat(orgData);

        try {
            const response = await axios.post(ORGANIZATION_ENDPOINT, dataToSend, {
                headers: getAuthHeaders(),
            });

            return mapToFrontendFormat(response.data.data);
        } catch (error) {
            console.error("API Error: Failed to create organization.", error.response?.data);
            throw error;
        }
    },

    updateOrganization: async (id, orgData) => {
        const dataToSend = mapToBackendFormat(orgData);

        try {
            const response = await axios.patch(`${ORGANIZATION_ENDPOINT}/${id}`, dataToSend, {
                headers: getAuthHeaders(),
            });

            return mapToFrontendFormat(response.data.data);
        } catch (error) {
            console.error(`API Error: Failed to update organization ${id}.`, error.response?.data);
            throw error;
        }
    },

    deleteOrganization: async (id) => {
        try {
            await axios.delete(`${ORGANIZATION_ENDPOINT}/${id}`, {
                headers: getAuthHeaders(),
            });
            return true;
        } catch (error) {
            console.error(`API Error: Failed to delete organization ${id}.`, error.response?.data);
            throw error;
        }
    },
};

export default OrganizationService;
