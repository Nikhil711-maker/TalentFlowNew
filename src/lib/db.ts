import Dexie, { Table } from 'dexie';

export interface Job {
  id: string;
  title: string;
  slug: string;
  status: 'active' | 'archived';
  tags: string[];
  order: number;
  description?: string;
  requirements?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  stage: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
  jobId: string;
  appliedAt: Date;
  notes: CandidateNote[];
  resume?: string;
  phone?: string;
}

export interface CandidateNote {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  mentions: string[];
}

export interface CandidateTimeline {
  id: string;
  candidateId: string;
  event: string;
  fromStage?: string;
  toStage?: string;
  timestamp: Date;
  notes?: string;
}

export interface Assessment {
  id: string;
  jobId: string;
  title: string;
  description: string;
  sections: AssessmentSection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentSection {
  id: string;
  title: string;
  description?: string;
  questions: AssessmentQuestion[];
  order: number;
}

export interface AssessmentQuestion {
  id: string;
  type: 'single-choice' | 'multi-choice' | 'short-text' | 'long-text' | 'numeric' | 'file-upload';
  question: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    maxLength?: number;
  };
  conditionalLogic?: {
    dependsOn: string;
    showWhen: any;
  };
  order: number;
}

export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  candidateId: string;
  responses: Record<string, any>;
  submittedAt: Date;
  score?: number;
}

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job>;
  candidates!: Table<Candidate>;
  candidateTimeline!: Table<CandidateTimeline>;
  assessments!: Table<Assessment>;
  assessmentResponses!: Table<AssessmentResponse>;

  constructor() {
    super('TalentFlowDB');
    this.version(1).stores({
      jobs: 'id, title, slug, status, order, createdAt',
      candidates: 'id, name, email, stage, jobId, appliedAt',
      candidateTimeline: 'id, candidateId, timestamp',
      assessments: 'id, jobId, createdAt',
      assessmentResponses: 'id, assessmentId, candidateId, submittedAt'
    });
  }
}

export const db = new TalentFlowDB();