import React from "react";
import { Search } from "lucide-react"; // ✅ Add this line

const MainLayout = () => {
  const tools = [
    {
      title: "Email Search",
      description:
        "Find verified email addresses for leads by simply entering their name and company.",
      buttonText: "Search Now",
      bgColor: "bg-sky-50",
      textColor: "text-sky-800",
      buttonColor: "bg-sky-500 hover:bg-sky-600",
    },
    {
      title: "Domain Search",
      description:
        "Find employee contacts and email addresses by searching with a company’s domain.",
      buttonText: "Search Now",
      bgColor: "bg-amber-50",
      textColor: "text-amber-800",
      buttonColor: "bg-amber-500 hover:bg-amber-600",
    },
    {
      title: "Database Search",
      description:
        "Identify professionals by name, job, role, location, skills, background, and key career details.",
      buttonText: "Search Now",
      bgColor: "bg-amber-50",
      textColor: "text-amber-800",
      buttonColor: "bg-amber-500 hover:bg-amber-600",
    },
    {
      title: "Social URL Search",
      description:
        "Use our social URL search to extract verified emails from multiple LinkedIn profiles.",
      buttonText: "Search Now",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-800",
      buttonColor: "bg-cyan-500 hover:bg-cyan-600",
    },
  ];

  return (
    <main className="flex-1 p-4 md:p-8 bg-gray-50 overflow-y-auto">
      {/* Welcome Banner */}
      <div className="p-6 rounded-lg bg-teal-500 text-white shadow-md mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          WELCOME DEVANSH, START YOUR LEAD GENERATION JOURNEY NOW
        </h1>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {tools.map((tool) => (
          <div
            key={tool.title}
            className={`p-6 rounded-lg shadow-sm ${tool.bgColor} flex flex-col justify-between`}
          >
            <div>
              <h2 className={`text-xl font-bold mb-2 ${tool.textColor}`}>
                {tool.title}
              </h2>
              <p className={`text-sm mb-6 ${tool.textColor} opacity-90`}>
                {tool.description}
              </p>
            </div>
            <button
              className={`
                flex items-center justify-center gap-2
                w-full sm:w-auto sm:self-start
                px-5 py-2.5 rounded-lg
                text-sm font-semibold text-white
                ${tool.buttonColor}
                transition-all duration-200
                shadow-sm
              `}
            >
              <Search size={16} /> {/* ✅ Fixed */}
              {tool.buttonText}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
};

export default MainLayout;
