import React from 'react';
import { Link } from 'react-router-dom'; // Link is already imported

const OrganizationCard = ({ organization, onDelete }) => {
  const getIndustryColor = (industry) => {
    const colors = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Finance': 'bg-green-100 text-green-800',
      'Healthcare': 'bg-purple-100 text-purple-800',
      'Retail': 'bg-orange-100 text-orange-800',
      'Education': 'bg-indigo-100 text-indigo-800',
    };
    return colors[industry] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          🏢 {organization.name}
        </h3>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        {organization.region && (
          <p className="flex items-center">
            📍 {organization.region}
          </p>
        )}
        {organization.website && (
          <p className="flex items-center">
            🌐 <a href={`http://${organization.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1 truncate">{organization.website}</a>
          </p>
        )}
        {organization.contact && (
          <p className="flex items-center">
            📞 {organization.contact}
          </p>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <span className={`text-xs px-2 py-1 rounded ${organization.type === 'Active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
          }`}>
          {organization.type}
        </span>

        <div className="flex space-x-3">
          <Link
            to={`/organizations/${organization.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View
          </Link>
          <Link
            to={`/organizations/edit/${organization.id}`}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(organization.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationCard;