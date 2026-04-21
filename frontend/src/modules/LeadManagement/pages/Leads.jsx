import React, { useState, useEffect, useCallback } from 'react';
import leadsService from '../services/leads.js';
import { useTheme } from "../../../context/ThemeContext";
import { ThemeToggle } from "../../../context/ThemeToggle";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  X,
  Calendar,
  Mail,
  User,
  Building,
  Users,
  CheckCircle,
  Loader2,
  MapPin,
  Briefcase,
  DollarSign,
  ChevronDown,
  Database,
  Upload,
  Edit3,
  Sparkles,
} from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce.js';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const filterSelectClass = (darkMode) =>
  `w-full rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 appearance-none ${
    darkMode
      ? "border border-slate-700 bg-slate-800 text-white"
      : "border border-gray-200 bg-white text-gray-700"
  }`;

const inputClass = (darkMode) =>
  `w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 ${
    darkMode
      ? "border border-slate-700 bg-slate-800/80 text-white placeholder-gray-400"
      : "border border-gray-200 bg-white text-gray-800"
  }`;

const sectionTitleClass =
  'text-xs font-semibold uppercase tracking-[0.14em] text-gray-500';

const statCardClass = (darkMode) =>
  darkMode
    ? "rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0f172a] to-[#020617] p-5 shadow-[0_0_25px_rgba(139,92,246,0.15)]"
    : "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm";
const modalCardClass = (darkMode) =>
  darkMode
    ? "w-full max-w-lg rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0f172a] to-[#020617] shadow-2xl"
    : "w-full max-w-lg rounded-2xl border border-gray-100 bg-white shadow-2xl";

const neutralButtonClass = (darkMode) =>
  darkMode
    ? "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 text-white px-4 py-2.5 text-sm font-medium"
    : "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 px-4 py-2.5 text-sm font-medium";
const primaryButtonClass = (darkMode) =>
  `inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
    darkMode
      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/40"
      : "bg-purple-600 hover:bg-purple-700"
  }`;

const subtleIconWrap = (darkMode) =>
  `flex h-11 w-11 items-center justify-center rounded-xl ${
    darkMode
      ? "bg-purple-900/30 text-purple-300"
      : "bg-purple-50 text-purple-600"
  }`;
