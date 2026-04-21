import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import Logo from "../components/Logo";
import SearchToolCard from "../components/analytics/SearchToolCard";
import AnalyticsCard from "../components/analytics/AnalyticsCard";
import { Mail, Globe, Database, Linkedin, Users, TrendingUp, Activity, BarChart3 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart, CartesianGrid } from "recharts";

// PUBLIC DASHBOARD DATA - Demo/Sample data to showcase platform
const searchData = [
  { name: "Mon", searches: 65 },
  { name: "Tue", searches: 78 },
  { name: "Wed", searches: 90 },
  { name: "Thu", searches: 81 },
  { name: "Fri", searches: 95 },
  { name: "Sat", searches: 55 },
  { name: "Sun", searches: 48 },
];

const conversionData = [
  { name: "Jan", rate: 12 },
  { name: "Feb", rate: 19 },
  { name: "Mar", rate: 25 },
  { name: "Apr", rate: 28 },
  { name: "May", rate: 32 },
  { name: "Jun", rate: 38 },
];

const PublicDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex gap-3">
            <Button onClick={() => navigate("/auth")} variant="outline">
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")} className="bg-linear-to-r from-primary to-primary/80">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-primary text-primary-foreground py-4 px-6 text-center">
        <p className="text-sm font-medium">
          Learn how to collect targeted leads from any domain!
          <Button
            onClick={() => navigate("/auth")}
            variant="outline"
            size="sm"
            className="ml-3 border-primary-foreground/30 text-primary hover:bg-primary-foreground hover:text-primary"
          >
            Watch tutorial
          </Button>
          <Button
            onClick={() => navigate("/auth")}
            variant="outline"
            size="sm"
            className="ml-2 border-primary-foreground/30 text-primary hover:bg-primary-foreground hover:text-primary"
          >
            Book a demo
          </Button>
        </p>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-12">
          <h1 className="text-5xl font-bold bg-linear-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
            AI-Powered Lead Generation Analytics
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Unlock targeted leads with advanced search tools. Sign up now to access your personalized analytics dashboard with real-time data!
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="bg-linear-to-r from-primary to-primary/80 text-lg px-8 py-6 shadow-elevated hover:shadow-card transition-all"
          >
            Start Your Free Trial
          </Button>
        </section>

        {/* Demo Analytics Overview */}
        {/* <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-foreground">Demo Analytics Overview</h2>
            <Button onClick={() => navigate("/auth")} variant="outline">
              Sign Up to See Your Data →
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticsCard
              title="Total Searches"
              value="1,234"
              icon={Activity}
              trend="+12% from last month"
              color="primary"
            />
            <AnalyticsCard
              title="Leads Generated"
              value="856"
              icon={Users}
              trend="+18% from last month"
              color="success"
            />
            <AnalyticsCard
              title="Conversion Rate"
              value="38%"
              icon={TrendingUp}
              trend="+5% from last month"
              color="warning"
            />
            <AnalyticsCard
              title="Active Campaigns"
              value="12"
              icon={BarChart3}
              trend="3 new this week"
              color="info"
            />
          </div>
        </section> */}

        {/* Demo Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-primary/10 rounded-lg border-2 border-primary/30 p-6 shadow-card">
            <h3 className="text-xl font-semibold mb-4 text-primary">Weekly Search Activity (Demo)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={searchData}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="searches" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-success/10 rounded-lg border-2 border-success/30 p-6 shadow-card">
            <h3 className="text-xl font-semibold mb-4 text-success">Conversion Trend (Demo)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(var(--success))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--success))", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Search Tools */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-foreground">Our Search Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SearchToolCard
              name="Email Search"
              icon={Mail}
              searches="234"
              percentage="24%"
              color="primary"
            />
            <SearchToolCard
              name="Domain Search"
              icon={Globe}
              searches="198"
              percentage="20%"
              color="success"
            />
            <SearchToolCard
              name="Database Search"
              icon={Database}
              searches="345"
              percentage="35%"
              color="warning"
            />
            <SearchToolCard
              name="Social URL"
              icon={Linkedin}
              searches="207"
              percentage="21%"
              color="info"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-linear-to-r from-primary/10 via-accent/20 to-secondary/10 rounded-2xl p-12 text-center space-y-6 border-2 border-primary/20">
          <h2 className="text-4xl font-bold text-foreground">Ready to Access Your Analytics?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sign up now and start using demo data to explore our powerful analytics dashboard. Upgrade anytime to see your real-time personalized data!
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="bg-linear-to-r from-secondary to-secondary/80 text-lg px-10 py-6 shadow-elevated"
          >
            Create Free Account
          </Button>
        </section>
      </main>
    </div>
  );
};

export default PublicDashboard;
