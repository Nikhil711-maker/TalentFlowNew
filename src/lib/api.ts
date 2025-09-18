import { Job, Candidate, Assessment, CandidateTimeline, AssessmentResponse } from './db';

const BASE_URL = '/api';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

// Jobs API
export const jobsApi = {
  async getJobs(params: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const response = await fetch(`${BASE_URL}/jobs?${searchParams}`);
    return handleResponse<{
      data: Job[];
      pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      };
    }>(response);
  },

  async createJob(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job)
    });
    return handleResponse<Job>(response);
  },

  async updateJob(id: string, updates: Partial<Job>) {
    const response = await fetch(`${BASE_URL}/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResponse<Job>(response);
  },

  async reorderJob(id: string, fromOrder: number, toOrder: number) {
    const response = await fetch(`${BASE_URL}/jobs/${id}/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromOrder, toOrder })
    });
    return handleResponse<{ success: boolean }>(response);
  }
};

// Candidates API
export const candidatesApi = {
  async getCandidates(params: {
    search?: string;
    stage?: string;
    page?: number;
    pageSize?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const response = await fetch(`${BASE_URL}/candidates?${searchParams}`);
    return handleResponse<{
      data: Candidate[];
      pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      };
    }>(response);
  },

  async getCandidate(id: string) {
    const response = await fetch(`${BASE_URL}/candidates/${id}`);
    return handleResponse<Candidate>(response);
  },

  async updateCandidate(id: string, updates: Partial<Candidate>) {
    const response = await fetch(`${BASE_URL}/candidates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResponse<Candidate>(response);
  },

  async getCandidateTimeline(id: string) {
    const response = await fetch(`${BASE_URL}/candidates/${id}/timeline`);
    return handleResponse<CandidateTimeline[]>(response);
  }
};

// Assessments API
export const assessmentsApi = {
  async getAssessment(jobId: string) {
    const response = await fetch(`${BASE_URL}/assessments/${jobId}`);
    return handleResponse<Assessment | null>(response);
  },

  async saveAssessment(jobId: string, assessment: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await fetch(`${BASE_URL}/assessments/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment)
    });
    return handleResponse<Assessment>(response);
  },

  async submitAssessment(jobId: string, candidateId: string, responses: Record<string, any>) {
    const response = await fetch(`${BASE_URL}/assessments/${jobId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId, responses })
    });
    return handleResponse<AssessmentResponse>(response);
  }
};