const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const BASE_URL = `${API_BASE_URL}/api/leads`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const mapLead = (lead) => ({
    ...lead,
    _id: lead.id,
});

const handleResponse = async (response) => {
    const data = await response.json();
    console.log("RAW API RESPONSE:", data);

    if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
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

    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
        headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return {
        leads: (data.data || []).map(mapLead),
        pagination: data.pagination,
    };
};

const getLeadById = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return { lead: mapLead(data.data) };
};

const createLead = async (leadData) => {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(leadData),
    });
    const data = await handleResponse(response);
    return { lead: mapLead(data.data) };
};

const updateLead = async (id, leadData) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(leadData),
    });
    const data = await handleResponse(response);
    return { lead: mapLead(data.data) };
};

const uploadProfilePic = async (file) => {
    const formData = new FormData();
    formData.append('profilePic', file);

    const response = await fetch(`${API_BASE_URL}/api/upload/upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
        body: formData,
        // Note: Do not set 'Content-Type' header, the browser will do it with the correct boundary
    });
    return handleResponse(response);
};

const deleteLead = async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
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