const Leads = () => {
  const navigate = useNavigate();

const { theme } = useTheme();
const darkMode = theme === "dark";

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    managementLevel: '',
    department: '',
    industry: '',
    location: '',
    companySize: '',
    revenue: '',
  });

  const [selectedLead, setSelectedLead] = useState(null);
  const debouncedSearch = useDebounce(search, 500);
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

  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const data = await leadsService.getLeads(debouncedSearch, filters);
      setLeads(data.leads || data);
      setError(null);
    } catch (err) {
      setError('API not available: ' + err.message);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await leadsService.getLeadById(id);
      const lead = response.lead || response;

      setSelectedLead(lead);
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
        id: lead._id,
      });

      setSidebarMode('view');
      setProfilePicFile(null);
      setImagePreview(null);
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
    if (!formData.name?.trim()) errors.name = 'Name is required';
    if (!formData.domain?.trim()) errors.domain = 'Domain is required';
    if (!formData.email?.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    return errors;
  };

  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      let profilePicUrl = formData.profilePic || '';

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
        addedById: 1,
        jobTitle: formData.jobTitle,
        managementLevel: formData.managementLevel,
        department: formData.department,
        location: formData.location,
        industry: formData.industry,
        skills: formData.skills,
        companyLocation: formData.companyLocation,
        companySize: formData.companySize,
        revenue: formData.revenue,
        companyName: formData.companyName,
      };

      if (sidebarMode === 'edit') {
        const response = await leadsService.updateLead(formData.id, leadData);
        const updatedLead = response.lead || response;
        setLeads((prev) =>
          prev.map((lead) => (lead._id === formData.id ? updatedLead : lead))
        );
        setSelectedLead(updatedLead);
        setFormData({
          name: updatedLead.name || '',
          email: updatedLead.email || '',
          domain: updatedLead.domain || '',
          profilePic: updatedLead.profilePic || '',
          status: updatedLead.status || 'new',
          jobTitle: updatedLead.jobTitle || '',
          managementLevel: updatedLead.managementLevel || '',
          department: updatedLead.department || '',
          location: updatedLead.location || '',
          industry: updatedLead.industry || '',
          skills: updatedLead.skills || '',
          companyLocation: updatedLead.companyLocation || '',
          companySize: updatedLead.companySize || '',
          revenue: updatedLead.revenue || '',
          companyName: updatedLead.companyName || '',
          id: updatedLead._id,
        });
        setSidebarMode('view');
      } else {
        const response = await leadsService.createLead(leadData);
        const newLead = response.lead || response;
        setLeads((prev) => [...prev, newLead]);
        setSelectedLead(newLead);
        setFormData({
          name: newLead.name || '',
          email: newLead.email || '',
          domain: newLead.domain || '',
          profilePic: newLead.profilePic || '',
          status: newLead.status || 'new',
          jobTitle: newLead.jobTitle || '',
          managementLevel: newLead.managementLevel || '',
          department: newLead.department || '',
          location: newLead.location || '',
          industry: newLead.industry || '',
          skills: newLead.skills || '',
          companyLocation: newLead.companyLocation || '',
          companySize: newLead.companySize || '',
          revenue: newLead.revenue || '',
          companyName: newLead.companyName || '',
          id: newLead._id,
        });
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
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm('Are you sure you want to delete this prospect?')) {
      try {
        await leadsService.deleteLead(id);
        setLeads((prev) => prev.filter((lead) => lead._id !== id));
        setError(null);

        if (selectedLead && selectedLead._id === id) {
          handleCloseSidebar();
        }
      } catch (err) {
        setError('Failed to delete lead: ' + err.message);
      }
    }
  };

  const handleSearchDatabase = () => {
    setShowAddModal(false);
    navigate('/tools/database');
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
      fetchLeads();
    } catch (err) {
      setError('Failed to import leads: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = () => {
    setSidebarMode('edit');
  };

  const handleCloseFilterSidebar = () => {
    setShowFilterSidebar(false);
  };

  const handleClearFilters = () => {
    setFilters({
      type: '',
      status: '',
      managementLevel: '',
      department: '',
      industry: '',
      location: '',
      companySize: '',
      revenue: '',
    });
  };

  const totalProspects = leads.length;
  const newProspects = leads.filter((l) => l?.status === 'new').length;
  const qualifiedProspects = leads.filter((l) => l?.status === 'qualified').length;

  const getStatusBadge = (status) => {
  if (status === 'qualified') {
    return darkMode
      ? 'bg-purple-900/40 text-purple-300'
      : 'bg-purple-100 text-purple-700';
  }
  if (status === 'contacted') {
    return darkMode
      ? 'bg-gray-800 text-gray-300'
      : 'bg-gray-100 text-gray-700';
  }
  return darkMode
    ? 'bg-purple-900/20 text-purple-300'
    : 'bg-purple-50 text-purple-700';
};

  const renderField = (label, value, icon) => (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-gray-400">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
       <p className={`text-sm font-medium ${
  darkMode ? "text-white" : "text-gray-800"
}`}>
  {value || 'Not provided'}
</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen p-6 ${
  darkMode 
    ? "bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#1e1b4b] text-white" 
    : "bg-[#f7f7fb] text-gray-900"
}`}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">

  <div>
    <h1 className={`text-3xl font-semibold tracking-tight ${
      darkMode ? "text-white" : "text-gray-900"
    }`}>
      Leads Management
    </h1>

    <p className={`mt-2 text-sm ${
      darkMode ? "text-gray-400" : "text-gray-600"
    }`}>
      Organize prospects, review lead details, and manage outreach from one clean workspace.
    </p>
  </div>

  {/* 🔥 RIGHT SIDE BUTTONS */}
  <div className="flex items-center gap-3">
    <ThemeToggle />
  </div>

</div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className={statCardClass(darkMode)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-500">
                  Total Prospects
                </p>
                <p className={`text-3xl font-semibold ${
  darkMode ? "text-white" : "text-gray-900"
}`}>
                  {totalProspects}
                </p>
              </div>
            <div className={subtleIconWrap(darkMode)}>
                <Users size={20} />
              </div>
            </div>
          </div>

          <div className={statCardClass(darkMode)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-500">
                  New Prospects
                </p>
                <p className={`text-3xl font-semibold ${
  darkMode ? "text-white" : "text-gray-900"}`}>
                  {newProspects}
                </p>
              </div>
             <div className={subtleIconWrap(darkMode)}>
                <Sparkles size={20} />
              </div>
            </div>
          </div>

         <div className={statCardClass(darkMode)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-500">
                  Qualified Leads
                </p>
                <p className={`text-3xl font-semibold ${
  darkMode ? "text-white" : "text-gray-900"}`}>
                  {qualifiedProspects}
                </p>
              </div>
             <div className={subtleIconWrap(darkMode)}>
                <CheckCircle size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Search + Actions */}
       <div className={`mb-6 rounded-2xl p-5 shadow-sm ${
  darkMode
    ? "border border-slate-800 bg-slate-900/60 backdrop-blur-md"
    : "border border-gray-100 bg-white"
}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-purple-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search prospects by name, company, or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 ${
  darkMode
    ? "border border-slate-700 bg-slate-800/80 placeholder-gray-400 text-white"
    : "border border-gray-200 bg-[#fcfcff] text-gray-800"
}`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFilterSidebar(true)}
                className={neutralButtonClass(darkMode)}
              >
                <Filter size={16} />
                Filters
              </button>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className={primaryButtonClass(darkMode)}
              >
                <Plus size={16} />
                Add Prospect
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
         <div className={`mb-6 rounded-2xl px-5 py-10 text-center ${
  darkMode
    ? "border border-slate-800 bg-slate-900/60 text-gray-300"
    : "border border-gray-100 bg-white text-gray-600"
}`}>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Loader2 size={18} className="animate-spin text-purple-600" />
              Loading prospects...
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className={`mb-6 rounded-2xl px-4 py-3 text-sm ${
  darkMode
    ? "border border-red-800 bg-red-900/20 text-red-300"
    : "border border-red-100 bg-red-50 text-red-700"
}`}>
            {error}
          </div>
        )}

        {/* Leads grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {leads.filter(Boolean).map((lead) => (
            <div
              key={lead._id}
              onClick={() => handleViewDetails(lead._id)}
              className={`cursor-pointer rounded-2xl p-5 shadow-lg border transition ${
  darkMode
    ? "bg-gradient-to-br from-[#0f172a] to-[#020617] border-slate-800 hover:scale-[1.02]"
    : "border border-gray-100 bg-white shadow-sm"
}`}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {lead.profilePic ? (
                    <img
                      src={`${API_BASE_URL}${lead.profilePic}`}
                      alt={lead.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-base font-semibold text-purple-700">
                      {lead.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className={`truncate text-base font-semibold ${
  darkMode ? "text-white" : "text-gray-900"}`}>
                      {lead.name}
                    </h3>
                    <p className="truncate text-sm text-gray-500">
                      {lead.companyName || lead.domain}
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => handleViewDetails(lead._id)}
                    className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600"
                  >
                    <Eye size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteLead(lead._id)}
                    className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building size={15} className="text-purple-500" />
                  <span className="truncate">{lead.domain}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={15} className="text-purple-500" />
                  <span className="truncate">{lead.email}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadge(
                    lead.status
                  )}`}
                >
                  {lead.status}
                </span>

                <span className="text-xs text-gray-500">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {!loading && leads.length === 0 && !error && (
           <div className={`rounded-2xl px-6 py-14 text-center ${
  darkMode
    ? "border border-slate-800 bg-slate-900/60"
    : "border border-dashed border-gray-200 bg-white"
}`}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <Users size={24} />
            </div>
            <h3 className={`mb-2 text-lg font-semibold ${
  darkMode ? "text-white" : "text-gray-900"
}`}>
              No prospects found
            </h3>
            <p className="mx-auto max-w-md text-sm text-gray-500">
              Try adjusting your search or filters, or add a new prospect to begin
              building your lead pipeline.
            </p>
          </div>
        )}
      </div>

      {/* Add Prospect Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className={modalCardClass(darkMode)}>
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className={`text-xl font-semibold ${
  darkMode ? "text-white" : "text-gray-900"
}`}>
                    Add Prospect
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose how you want to add a new prospect to your CRM.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                 className={`rounded-lg p-2 ${
  darkMode
    ? "border border-slate-700 bg-slate-800 text-gray-300"
    : "border border-gray-200 bg-white text-gray-600"
}`}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-3 px-6 py-5">
              <button
                type="button"
                onClick={handleSearchDatabase}
               className={`flex w-full items-start gap-4 rounded-2xl p-4 text-left ${
  darkMode
    ? "border border-slate-800 bg-slate-900/60"
    : "border border-gray-200 bg-white"
}`}
              >
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Database size={18} />
                </div>
                <div>
                  <p className={`font-medium ${
  darkMode ? "text-white" : "text-gray-900"
}`}>Search database</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Look for existing contacts and add them quickly.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleImportFromFile}
                className={`flex w-full items-start gap-4 rounded-2xl p-4 text-left ${
  darkMode
    ? "border border-slate-800 bg-slate-900/60"
    : "border border-gray-200 bg-white"
}`}
              >
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Upload size={18} />
                </div>
                <div>
                  <p className={`font-medium ${
  darkMode ? "text-white" : "text-gray-900"
}`}>Import from file</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload a CSV or Excel file to add prospects in bulk.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleCreateManually}
                className={`flex w-full items-start gap-4 rounded-2xl p-4 text-left ${
  darkMode
    ? "border border-slate-800 bg-slate-900/60"
    : "border border-gray-200 bg-white"
}`}
              >
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Edit3 size={18} />
                </div>
                <div>
                  <p className={`font-medium ${
  darkMode ? "text-white" : "text-gray-900"
}`}>
Create manually</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Add one prospect with complete details.
                  </p>
                </div>
              </button>
            </div>

            <div className="flex justify-end border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-sm font-medium text-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl ${
  darkMode
    ? "border border-slate-800 bg-slate-900"
    : "border border-gray-100 bg-white"
}`}>
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className={`text-xl font-semibold ${
  darkMode ? "text-white" : "text-gray-900"
}`}>

                    Import Prospects
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload a CSV or Excel file to add multiple prospects.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                 className={`rounded-lg p-2 ${
  darkMode
    ? "border border-slate-700 bg-slate-800 text-gray-300"
    : "border border-gray-200 bg-white text-gray-600"
}`}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-6 py-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select file
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files[0])}
                className={`block w-full rounded-xl px-3 py-3 text-sm ${
  darkMode
    ? "border border-slate-700 bg-slate-800 text-gray-300"
    : "border border-gray-200 bg-white text-gray-600"
}`}
              />
              {importFile && (
                <p className="mt-3 text-sm text-gray-500">
                  Selected file: <span className="font-medium">{importFile.name}</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                }}
                className="text-sm font-medium text-gray-500"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={!importFile || isSubmitting}
                className={`${primaryButtonClass(darkMode)}${
                  !importFile || isSubmitting ? 'opacity-60' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {(sidebarMode || showFilterSidebar) && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => {
            if (sidebarMode) handleCloseSidebar();
            if (showFilterSidebar) handleCloseFilterSidebar();
          }}
        />
      )}

      {/* Details / Form Sidebar */}
   
<div
  className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform shadow-2xl transition-transform duration-300 ${
    showFilterSidebar ? "translate-x-0" : "translate-x-full"
  } ${
    darkMode
      ? "bg-slate-900 text-white"
      : "bg-white"
  }`}
>
        {sidebarMode && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className={`text-xl font-semibold ${
  darkMode ? "text-white" : "text-gray-900"
}`}>

                {sidebarMode === 'view' && 'Prospect Details'}
                {sidebarMode === 'edit' && 'Edit Prospect'}
                {sidebarMode === 'add' && 'Add Prospect'}
              </h2>
              <button
                type="button"
                onClick={handleCloseSidebar}
                className={`rounded-lg p-2 ${
  darkMode
    ? "border border-slate-700 bg-slate-800 text-gray-300"
    : "border border-gray-200 bg-white text-gray-600"
}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {/* FIX: View mode now reads from formData (which is always fully populated
                  from the API response) instead of selectedLead (which may be a partial
                  object depending on what the API returns). This prevents fields from
                  incorrectly showing "Not provided" when data exists. */}
              {sidebarMode === 'view' && selectedLead && (
                <div className="space-y-8">
                  <div className="rounded-2xl border border-gray-100 bg-[#fcfcff] p-5 text-center">
                    {formData.profilePic ? (
                      <img
                        src={`${API_BASE_URL}${formData.profilePic}`}
                        alt={formData.name}
                        className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-purple-50 text-3xl font-semibold text-purple-700">
                        {formData.name?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <h3 className={`text-xl font-semibold ${
  darkMode ? "text-white" : "text-gray-900"
}`}>

                      {formData.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {formData.domain}
                    </p>
                    <span
                      className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadge(
                        formData.status
                      )}`}
                    >
                      {formData.status}
                    </span>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <p className={`${sectionTitleClass} mb-4`}>
                        Professional Information
                      </p>
                      <div className={`space-y-4 rounded-2xl p-4 ${
  darkMode
    ? "border border-slate-800 bg-slate-900/60"
    : "border border-gray-100 bg-white"
}`}>
                        {renderField('Job Title', formData.jobTitle, <Briefcase size={17} />)}
                        {renderField(
                          'Management Level',
                          formData.managementLevel,
                          <User size={17} />
                        )}
                        {renderField(
                          'Department',
                          formData.department,
                          <Building size={17} />
                        )}
                        {renderField('Location', formData.location, <MapPin size={17} />)}
                        {renderField('Industry', formData.industry, <Sparkles size={17} />)}
                        {renderField('Skills', formData.skills, <CheckCircle size={17} />)}
                      </div>
                    </div>

                    <div>
                      <p className={`${sectionTitleClass} mb-4`}>
                        Company Information
                      </p>
                      <div className={`space-y-4 rounded-2xl p-4 ${
  darkMode
    ? "border border-slate-800 bg-slate-900/60"
    : "border border-gray-100 bg-white"
}`}>
                        {renderField(
                          'Company Name',
                          formData.companyName,
                          <Building size={17} />
                        )}
                        {renderField(
                          'Company Location',
                          formData.companyLocation,
                          <MapPin size={17} />
                        )}
                        {renderField(
                          'Company Size',
                          formData.companySize,
                          <Users size={17} />
                        )}
                        {renderField('Revenue', formData.revenue, <DollarSign size={17} />)}
                      </div>
                    </div>

                    <div>
                      <p className={`${sectionTitleClass} mb-4`}>
                        Contact Information
                      </p>
                      <div className={`space-y-4 rounded-2xl p-4 ${
  darkMode
    ? "border border-slate-800 bg-slate-900/60"
    : "border border-gray-100 bg-white"
}`}>
                        {renderField('Email', formData.email, <Mail size={17} />)}
                        {renderField('Domain', formData.domain, <Building size={17} />)}
                        {renderField(
                          'Date Added',
                          selectedLead.createdAt
                            ? new Date(selectedLead.createdAt).toLocaleDateString()
                            : 'Not provided',
                          <Calendar size={17} />
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleEditClick}
                    className={`${primaryButtonClass(darkMode)} w-full`}
                  >
                    <Edit3 size={16} />
                    Edit Prospect
                  </button>
                </div>
              )}

              {(sidebarMode === 'add' || sidebarMode === 'edit') && (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="rounded-2xl border border-gray-100 bg-[#fcfcff] p-5">
                    <div className="mb-4 flex justify-center">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-24 w-24 rounded-full object-cover"
                        />
                      ) : formData.profilePic ? (
                        <img
                          src={`${API_BASE_URL}${formData.profilePic}`}
                          alt="Current"
                          className="h-24 w-24 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                          <User size={42} />
                        </div>
                      )}
                    </div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Profile Picture
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="block w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-purple-700"
                    />

                    {formData.profilePic && !profilePicFile && (
                      <div className={`mt-3 flex items-center justify-between gap-3 rounded-xl px-3 py-2 ${
  darkMode
    ? "border border-slate-800 bg-slate-900/60"
    : "border border-gray-100 bg-white"
}`} >
                        <span className="truncate text-xs text-gray-500">
                          Current image:{' '}
                          <span className="font-medium">
                            {formData.profilePic.split('/').pop()}
                          </span>
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, profilePic: '' }));
                            setImagePreview(null);
                          }}
                          className="text-xs font-medium text-gray-500"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={`space-y-4 rounded-2xl p-4 ${
  darkMode
    ? "border border-slate-800 bg-slate-900/60"
    : "border border-gray-100 bg-white"
}`}>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Jane Doe"
                        value={formData.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                       className={inputClass(darkMode)}
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Domain
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., example.com"
                        value={formData.domain}
                        onChange={(e) => handleFormChange('domain', e.target.value)}
                       className={inputClass(darkMode)}
                      />
                      {formErrors.domain && (
                        <p className="mt-1 text-xs text-red-600">{formErrors.domain}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="jane.doe@example.com"
                        value={formData.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                      className={inputClass(darkMode)}
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Job Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Software Engineer"
                        value={formData.jobTitle}
                        onChange={(e) => handleFormChange('jobTitle', e.target.value)}
                       className={inputClass(darkMode)}
                      />
                    </div>

                    <div className="relative">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Management Level
                      </label>
                      <select
                        value={formData.managementLevel}
                        onChange={(e) =>
                          handleFormChange('managementLevel', e.target.value)
                        }
                        onFocus={() => setFocusedField('managementLevel')}
                        onBlur={() => setFocusedField(null)}
                      className={filterSelectClass(darkMode)}
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
                      <ChevronDown
                        className={`pointer-events-none absolute right-3 top-[42px] text-gray-400 ${
                          focusedField === 'managementLevel' ? 'rotate-180' : ''
                        }`}
                        size={16}
                      />
                    </div>

                    <div className="relative">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Department
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => handleFormChange('department', e.target.value)}
                        onFocus={() => setFocusedField('department')}
                        onBlur={() => setFocusedField(null)}
                        className={filterSelectClass(darkMode)}
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
                      <ChevronDown
                        className={`pointer-events-none absolute right-3 top-[42px] text-gray-400 ${
                          focusedField === 'department' ? 'rotate-180' : ''
                        }`}
                        size={16}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., San Francisco, CA"
                        value={formData.location}
                        onChange={(e) => handleFormChange('location', e.target.value)}
                        className={inputClass(darkMode)}
                      />
                    </div>

                    <div className="relative">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Industry
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) => handleFormChange('industry', e.target.value)}
                      className={filterSelectClass(darkMode)}
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
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-[42px] text-gray-400"
                        size={16}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Skills
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., JavaScript, Python, Leadership"
                        value={formData.skills}
                        onChange={(e) => handleFormChange('skills', e.target.value)}
                        className={inputClass(darkMode)}
                      />
                    </div>
                  </div>

                  <div className={`space-y-4 rounded-2xl p-4 ${
  darkMode
    ? "border border-slate-800 bg-slate-900/60"
    : "border border-gray-100 bg-white"
}`}>
                    <p className={sectionTitleClass}>Company Information</p>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Company Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., TechCorp Inc."
                        value={formData.companyName}
                        onChange={(e) => handleFormChange('companyName', e.target.value)}
                        className={inputClass(darkMode)}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Company Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., New York, NY"
                        value={formData.companyLocation}
                        onChange={(e) =>
                          handleFormChange('companyLocation', e.target.value)
                        }
                        className={inputClass(darkMode)}
                      />
                    </div>

                    <div className="relative">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Company Size
                      </label>
                      <select
                        value={formData.companySize}
                        onChange={(e) => handleFormChange('companySize', e.target.value)}
                        onFocus={() => setFocusedField('companySize')}
                        onBlur={() => setFocusedField(null)}
                       className={filterSelectClass(darkMode)}
                      >
                        <option value="">Select Company Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                      </select>
                      <ChevronDown
                        className={`pointer-events-none absolute right-3 top-[42px] text-gray-400 ${
                          focusedField === 'companySize' ? 'rotate-180' : ''
                        }`}
                        size={16}
                      />
                    </div>

                    <div className="relative">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Revenue
                      </label>
                      <select
                        value={formData.revenue}
                        onChange={(e) => handleFormChange('revenue', e.target.value)}
                        className={filterSelectClass(darkMode)}
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
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-[42px] text-gray-400"
                        size={16}
                      />
                    </div>

                    <div className="relative">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleFormChange('status', e.target.value)}
                        className={filterSelectClass(darkMode)}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-[42px] text-gray-400"
                        size={16}
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>

            {(sidebarMode === 'add' || sidebarMode === 'edit') && (
              <div className="flex items-center gap-3 border-t border-gray-100 bg-[#fcfcff] px-5 py-4">
                <button
                  type="button"
                  onClick={handleCloseSidebar}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium ${
  darkMode
    ? "border border-slate-700 bg-slate-800 text-gray-300"
    : "border border-gray-200 bg-white text-gray-700"
}`}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleFormSubmit}
                  disabled={isSubmitting}
                 className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium ${
  darkMode
    ? "border border-slate-700 bg-slate-800 text-gray-300"
    : "border border-gray-200 bg-white text-gray-700"
}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </span>
                  ) : sidebarMode === 'edit' ? (
                    'Update Prospect'
                  ) : (
                    'Save Prospect'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Sidebar */}
<div
  className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform shadow-2xl transition-transform duration-300 ${
    showFilterSidebar ? "translate-x-0" : "translate-x-full"
  } ${
    darkMode
      ? "bg-slate-900 text-white"
      : "bg-white"
  }`}
>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className={`text-xl font-semibold ${
  darkMode ? "text-white" : "text-gray-900"
}`}>Filters</h2>
              <p className="mt-1 text-sm text-gray-500">
                Refine the list to find the right prospects faster.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloseFilterSidebar}
              className={`rounded-lg p-2 ${
  darkMode
    ? "border border-slate-700 bg-slate-800 text-gray-300"
    : "border border-gray-200 bg-white text-gray-600"
}`}
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="space-y-5">
              <div className="relative">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className={filterSelectClass(darkMode)}
                >
                  <option value="">All Types</option>
                  <option value="startup">Startups</option>
                  <option value="investor">Investors</option>
                  <option value="partner">Partners</option>
                </select>
              </div>

              <div className="relative">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                 className={filterSelectClass(darkMode)}
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                </select>
              </div>

              <div className="relative">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Management Level
                </label>
                <select
                  value={filters.managementLevel}
                  onChange={(e) =>
                    handleFilterChange('managementLevel', e.target.value)
                  }
                  className={filterSelectClass(darkMode)}
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

              <div className="relative">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Department
                </label>
                <select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className={filterSelectClass(darkMode)}
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

              <div className="relative">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Industry
                </label>
                <select
                  value={filters.industry}
                  onChange={(e) => handleFilterChange('industry', e.target.value)}
                  className={filterSelectClass(darkMode)}
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
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., San Francisco"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                className={inputClass(darkMode)}
                />
              </div>

              <div className="relative">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Company Size
                </label>
                <select
                  value={filters.companySize}
                  onChange={(e) => handleFilterChange('companySize', e.target.value)}
                  className={filterSelectClass(darkMode)}
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

              <div className="relative">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Revenue
                </label>
                <select
                  value={filters.revenue}
                  onChange={(e) => handleFilterChange('revenue', e.target.value)}
                 className={filterSelectClass(darkMode)}
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

          <div className={`flex items-center gap-3 border-t px-5 py-4 ${
  darkMode
    ? "bg-slate-900 border-slate-800"
    : "bg-[#fcfcff] border-gray-100"
}`}>
            <button
              type="button"
              onClick={handleClearFilters}
             className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold ${
  darkMode
    ? "bg-purple-600 text-white hover:bg-purple-500"
    : "bg-purple-600 text-white hover:bg-purple-500"
}`}
            >
              Clear All
            </button>

            <button
              type="button"
              onClick={handleCloseFilterSidebar}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium ${
  darkMode
    ? "border border-slate-700 bg-slate-800 text-gray-300"
    : "border border-gray-200 bg-white text-gray-700"
}`}>
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leads;