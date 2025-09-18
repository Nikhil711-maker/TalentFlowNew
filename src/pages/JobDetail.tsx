import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Building, Calendar, Edit, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Job, Candidate } from '@/lib/db';
import { jobsApi, candidatesApi } from '@/lib/api';
import { toast } from 'sonner';
import { AssessmentBuilder } from '@/components/AssessmentBuilder';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const loadJobData = async () => {
      try {
        // For demo purposes, we'll get the job from the jobs list
        // In a real app, you'd have a dedicated endpoint
        const jobsResponse = await jobsApi.getJobs();
        const foundJob = jobsResponse.data.find(j => j.id === id);
        
        if (!foundJob) {
          toast.error('Job not found');
          navigate('/jobs');
          return;
        }
        
        setJob(foundJob);
        
        // Load candidates for this job
        const candidatesResponse = await candidatesApi.getCandidates({ pageSize: 100 });
        const jobCandidates = candidatesResponse.data.filter(c => c.jobId === id);
        setCandidates(jobCandidates);
      } catch (error) {
        toast.error('Failed to load job details');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadJobData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Job not found</h2>
        <p className="text-muted-foreground mb-4">The job you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/jobs')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const stageCounts = candidates.reduce((acc, candidate) => {
    acc[candidate.stage] = (acc[candidate.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/jobs')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <Badge className={getStatusColor(job.status)}>
              {job.status}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Job
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{candidates.length}</p>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stageCounts.applied || 0}</p>
                <p className="text-sm text-muted-foreground">New Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stageCounts.screen || 0}</p>
                <p className="text-sm text-muted-foreground">In Screening</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stageCounts.hired || 0}</p>
                <p className="text-sm text-muted-foreground">Hired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="candidates">Candidates ({candidates.length})</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{job.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {job.requirements?.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Application Pipeline</CardTitle>
              <CardDescription>Current status of all candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[
                  { stage: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-800' },
                  { stage: 'screen', label: 'Screening', color: 'bg-yellow-100 text-yellow-800' },
                  { stage: 'tech', label: 'Technical', color: 'bg-purple-100 text-purple-800' },
                  { stage: 'offer', label: 'Offer', color: 'bg-orange-100 text-orange-800' },
                  { stage: 'hired', label: 'Hired', color: 'bg-green-100 text-green-800' },
                  { stage: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' }
                ].map(({ stage, label, color }) => (
                  <div key={stage} className="text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${color} text-lg font-semibold`}>
                      {stageCounts[stage] || 0}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((candidate) => (
              <Card key={candidate.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/candidates/${candidate.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{candidate.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {candidate.stage}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{candidate.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Applied {candidate.appliedAt.toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {candidates.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No candidates yet</h3>
              <p className="text-muted-foreground">Candidates will appear here when they apply to this job.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="assessment" className="space-y-4">
          <AssessmentBuilder jobId={job.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}