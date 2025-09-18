import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Archive, Edit, Eye } from 'lucide-react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Job } from '@/lib/db';
import { jobsApi } from '@/lib/api';
import { toast } from 'sonner';
import { JobForm } from '@/components/JobForm';
import { useNavigate } from 'react-router-dom';

interface SortableJobProps {
  job: Job;
  onEdit: (job: Job) => void;
  onArchive: (job: Job) => void;
}

function SortableJob({ job, onEdit, onArchive }: SortableJobProps) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <Card ref={setNodeRef} style={style} className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:cursor-grabbing p-2 hover:bg-muted rounded"
            >
              ⋮⋮
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 
                  className="text-lg font-semibold hover:text-primary cursor-pointer"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  {job.title}
                </h3>
                <Badge className={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {job.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground">
                {job.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onEdit(job)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArchive(job)}>
                  <Archive className="h-4 w-4 mr-2" />
                  {job.status === 'active' ? 'Archive' : 'Unarchive'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('order');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsApi.getJobs({
        search,
        status: statusFilter,
        page,
        pageSize: 10,
        sort
      });
      setJobs(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to load jobs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [search, statusFilter, sort, page]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = jobs.findIndex(job => job.id === active.id);
    const newIndex = jobs.findIndex(job => job.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistic update
    const reorderedJobs = [...jobs];
    const [movedJob] = reorderedJobs.splice(oldIndex, 1);
    reorderedJobs.splice(newIndex, 0, movedJob);
    setJobs(reorderedJobs);

    try {
      await jobsApi.reorderJob(
        active.id as string,
        jobs[oldIndex].order,
        jobs[newIndex].order
      );
      toast.success('Job reordered successfully');
      loadJobs(); // Refresh to get correct order
    } catch (error) {
      // Rollback on error
      setJobs(jobs);
      toast.error('Failed to reorder job');
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleArchive = async (job: Job) => {
    try {
      const newStatus = job.status === 'active' ? 'archived' : 'active';
      await jobsApi.updateJob(job.id, { status: newStatus });
      toast.success(`Job ${newStatus === 'active' ? 'unarchived' : 'archived'} successfully`);
      loadJobs();
    } catch (error) {
      toast.error('Failed to update job status');
    }
  };

  const handleJobSave = () => {
    setShowJobForm(false);
    setEditingJob(null);
    loadJobs();
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">Manage your job postings</p>
        </div>
        <Button onClick={() => setShowJobForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Job
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="order">Custom Order</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs List */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={jobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {jobs.map((job) => (
              <SortableJob
                key={job.id}
                job={job}
                onEdit={handleEdit}
                onArchive={handleArchive}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Job Form Dialog */}
      <Dialog open={showJobForm} onOpenChange={(open) => {
        setShowJobForm(open);
        if (!open) setEditingJob(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Edit Job' : 'Create New Job'}</DialogTitle>
          </DialogHeader>
          <JobForm
            job={editingJob}
            onSave={handleJobSave}
            onCancel={() => {
              setShowJobForm(false);
              setEditingJob(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}