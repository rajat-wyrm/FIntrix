import { useState } from "react";
import AnalyticsCard from "../components/analytics/AnalyticsCard";
import { Users, TrendingUp, Activity, BarChart3 } from "lucide-react";
import { 
  BarChart,
  Bar, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart,
  Line, 
  CartesianGrid, 
  PieChart,
  Pie, 
  Cell 
} from "recharts";
import ChatBot from "../components/ChatBot";

const Dashboard = () => {
  // --- Mock Data ---
  const [searchData] = useState([
    { name: "Mon", searches: 142 },
    { name: "Tue", searches: 158 },
    { name: "Wed", searches: 173 },
    { name: "Thu", searches: 165 },
    { name: "Fri", searches: 189 },
    { name: "Sat", searches: 125 },
    { name: "Sun", searches: 98 },
  ]);

  const [conversionData] = useState([
    { name: "Jan", rate: 28 }, 
    { name: "Feb", rate: 32 },
    { name: "Mar", rate: 35 }, 
    { name: "Apr", rate: 38 },
    { name: "May", rate: 42 }, 
    { name: "Jun", rate: 45 },
  ]);

  const [sourceData] = useState([
    { name: "Email", value: 400 },
    { name: "Domain", value: 300 },
    { name: "Database", value: 200 },
    { name: "Social", value: 100 },
  ]);

  const COLORS = ["#00b5ad", "#2dd4bf", "#5eead4", "#99f6e4"];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Main Content - No Header */}
      <main className="p-6 md:p-8 lg:p-12 bg-[#f8fafc]">
        <div className="max-w-[1800px] mx-auto space-y-10">
          
          {/* Top Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticsCard 
              title="Total Searches" 
              value="2,547" 
              icon={Activity} 
              trend="+23% month" 
              color="primary" 
            />
            <AnalyticsCard 
              title="Your Leads" 
              value="1,892" 
              icon={Users} 
              trend="+31% month" 
              color="success" 
            />
            <AnalyticsCard 
              title="Conversion" 
              value="45%" 
              icon={TrendingUp} 
              trend="+7% month" 
              color="warning" 
            />
            <AnalyticsCard 
              title="Active Campaigns" 
              value="18" 
              icon={BarChart3} 
              trend="5 new" 
              color="info" 
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Weekly Activity - Large Chart */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.06)] border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Your Weekly Activity</h3>
                <div className="bg-[#e0f2f1] text-[#00b5ad] px-4 py-2 rounded-2xl text-sm font-bold">
                  Live Data Feed
                </div>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={searchData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12}} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}} 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
                      padding: '12px' 
                    }} 
                  />
                  <Bar 
                    dataKey="searches" 
                    fill="#00b5ad" 
                    radius={[12, 12, 12, 12]} 
                    barSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Lead Sources - Pie Chart */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.06)] border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Lead Sources</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie 
                    data={sourceData} 
                    innerRadius={80} 
                    outerRadius={120} 
                    paddingAngle={8} 
                    dataKey="value"
                    stroke="none"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Conversion Trend */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.06)] border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Conversion Growth Optimization</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#00b5ad" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#00b5ad', strokeWidth: 3, stroke: '#fff' }} 
                  activeDot={{ r: 10 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ChatBot Integration */}
          <ChatBot 
            searchData={searchData} 
            conversionData={conversionData} 
            sourceData={sourceData} 
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;