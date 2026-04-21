const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const BASE_URL = `${API_BASE_URL}/api/leads`;

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

const getLeads = async (search, filters = {}) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.managementLevel) params.append('managementLevel', filters.managementLevel);
    if (filters.department) params.append('department', filters.department);
    if (filters.industry) params.append('industry', filters.industry);
    if (filters.location) params.append('location', filters.location);
    if (filters.companySize) params.append('companySize', filters.companySize);
    if (filters.revenue) params.append('revenue', filters.revenue);

    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    return handleResponse(response);
};

const getLeadById = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`);
    return handleResponse(response);
};

const createLead = async (leadData) => {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
    });
    return handleResponse(response);
};

const updateLead = async (id, leadData) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
    });
    return handleResponse(response);
};

const uploadProfilePic = async (file) => {
    const formData = new FormData();
    formData.append('profilePic', file);

    const response = await fetch(`${API_BASE_URL}/api/upload/upload`, {
        method: 'POST',
        body: formData,
        // Note: Do not set 'Content-Type' header, the browser will do it with the correct boundary
    });
    return handleResponse(response);
};

const importLeads = async (file, addedById = 1) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('addedById', addedById);

    const response = await fetch(`${BASE_URL}/import`, {
        method: 'POST',
        body: formData,
        // Note: Do not set 'Content-Type' header, the browser will do it with the correct boundary
    });
    return handleResponse(response);
};

const deleteLead = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
    });
    return handleResponse(response);
};

const leadsService = {
    getLeads,
    getLeadById,
    createLead,
    updateLead,
    deleteLead,
    uploadProfilePic,
    importLeads,
};

export default leadsService;