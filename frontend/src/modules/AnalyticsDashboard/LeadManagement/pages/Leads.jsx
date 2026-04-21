import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card.jsx';
import InputField from '../components/InputField.jsx';
import Button from '../components/Button.jsx';
import leadsService from '../services/leads.js';
import { Plus, Search, Filter, Eye, Edit, Trash2, X, Calendar, Mail, User, Building, Users, CheckCircle, Sparkles, Loader2, MapPin, Briefcase, Zap, DollarSign, ChevronDown } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce.js';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';




const Leads = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ type: '', status: '', managementLevel: '', department: '', industry: '', location: '', companySize: '', revenue: '' });
    const [selectedLead, setSelectedLead] = useState(null);
    const debouncedSearch = useDebounce(search, 500); // 500ms delay
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sidebarMode, setSidebarMode] = useState(null); // 'view', 'add', 'edit'
    const [formData, setFormData] = useState({
        name: '',
        domain: '',
        email: '',
        profilePic: '',
        status: 'new',
    });
    const [formErrors, setFormErrors] = useState({});
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showFilters, setShowFilters] = useState(true); // Make filters visible by default
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [meetingData, setMeetingData] = useState({ date: '', time: '', notes: '' });
    const [emailData, setEmailData] = useState({ subject: '', body: '' });
    const [showAddModal, setShowAddModal] = useState(false);

    const [showImportModal, setShowImportModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [importFile, setImportFile] = useState(null);
    const [showFilterSidebar, setShowFilterSidebar] = useState(false);
    const [focusedField, setFocusedField] = useState(null);



    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const data = await leadsService.getLeads(debouncedSearch, filters);
            setLeads(data.leads || data); // Handle backend response structure
        } catch (err) {
            // If API fails, show error
            setError('API not available: ' + err.message);
            setLeads([]); // No data available
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, filters]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    useEffect(() => {
        // Clean up the object URL to avoid memory leaks
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleViewDetails = async (id) => {
        try {
            const response = await leadsService.getLeadById(id);
            const lead = response.lead || response;
            setSelectedLead(lead);
            // Initialize all fields to ensure controlled inputs
            setFormData({
                name: lead.name || '',
                email: lead.email || '',
                domain: lead.domain || '',
                profilePic: lead.profilePic || '',
                status: lead.status || 'new',
                jobTitle: lead.jobTitle || '',
                managementLevel: lead.managementLevel || '',
                department: lead.department || '',
                location: lead.location || '',
                industry: lead.industry || '',
                skills: lead.skills || '',
                companyLocation: lead.companyLocation || '',
                companySize: lead.companySize || '',
                revenue: lead.revenue || '',
                companyName: lead.companyName || '',
                id: lead._id
            });
            setSidebarMode('view');
            setProfilePicFile(null); // Clear any staged file
            setImagePreview(null); // Clear any image preview
        } catch (err) {
            setError('API not available: ' + err.message);
        }
    };

    const handleCloseSidebar = () => {
        setSelectedLead(null);
        setSidebarMode(null);
        setFormErrors({});
        setProfilePicFile(null);
        setImagePreview(null);
        setShowAddModal(false);
        setShowImportModal(false);
        setImportFile(null);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.domain.trim()) errors.domain = 'Domain is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
        return errors;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);
        try {
            let profilePicUrl = formData.profilePic || '';

            // If a new file is staged for upload, upload it first
            if (profilePicFile) {
                const uploadResponse = await leadsService.uploadProfilePic(profilePicFile);
                profilePicUrl = uploadResponse.filePath;
            }

            const leadData = {
                name: formData.name,
                email: formData.email,
                domain: formData.domain,
                profilePic: profilePicUrl,
                status: formData.status,
                addedById: 1, // Assuming a static user ID for now
                jobTitle: formData.jobTitle,
                managementLevel: formData.managementLevel,
                department: formData.department,
                location: formData.location,
                industry: formData.industry,
                skills: formData.skills,
                companyLocation: formData.companyLocation,
                companySize: formData.companySize,
                revenue: formData.revenue,
                companyName: formData.companyName
            };

            if (sidebarMode === 'edit') {
                const response = await leadsService.updateLead(formData.id, leadData);
                setLeads(prev => prev.map(lead => (lead._id === formData.id ? response.lead : lead)));
                setSelectedLead(response.lead);
                setFormData({ ...response.lead, id: response.lead._id });
                setSidebarMode('view');
            } else {
                const response = await leadsService.createLead(leadData);
                setLeads(prev => [...prev, response.lead]);
                setSelectedLead(response.lead);
                setFormData({ ...response.lead, id: response.lead._id });
                setSidebarMode('view');
            }
            setError(null);
        } catch (err) {
            setError('Failed to save prospect: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicFile(file);
            // Create a temporary URL for the selected file to show a preview
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDeleteLead = async (id) => {
        if (window.confirm('Are you sure you want to delete this prospect?')) {
            try {
                await leadsService.deleteLead(id); // Use _id from MongoDB
                setLeads(prev => prev.filter(lead => lead._id !== id));
                setError(null);
                if (selectedLead && selectedLead._id === id) {
                    handleCloseSidebar();
                }
            } catch (err) {
                setError('Failed to delete lead: ' + err.message);
            }
        }
    };

    // Handler functions for Add Prospect modal
    const handleAddNewClick = () => {
        setShowAddModal(true);
    };

    const handleSearchDatabase = () => {
        setShowAddModal(false);
        window.location.href = '/database';
    };

    const handleImportFromFile = () => {
        setShowAddModal(false);
        setShowImportModal(true);
    };

    const handleCreateManually = () => {
        setShowAddModal(false);
        setFormData({
            name: '',
            domain: '',
            email: '',
            profilePic: '',
            status: 'new',
            jobTitle: '',
            managementLevel: '',
            department: '',
            location: '',
            industry: '',
            skills: '',
            companyLocation: '',
            companySize: '',
            revenue: '',
            companyName: '',
        });
        setFormErrors({});
        setImagePreview(null);
        setSidebarMode('add');
    };



    const handleImportSubmit = async () => {
        if (!importFile) return;

        try {
            setIsSubmitting(true);
            const result = await leadsService.importLeads(importFile);
            alert(result.message || 'Leads imported successfully');
            setShowImportModal(false);
            setImportFile(null);
            fetchLeads(); // Refresh the list
        } catch (err) {
            setError('Failed to import leads: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };



    const handleEditClick = () => {
        setSidebarMode('edit');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return '#3498db';
            case 'contacted': return '#f39c12';
            case 'qualified': return '#27ae60';
            default: return '#95a5a6';
        }
    };

    const handleCloseFilterSidebar = () => {
        setShowFilterSidebar(false);
    };

    const handleClearFilters = () => {
        setFilters({ type: '', status: '', managementLevel: '', department: '', industry: '', location: '', companySize: '', revenue: '' });
    };

    const handleCloseOverlay = () => {
        if (sidebarMode) {
            handleCloseSidebar();
        } else if (showFilterSidebar) {
            handleCloseFilterSidebar();
        }
    };

    return (
        <div>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leads Management</h1>
                        <p className="text-gray-600">Track and manage your potential clients and business opportunities</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="flex items-center p-4 bg-blue-50 border-l-4 border-blue-500">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <div className="text-3xl font-bold text-gray-900">{leads.length}</div>
                                <div className="text-gray-600">Total Prospects</div>
                            </div>
                        </Card>
                        <Card className="flex items-center p-4 bg-yellow-50 border-l-4 border-yellow-500">
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <Sparkles className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <div className="text-3xl font-bold text-gray-900">{leads.filter(l => l && l.status === 'new').length}</div>
                                <div className="text-gray-600">New Prospects</div>
                            </div>
                        </Card>
                        <Card className="flex items-center p-4 bg-green-50 border-l-4 border-green-500">
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <div className="text-3xl font-bold text-gray-900">{leads.filter(l => l && l.status === 'qualified').length}</div>
                                <div className="text-gray-600">Qualified</div>
                            </div>
                        </Card>
                    </div>

                    {/* Search and Filters */}
                    <Card className="mb-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <InputField
                                    placeholder="Search prospects by name, company, or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={() => setShowFilterSidebar(true)}
                                >
                                    <Filter size={16} />
                                    Filters
                                </Button>
                                <Button
                                    variant="primary"
                                    size="small"
                                    onClick={() => setShowAddModal(true)}
                                >
                                    <Plus size={16} />
                                    Add Prospect
                                </Button>
                            </div>
                        </div>

                        {/* Add Prospect Modal */}
                        {showAddModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                                    <h2 className="text-xl font-semibold mb-4">Add New Prospect</h2>
                                    <div className="space-y-3">
                                        <Button
                                            variant="secondary"
                                            className="w-full justify-start"
                                            onClick={handleSearchDatabase}
                                        >
                                            🔍 Search Database
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="w-full justify-start"
                                            onClick={handleImportFromFile}
                                        >
                                            📁 Import from File
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="w-full justify-start"
                                            onClick={handleCreateManually}
                                        >
                                            ✏️ Create Manually
                                        </Button>
                                    </div>
                                    <div className="mt-6 flex justify-end">
                                        <Button
                                            variant="tertiary"
                                            onClick={() => setShowAddModal(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}



                        {/* Import from File Modal */}
                        {showImportModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                                    <h2 className="text-xl font-semibold mb-4">Import from File</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
                                            <input
                                                type="file"
                                                accept=".csv,.xlsx,.xls"
                                                onChange={(e) => setImportFile(e.target.files[0])}
                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                            />
                                            {importFile && (
                                                <p className="mt-2 text-sm text-gray-600">Selected: {importFile.name}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="primary"
                                                onClick={handleImportSubmit}
                                                disabled={!importFile}
                                            >
                                                Import
                                            </Button>
                                            <Button
                                                variant="tertiary"
                                                onClick={() => {
                                                    setShowImportModal(false);
                                                    setImportFile(null);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                    </Card>

                    {/* Loading and Error States */}
                    {
                        loading && (
                            <Card className="text-center py-8">
                                <div className="text-gray-600">Loading prospects...</div>
                            </Card>
                        )
                    }

                    {
                        error && (
                            <Card className="border-red-200 bg-red-50 text-red-800 p-4 mb-6">
                                ⚠️ {error}
                            </Card>
                        )
                    }

                    {/* Leads Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {leads.filter(Boolean).map(lead => (
                            <Card key={lead._id} className="hover:shadow-lg transition-shadow cursor-pointer border" onClick={() => handleViewDetails(lead._id)}>
                                <div className="flex items-start justify-between mb-4">
                                    {lead.profilePic ? (
                                        <img src={`${API_BASE_URL}${lead.profilePic}`} alt={lead.name} className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-lg">
                                            {lead.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <Button
                                            variant="tertiary"
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewDetails(lead._id);
                                            }}
                                        >
                                            <Eye size={16} />
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteLead(lead._id);
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                                    <div className="flex items-center text-gray-600">
                                        <Building size={16} className="mr-2" />
                                        {lead.domain}
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Mail size={16} className="mr-2" />
                                        {lead.email}
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                            lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {lead.status}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(lead.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div >
                {/* {showScheduleModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Schedule Meeting</h2>
                                <button onClick={() => setShowScheduleModal(false)} className="modal-close-btn">✕</button>
                            </div>
                            <form onSubmit={handleScheduleSubmit} className="add-lead-form">
                                <div className="form-group">
                                    <label>Date *</label>
                                    <InputField
                                        type="date"
                                        value={meetingData.date}
                                        onChange={(e) => handleMeetingChange('date', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Time *</label>
                                    <InputField
                                        type="time"
                                        value={meetingData.time}
                                        onChange={(e) => handleMeetingChange('time', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Notes</label>
                                    <textarea
                                        placeholder="Meeting notes..."
                                        value={meetingData.notes}
                                        onChange={(e) => handleMeetingChange('notes', e.target.value)}
                                        className="form-textarea"
                                        rows="3"
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="button" onClick={() => setShowScheduleModal(false)} className="cancel-btn">
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn">
                                        Schedule Meeting
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                */}
                {/* {showEmailModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Send Email</h2>
                                <button onClick={() => setShowEmailModal(false)} className="modal-close-btn">✕</button>
                            </div>
                            <form onSubmit={handleEmailSubmit} className="add-lead-form">
                                <div className="form-group">
                                    <label>Subject *</label>
                                    <InputField
                                        placeholder="Email subject"
                                        value={emailData.subject}
                                        onChange={(e) => handleEmailChange('subject', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Body *</label>
                                    <textarea
                                        placeholder="Email body..."
                                        value={emailData.body}
                                        onChange={(e) => handleEmailChange('body', e.target.value)}
                                        className="form-textarea"
                                        rows="5"
                                        required
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="button" onClick={() => setShowEmailModal(false)} className="cancel-btn">
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn">
                                        Send Email
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                */}

                {/* Sidebar for Viewing, Adding, and Editing Leads */}
                <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${(sidebarMode || showFilterSidebar) ? 'bg-black/50' : 'bg-transparent pointer-events-none'}`} onClick={handleCloseSidebar}></div>
                <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${sidebarMode ? 'translate-x-0' : 'translate-x-full'}`}>
                    {sidebarMode && (
                        <div className="flex flex-col h-full">
                            {/* Sidebar Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {sidebarMode === 'view' && 'Prospect Details'}
                                    {sidebarMode === 'edit' && 'Edit Prospect'}
                                    {sidebarMode === 'add' && 'Add New Prospect'}
                                </h2>
                                <button onClick={handleCloseSidebar} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Sidebar Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {sidebarMode === 'view' && selectedLead && (
                                    <div className="space-y-6">
                                        <div className="flex flex-col items-center text-center">
                                            {selectedLead.profilePic ? (
                                                <img src={`${API_BASE_URL}${selectedLead.profilePic}`} alt={selectedLead.name} className="w-24 h-24 rounded-full object-cover mb-4" />
                                            ) : (
                                                <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-4xl mb-4">
                                                    {selectedLead.name?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <h3 className="text-2xl font-bold text-gray-900">{selectedLead.name}</h3>
                                            <p className="text-gray-600">{selectedLead.domain}</p>
                                            <span className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${selectedLead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                                selectedLead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {selectedLead.status}
                                            </span>
                                        </div>

                                        <div className="border-t border-gray-200 pt-6">
                                            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Professional Information</h4>
                                            <div className="space-y-4">
                                                <div className="flex items-start">
                                                    <Briefcase size={18} className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Job Title</p>
                                                        <p className="text-gray-800">{selectedLead.jobTitle || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <User size={18} className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Management Level</p>
                                                        <p className="text-gray-800">{selectedLead.managementLevel || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <Building size={18} className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Department</p>
                                                        <p className="text-gray-800">{selectedLead.department || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <MapPin size={18} className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Location</p>
                                                        <p className="text-gray-800">{selectedLead.location || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <Zap size={18} className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Industry</p>
                                                        <p className="text-gray-800">{selectedLead.industry || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <CheckCircle size={18} className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Skills</p>
                                                        <p className="text-gray-800">{selectedLead.skills || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 pt-6">
                                            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Company Information</h4>
                                            <div className="space-y-4">
                                                {selectedLead.companyName && (
                                                    <div className="flex items-start">
                                                        <Building size={18} className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Company Name</p>
                                                            <p className="text-gray-800">{selectedLead.companyName}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedLead.companyLocation && (
                                                    <div className="flex items-start">
                                                        <MapPin size={18} className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Company Location</p>
                                                            <p className="text-gray-800">{selectedLead.companyLocation}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedLead.companySize && (
                                                    <div className="flex items-start">
                                                        <Users size={18} className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Company Size</p>
                                                            <p className="text-gray-800">{selectedLead.companySize}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedLead.revenue && (
                                                    <div className="flex items-start">
                                                        <DollarSign size={18} className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Revenue</p>
                                                            <p className="text-gray-800">{selectedLead.revenue}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 pt-6">
                                            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Contact Information</h4>
                                            <div className="space-y-4">
                                                <div className="flex items-start">
                                                    <Mail size={18} className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Email</p>
                                                        <p className="text-gray-800 break-all">{selectedLead.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <Building size={18} className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Domain</p>
                                                        <p className="text-gray-800">{selectedLead.domain}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <Calendar size={18} className="text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Date Added</p>
                                                        <p className="text-gray-800">{new Date(selectedLead.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border-t border-gray-200 pt-6">
                                            <Button variant="primary" className="w-full" onClick={handleEditClick}>
                                                <Edit size={16} className="mr-2" />
                                                Edit Prospect
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {(sidebarMode === 'add' || sidebarMode === 'edit') && (
                                    <form onSubmit={handleFormSubmit} className="space-y-6">
                                        <div>
                                            <div className="flex justify-center mb-4">
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-full object-cover" />
                                                ) : formData.profilePic ? (
                                                    <img src={`${API_BASE_URL}${formData.profilePic}`} alt="Current" className="w-24 h-24 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <User size={48} className="text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                            />
                                            {formData.profilePic && !profilePicFile && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">
                                                        Current image: <span className="font-medium">{formData.profilePic.split('/').pop()}</span>
                                                    </span>
                                                    <Button
                                                        variant="danger"
                                                        size="small"
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, profilePic: '' }));
                                                            setImagePreview(null);
                                                        }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        <InputField
                                            label="Full Name"
                                            placeholder="e.g., Jane Doe"
                                            value={formData.name}
                                            onChange={(e) => handleFormChange('name', e.target.value)}
                                            error={formErrors.name}
                                            required
                                        />
                                        <InputField
                                            label="Domain"
                                            placeholder="e.g., example.com"
                                            value={formData.domain}
                                            onChange={(e) => handleFormChange('domain', e.target.value)}
                                            error={formErrors.domain}
                                            required
                                        />
                                        <InputField
                                            label="Email Address"
                                            type="email"
                                            placeholder="jane.doe@example.com"
                                            value={formData.email}
                                            onChange={(e) => handleFormChange('email', e.target.value)}
                                            error={formErrors.email}
                                            required
                                        />
                                        <InputField
                                            label="Job Title"
                                            placeholder="e.g., Software Engineer"
                                            value={formData.jobTitle}
                                            onChange={(e) => handleFormChange('jobTitle', e.target.value)}
                                        />
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Management Level</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.managementLevel}
                                                    onChange={(e) => handleFormChange('managementLevel', e.target.value)}
                                                    onFocus={() => setFocusedField('managementLevel')}
                                                    onBlur={() => setFocusedField(null)}
                                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white"
                                                >
                                                    <option value="">Select Management Level</option>
                                                    <option value="Entry Level">Entry Level</option>
                                                    <option value="Junior">Junior</option>
                                                    <option value="Senior">Senior</option>
                                                    <option value="Manager">Manager</option>
                                                    <option value="Senior Manager">Senior Manager</option>
                                                    <option value="Director">Director</option>
                                                    <option value="Senior Director">Senior Director</option>
                                                    <option value="VP">VP</option>
                                                    <option value="SVP">SVP</option>
                                                    <option value="C-Level">C-Level</option>
                                                    <option value="Executive">Executive</option>
                                                </select>
                                                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-200 ${focusedField === 'managementLevel' ? 'rotate-180' : ''}`} size={16} />
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.department}
                                                    onChange={(e) => handleFormChange('department', e.target.value)}
                                                    onFocus={() => setFocusedField('department')}
                                                    onBlur={() => setFocusedField(null)}
                                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white"
                                                >
                                                    <option value="">Select Department</option>
                                                    <option value="Engineering">Engineering</option>
                                                    <option value="Product">Product</option>
                                                    <option value="Design">Design</option>
                                                    <option value="Sales">Sales</option>
                                                    <option value="Marketing">Marketing</option>
                                                    <option value="Customer Success">Customer Success</option>
                                                    <option value="HR">HR</option>
                                                    <option value="Finance">Finance</option>
                                                    <option value="Operations">Operations</option>
                                                    <option value="Legal">Legal</option>
                                                    <option value="IT">IT</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-200 ${focusedField === 'department' ? 'rotate-180' : ''}`} size={16} />
                                            </div>
                                        </div>
                                        <InputField
                                            label="Location"
                                            placeholder="e.g., San Francisco, CA"
                                            value={formData.location}
                                            onChange={(e) => handleFormChange('location', e.target.value)}
                                        />
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.industry}
                                                    onChange={(e) => handleFormChange('industry', e.target.value)}
                                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white"
                                                >
                                                    <option value="">Select Industry</option>
                                                    <option value="Technology">Technology</option>
                                                    <option value="Healthcare">Healthcare</option>
                                                    <option value="Finance">Finance</option>
                                                    <option value="Education">Education</option>
                                                    <option value="Retail">Retail</option>
                                                    <option value="Manufacturing">Manufacturing</option>
                                                    <option value="Real Estate">Real Estate</option>
                                                    <option value="Transportation">Transportation</option>
                                                    <option value="Energy">Energy</option>
                                                    <option value="Media">Media</option>
                                                    <option value="Telecommunications">Telecommunications</option>
                                                    <option value="Agriculture">Agriculture</option>
                                                    <option value="Construction">Construction</option>
                                                    <option value="Hospitality">Hospitality</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                        <div className="mt-6">
                                            <InputField
                                                label="Skills"
                                                placeholder="e.g., JavaScript, Python, Leadership"
                                                value={formData.skills}
                                                onChange={(e) => handleFormChange('skills', e.target.value)}
                                            />
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Company Information</h4>
                                            <InputField
                                                label="Company Name"
                                                placeholder="e.g., TechCorp Inc."
                                                value={formData.companyName}
                                                onChange={(e) => handleFormChange('companyName', e.target.value)}
                                            />
                                        </div>
                                        <InputField
                                            label="Company Location"
                                            placeholder="e.g., New York, NY"
                                            value={formData.companyLocation}
                                            onChange={(e) => handleFormChange('companyLocation', e.target.value)}
                                        />
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.companySize}
                                                    onChange={(e) => handleFormChange('companySize', e.target.value)}
                                                    onFocus={() => setFocusedField('companySize')}
                                                    onBlur={() => setFocusedField(null)}
                                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white"
                                                >
                                                    <option value="">Select Company Size</option>
                                                    <option value="1-10">1-10 employees</option>
                                                    <option value="11-50">11-50 employees</option>
                                                    <option value="51-200">51-200 employees</option>
                                                    <option value="201-500">201-500 employees</option>
                                                    <option value="501-1000">501-1000 employees</option>
                                                    <option value="1000+">1000+ employees</option>
                                                </select>
                                                <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-200 ${focusedField === 'companySize' ? 'rotate-180' : ''}`} size={16} />
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Revenue</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.revenue}
                                                    onChange={(e) => handleFormChange('revenue', e.target.value)}
                                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white"
                                                >
                                                    <option value="">Select Revenue Range</option>
                                                    <option value="Under $1M">Under $1M</option>
                                                    <option value="$1M - $10M">$1M - $10M</option>
                                                    <option value="$10M - $50M">$10M - $50M</option>
                                                    <option value="$50M - $100M">$50M - $100M</option>
                                                    <option value="$100M - $500M">$100M - $500M</option>
                                                    <option value="$500M - $1B">$500M - $1B</option>
                                                    <option value="$1B - $5B">$1B - $5B</option>
                                                    <option value="$5B+">$5B+</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.status}
                                                    onChange={(e) => handleFormChange('status', e.target.value)}
                                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white"
                                                    required
                                                >
                                                    <option value="new">New</option>
                                                    <option value="contacted">Contacted</option>
                                                    <option value="qualified">Qualified</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Sidebar Footer (for forms) */}
                            {(sidebarMode === 'add' || sidebarMode === 'edit') && (
                                <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-4">
                                    <Button variant="secondary" className="w-full" onClick={handleCloseSidebar}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary" className="w-full" onClick={handleFormSubmit} disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                <span>Saving...</span>
                                            </div>
                                        ) : (
                                            sidebarMode === 'edit' ? 'Update Prospect' : 'Save Prospect'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Filter Sidebar */}
                <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${showFilterSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full">
                        {/* Filter Sidebar Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
                            <button onClick={handleCloseFilterSidebar} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Filter Sidebar Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={filters.type}
                                        onChange={(e) => handleFilterChange('type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="">All Types</option>
                                        <option value="startup">🚀 Startups</option>
                                        <option value="investor">💼 Investors</option>
                                        <option value="partner">🤝 Partners</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="new">🆕 New</option>
                                        <option value="contacted">📞 Contacted</option>
                                        <option value="qualified">✅ Qualified</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Management Level</label>
                                    <select
                                        value={filters.managementLevel}
                                        onChange={(e) => handleFilterChange('managementLevel', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="">All Levels</option>
                                        <option value="Entry Level">Entry Level</option>
                                        <option value="Junior">Junior</option>
                                        <option value="Senior">Senior</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Senior Manager">Senior Manager</option>
                                        <option value="Director">Director</option>
                                        <option value="Senior Director">Senior Director</option>
                                        <option value="VP">VP</option>
                                        <option value="SVP">SVP</option>
                                        <option value="C-Level">C-Level</option>
                                        <option value="Executive">Executive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <select
                                        value={filters.department}
                                        onChange={(e) => handleFilterChange('department', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="">All Departments</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Product">Product</option>
                                        <option value="Design">Design</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Customer Success">Customer Success</option>
                                        <option value="HR">HR</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Operations">Operations</option>
                                        <option value="Legal">Legal</option>
                                        <option value="IT">IT</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                    <select
                                        value={filters.industry}
                                        onChange={(e) => handleFilterChange('industry', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="">All Industries</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Education">Education</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Manufacturing">Manufacturing</option>
                                        <option value="Real Estate">Real Estate</option>
                                        <option value="Transportation">Transportation</option>
                                        <option value="Energy">Energy</option>
                                        <option value="Media">Media</option>
                                        <option value="Telecommunications">Telecommunications</option>
                                        <option value="Agriculture">Agriculture</option>
                                        <option value="Construction">Construction</option>
                                        <option value="Hospitality">Hospitality</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <InputField
                                        placeholder="e.g., San Francisco"
                                        value={filters.location}
                                        onChange={(e) => handleFilterChange('location', e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                                    <select
                                        value={filters.companySize}
                                        onChange={(e) => handleFilterChange('companySize', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="">All Sizes</option>
                                        <option value="1-10">1-10 employees</option>
                                        <option value="11-50">11-50 employees</option>
                                        <option value="51-200">51-200 employees</option>
                                        <option value="201-500">201-500 employees</option>
                                        <option value="501-1000">501-1000 employees</option>
                                        <option value="1000+">1000+ employees</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Revenue</label>
                                    <select
                                        value={filters.revenue}
                                        onChange={(e) => handleFilterChange('revenue', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="">All Revenue Ranges</option>
                                        <option value="Under $1M">Under $1M</option>
                                        <option value="$1M - $10M">$1M - $10M</option>
                                        <option value="$10M - $50M">$10M - $50M</option>
                                        <option value="$50M - $100M">$50M - $100M</option>
                                        <option value="$100M - $500M">$100M - $500M</option>
                                        <option value="$500M - $1B">$500M - $1B</option>
                                        <option value="$1B - $5B">$1B - $5B</option>
                                        <option value="$5B+">$5B+</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Filter Sidebar Footer */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-4">
                            <Button variant="secondary" className="w-full" onClick={handleClearFilters}>
                                Clear All
                            </Button>
                            <Button variant="primary" className="w-full" onClick={handleCloseFilterSidebar}>
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default Leads;
