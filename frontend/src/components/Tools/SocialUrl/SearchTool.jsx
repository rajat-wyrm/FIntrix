import React, { useState, useRef } from "react";
import { Check, Loader2 } from "lucide-react";
import DiagramSection from "./DiagramSection";

const SearchTool = () => {
  const [file, setFile] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setShowResults(false);
    }
  };

  const handleSearch = () => {
    if (!file) {
      alert("Please upload a file first!");
      return;
    }
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
      setShowResults(true);
    }, 2000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
       <h1 className="text-xl font-bold text-gray-700 mb-6 text-center md:text-left">Social URL Search</h1>
      
      {/* Search Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:p-8 mb-8 md:mb-12">
        <p className="text-gray-600 text-sm mb-6 leading-relaxed max-w-3xl mx-auto md:mx-0 text-center md:text-left">
          Upload a CSV or TXT file containing LinkedIn profile links to extract email addresses associated with each profile.
          Our system will process the file and provide you with a list of email addresses linked to the profiles.
        </p>
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".csv,.txt"
        />

        <div 
          className="border border-gray-300 rounded px-4 py-2 flex flex-col sm:flex-row items-center justify-center sm:justify-start mb-8 max-w-4xl hover:border-teal-400 transition-colors cursor-pointer gap-2 sm:gap-0 mx-auto md:mx-0" 
          onClick={() => fileInputRef.current?.click()}
        >
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium px-3 py-1 rounded transition-colors w-full sm:w-auto sm:mr-3 pointer-events-none">
            Choose File
          </button>
          <span className={`text-sm truncate max-w-[200px] ${file ? 'text-teal-600 font-medium' : 'text-gray-500'}`}>
            {file ? file.name : 'No file chosen'}
          </span>
        </div>
        
        <div className="flex flex-col items-center">
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className={`w-full sm:w-auto bg-[#CFFAFA] hover:bg-[#bbf3f3] text-teal-900 font-bold py-3 px-16 rounded-lg text-sm transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isSearching ? 'pl-12' : ''}`}
            >
              {isSearching ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Processing...
                </>
              ) : (
                'Search'
              )}
            </button>

            {showResults && (
              <div className="mt-8 w-full max-w-2xl bg-teal-50 border border-teal-100 rounded-lg p-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2 text-teal-800 font-semibold mb-3">
                  <Check size={18} />
                  Processing Complete
                </div>
                <div className="bg-white rounded border border-gray-100 overflow-hidden">
                  <div className="p-3 border-b border-gray-50 flex justify-between text-sm text-gray-500 bg-gray-50">
                    <span>Profile</span>
                    <span>Status</span>
                  </div>
                  <div className="p-3 border-b border-gray-50 flex flex-col sm:flex-row justify-between text-sm items-start sm:items-center gap-2">
                    <span className="font-medium text-gray-700 truncate max-w-[150px] sm:max-w-none">linkedin.com/in/jdoe</span>
                    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs border border-green-100 whitespace-nowrap">Found: jdoe@company.com</span>
                  </div>
                   <div className="p-3 border-b border-gray-50 flex flex-col sm:flex-row justify-between text-sm items-start sm:items-center gap-2">
                    <span className="font-medium text-gray-700 truncate max-w-[150px] sm:max-w-none">linkedin.com/in/sarah-s</span>
                    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs border border-green-100 whitespace-nowrap">Found: sarah.s@tech.io</span>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Info Section - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Left Diagram */}
        <div className="flex justify-center px-2 md:px-8 order-2 md:order-1">
             <DiagramSection />
        </div>

        {/* Right Content */}
        <div className="order-1 md:order-2 text-center md:text-left">
          <h2 className="text-lg font-bold text-gray-700 mb-6">
            Reach leads effectively with a multichannel strategy
          </h2>
          <ul className="space-y-4 inline-block text-left">
            {[
              "Process up to 20,000 profiles simultaneously",
              "Identify professional contacts through social media",
              "Experience reliable insights with pre-verified results"
            ].map((text, idx) => (
              <li key={idx} className="flex items-start gap-3 group">
                <div className="mt-1 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Check size={16} className="text-orange-500" strokeWidth={3} />
                </div>
                <span className="text-gray-600 text-sm group-hover:text-gray-800 transition-colors">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchTool;

