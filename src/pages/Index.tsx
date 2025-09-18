import { MetricCard } from "@/components/MetricCard";
import { JobCard } from "@/components/JobCard";
import { CandidateCard } from "@/components/CandidateCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BriefcaseIcon, 
  UserCheck, 
  TrendingUp, 
  Plus,
  Calendar,
  Clock
} from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
  const metrics = [
    { title: "Total Employees", value: "847", change: "+12% from last month", icon: Users, trend: "up" as const },
    { title: "Active Jobs", value: "23", change: "+3 new this week", icon: BriefcaseIcon, trend: "up" as const },
    { title: "Candidates", value: "156", change: "+18% from last month", icon: UserCheck, trend: "up" as const },
    { title: "Hiring Rate", value: "78%", change: "+5% from last month", icon: TrendingUp, trend: "up" as const },
  ];

  const recentJobs = [
    {
      id: "1",
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      applicants: 24,
      status: "active" as const,
      postedDate: "2 days ago"
    },
    {
      id: "2",
      title: "Product Manager",
      department: "Product",
      location: "Remote",
      type: "Full-time", 
      applicants: 18,
      status: "active" as const,
      postedDate: "1 week ago"
    },
    {
      id: "3",
      title: "UX Designer",
      department: "Design",
      location: "New York, NY",
      type: "Contract",
      applicants: 12,
      status: "draft" as const,
      postedDate: "3 days ago"
    }
  ];

  const topCandidates = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1 (555) 123-4567",
      position: "Frontend Developer",
      location: "San Francisco, CA",
      status: "interview" as const,
      rating: 5
    },
    {
      id: "2", 
      name: "Mike Chen",
      email: "mike.chen@email.com",
      phone: "+1 (555) 234-5678",
      position: "Product Manager",
      location: "Remote",
      status: "offer" as const,
      rating: 4
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div 
        className="relative rounded-xl overflow-hidden bg-gradient-primary text-white p-8"
        style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome to TalentFlow</h1>
          <p className="text-white/90 text-lg mb-6">
            Streamline your HR processes and find the best talent for your organization
          </p>
          <div className="flex gap-3">
            <Button className="bg-white text-primary hover:bg-white/90">
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Interview
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BriefcaseIcon className="h-5 w-5" />
                Recent Job Postings
              </CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentJobs.map((job) => (
                <JobCard key={job.id} {...job} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Top Candidates */}
        <div>
          <Card className="bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Top Candidates
              </CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {topCandidates.map((candidate) => (
                <CandidateCard key={candidate.id} {...candidate} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "New application received", candidate: "Emma Davis", job: "Senior Designer", time: "2 hours ago" },
              { action: "Interview scheduled", candidate: "John Smith", job: "Backend Developer", time: "4 hours ago" },
              { action: "Job posting published", job: "Marketing Manager", time: "1 day ago" },
              { action: "Offer accepted", candidate: "Lisa Wong", job: "Data Analyst", time: "2 days ago" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.candidate && `${activity.candidate} - `}{activity.job}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
