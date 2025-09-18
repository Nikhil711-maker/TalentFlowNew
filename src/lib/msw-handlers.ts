import { http, HttpResponse } from 'msw';
import { db, Job, Candidate, Assessment, CandidateTimeline } from './db';

// Helper function to add artificial latency
const delay = () => new Promise(resolve => 
  setTimeout(resolve, Math.random() * 1000 + 200)
);

// Helper function to simulate errors
const shouldError = () => Math.random() < 0.08; // 8% error rate

export const handlers = [
  // Jobs endpoints
  http.get('/api/jobs', async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const sort = url.searchParams.get('sort') || 'order';

    try {
      let query = db.jobs.orderBy(sort === 'title' ? 'title' : 'order');
      
      const allJobs = await query.toArray();
      
      // Filter jobs
      let filteredJobs = allJobs.filter(job => {
        const matchesSearch = search === '' || 
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = status === '' || job.status === status;
        return matchesSearch && matchesStatus;
      });

      // Pagination
      const total = filteredJobs.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const jobs = filteredJobs.slice(startIndex, endIndex);

      return HttpResponse.json({
        data: jobs,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }
  }),

  http.post('/api/jobs', async ({ request }) => {
    await delay();
    if (shouldError()) {
      return HttpResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    try {
      const jobData = await request.json() as Omit<Job, 'id' | 'createdAt' | 'updatedAt'>;
      const newJob: Job = {
        ...jobData,
        id: `job-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.jobs.add(newJob);
      return HttpResponse.json(newJob, { status: 201 });
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }
  }),

  http.patch('/api/jobs/:id', async ({ params, request }) => {
    await delay();
    if (shouldError()) {
      return HttpResponse.json({ error: 'Failed to update job' }, { status: 500 });
    }

    try {
      const jobId = params.id as string;
      const updates = await request.json() as Partial<Job>;
      
      await db.jobs.update(jobId, { ...updates, updatedAt: new Date() });
      const updatedJob = await db.jobs.get(jobId);
      
      return HttpResponse.json(updatedJob);
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to update job' }, { status: 500 });
    }
  }),

  http.patch('/api/jobs/:id/reorder', async ({ params, request }) => {
    await delay();
    // Higher error rate for reorder to test rollback
    if (Math.random() < 0.1) {
      return HttpResponse.json({ error: 'Reorder failed' }, { status: 500 });
    }

    try {
      const jobId = params.id as string;
      const { fromOrder, toOrder } = await request.json() as { fromOrder: number; toOrder: number };
      
      // Update job order
      await db.jobs.update(jobId, { order: toOrder, updatedAt: new Date() });
      
      // Update other jobs' orders
      const jobs = await db.jobs.orderBy('order').toArray();
      for (const job of jobs) {
        if (job.id !== jobId) {
          if (fromOrder < toOrder && job.order > fromOrder && job.order <= toOrder) {
            await db.jobs.update(job.id, { order: job.order - 1 });
          } else if (fromOrder > toOrder && job.order >= toOrder && job.order < fromOrder) {
            await db.jobs.update(job.id, { order: job.order + 1 });
          }
        }
      }
      
      return HttpResponse.json({ success: true });
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to reorder job' }, { status: 500 });
    }
  }),

  // Candidates endpoints
  http.get('/api/candidates', async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const stage = url.searchParams.get('stage') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');

    try {
      const allCandidates = await db.candidates.toArray();
      
      // Filter candidates
      let filteredCandidates = allCandidates.filter(candidate => {
        const matchesSearch = search === '' || 
          candidate.name.toLowerCase().includes(search.toLowerCase()) ||
          candidate.email.toLowerCase().includes(search.toLowerCase());
        const matchesStage = stage === '' || candidate.stage === stage;
        return matchesSearch && matchesStage;
      });

      // Pagination
      const total = filteredCandidates.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const candidates = filteredCandidates.slice(startIndex, endIndex);

      return HttpResponse.json({
        data: candidates,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
    }
  }),

  http.get('/api/candidates/:id', async ({ params }) => {
    await delay();
    
    try {
      const candidateId = params.id as string;
      const candidate = await db.candidates.get(candidateId);
      
      if (!candidate) {
        return HttpResponse.json({ error: 'Candidate not found' }, { status: 404 });
      }
      
      return HttpResponse.json(candidate);
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to fetch candidate' }, { status: 500 });
    }
  }),

  http.patch('/api/candidates/:id', async ({ params, request }) => {
    await delay();
    if (shouldError()) {
      return HttpResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
    }

    try {
      const candidateId = params.id as string;
      const updates = await request.json() as Partial<Candidate>;
      
      const candidate = await db.candidates.get(candidateId);
      if (!candidate) {
        return HttpResponse.json({ error: 'Candidate not found' }, { status: 404 });
      }

      // If stage is changing, create timeline entry
      if (updates.stage && updates.stage !== candidate.stage) {
        const timelineEntry: CandidateTimeline = {
          id: `timeline-${Date.now()}`,
          candidateId,
          event: `Moved from ${candidate.stage} to ${updates.stage}`,
          fromStage: candidate.stage,
          toStage: updates.stage,
          timestamp: new Date(),
          notes: `Stage updated via kanban board`
        };
        await db.candidateTimeline.add(timelineEntry);
      }
      
      await db.candidates.update(candidateId, updates);
      const updatedCandidate = await db.candidates.get(candidateId);
      
      return HttpResponse.json(updatedCandidate);
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
    }
  }),

  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    await delay();
    
    try {
      const candidateId = params.id as string;
      const timeline = await db.candidateTimeline
        .where('candidateId')
        .equals(candidateId)
        .toArray();
      
      // Sort by timestamp
      timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      return HttpResponse.json(timeline);
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
    }
  }),

  // Assessments endpoints
  http.get('/api/assessments/:jobId', async ({ params }) => {
    await delay();
    
    try {
      const jobId = params.jobId as string;
      const assessment = await db.assessments.where('jobId').equals(jobId).first();
      
      return HttpResponse.json(assessment || null);
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 });
    }
  }),

  http.put('/api/assessments/:jobId', async ({ params, request }) => {
    await delay();
    if (shouldError()) {
      return HttpResponse.json({ error: 'Failed to save assessment' }, { status: 500 });
    }

    try {
      const jobId = params.jobId as string;
      const assessmentData = await request.json() as Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>;
      
      const existingAssessment = await db.assessments.where('jobId').equals(jobId).first();
      
      if (existingAssessment) {
        await db.assessments.update(existingAssessment.id, {
          ...assessmentData,
          updatedAt: new Date()
        });
        const updated = await db.assessments.get(existingAssessment.id);
        return HttpResponse.json(updated);
      } else {
        const newAssessment: Assessment = {
          ...assessmentData,
          id: `assessment-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await db.assessments.add(newAssessment);
        return HttpResponse.json(newAssessment);
      }
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to save assessment' }, { status: 500 });
    }
  }),

  http.post('/api/assessments/:jobId/submit', async ({ params, request }) => {
    await delay();
    if (shouldError()) {
      return HttpResponse.json({ error: 'Failed to submit assessment' }, { status: 500 });
    }

    try {
      const jobId = params.jobId as string;
      const { candidateId, responses } = await request.json() as {
        candidateId: string;
        responses: Record<string, any>;
      };
      
      const assessment = await db.assessments.where('jobId').equals(jobId).first();
      if (!assessment) {
        return HttpResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      const response = {
        id: `response-${Date.now()}`,
        assessmentId: assessment.id,
        candidateId,
        responses,
        submittedAt: new Date(),
        score: Math.floor(Math.random() * 100) + 1 // Random score for demo
      };
      
      await db.assessmentResponses.add(response);
      return HttpResponse.json(response);
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to submit assessment' }, { status: 500 });
    }
  })
];