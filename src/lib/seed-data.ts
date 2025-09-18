import { db, Job, Candidate, Assessment, CandidateTimeline } from './db';

const jobTitles = [
  'Senior Frontend Developer',
  'Backend Engineer',
  'Full Stack Developer',
  'Product Manager',
  'UX Designer',
  'Data Scientist',
  'DevOps Engineer',
  'QA Engineer',
  'Mobile Developer',
  'Technical Lead',
  'Software Architect',
  'Marketing Manager',
  'Sales Representative',
  'Customer Success Manager',
  'Business Analyst',
  'HR Generalist',
  'Financial Analyst',
  'Content Writer',
  'Graphic Designer',
  'Operations Manager',
  'Security Engineer',
  'Machine Learning Engineer',
  'Cloud Architect',
  'Database Administrator',
  'Project Manager'
];

const tags = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'Remote', 'Senior', 'Junior',
  'Fulltime', 'Contract', 'Urgent', 'Leadership', 'Frontend', 'Backend', 'Design',
  'Marketing', 'Sales', 'Analytics', 'Cloud', 'Security'
];

const firstNames = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Emma', 'Frank', 'Grace', 'Henry',
  'Isabella', 'Jack', 'Katherine', 'Liam', 'Maya', 'Noah', 'Olivia', 'Paul',
  'Quinn', 'Rachel', 'Samuel', 'Taylor', 'Uma', 'Victor', 'Wendy', 'Xavier',
  'Yasmin', 'Zachary', 'Aaron', 'Bella', 'Connor', 'Delilah'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

const stages: Array<'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected'> = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function seedDatabase() {
  // Check if data already exists
  const existingJobs = await db.jobs.count();
  if (existingJobs > 0) {
    console.log('Database already seeded');
    return;
  }

  console.log('Seeding database...');

  // Generate 25 jobs
  const jobs: Job[] = [];
  for (let i = 0; i < 25; i++) {
    const title = jobTitles[i % jobTitles.length];
    const job: Job = {
      id: `job-${i + 1}`,
      title: i === 0 ? title : `${title} ${Math.floor(i / jobTitles.length) + 1}`,
      slug: generateSlug(title) + (i > 0 ? `-${Math.floor(i / jobTitles.length) + 1}` : ''),
      status: Math.random() > 0.3 ? 'active' : 'archived',
      tags: getRandomItems(tags, Math.floor(Math.random() * 4) + 1),
      order: i,
      description: `We are looking for an experienced ${title.toLowerCase()} to join our growing team.`,
      requirements: [
        `5+ years of experience in ${title.toLowerCase()}`,
        'Strong communication skills',
        'Bachelor\'s degree or equivalent experience',
        'Experience with modern development tools'
      ],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    };
    jobs.push(job);
  }

  // Generate 1000 candidates
  const candidates: Candidate[] = [];
  const timeline: CandidateTimeline[] = [];
  
  for (let i = 0; i < 1000; i++) {
    const firstName = getRandomItem(firstNames);
    const lastName = getRandomItem(lastNames);
    const jobId = getRandomItem(jobs).id;
    const stage = getRandomItem(stages) as 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
    const appliedAt = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
    
    const candidate: Candidate = {
      id: `candidate-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      stage,
      jobId,
      appliedAt,
      notes: [],
      phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
    };

    candidates.push(candidate);

    // Create timeline entry for application
    timeline.push({
      id: `timeline-${i + 1}-1`,
      candidateId: candidate.id,
      event: 'Applied to position',
      toStage: 'applied',
      timestamp: appliedAt,
      notes: 'Candidate submitted application'
    });

    // Add random stage progressions
    if (stage !== 'applied') {
      const stageOrder = ['applied', 'screen', 'tech', 'offer', 'hired'];
      const currentIndex = stageOrder.indexOf(stage as string);
      
      for (let j = 1; j <= currentIndex; j++) {
        timeline.push({
          id: `timeline-${i + 1}-${j + 1}`,
          candidateId: candidate.id,
          event: `Moved to ${stageOrder[j]}`,
          fromStage: stageOrder[j - 1],
          toStage: stageOrder[j],
          timestamp: new Date(appliedAt.getTime() + j * 7 * 24 * 60 * 60 * 1000),
          notes: `Candidate progressed to ${stageOrder[j]} stage`
        });
      }
    }
  }

  // Generate 3 assessments with 10+ questions each
  const assessments: Assessment[] = [];
  
  for (let i = 0; i < 3; i++) {
    const jobId = jobs[i].id;
    const assessment: Assessment = {
      id: `assessment-${i + 1}`,
      jobId,
      title: `${jobs[i].title} Assessment`,
      description: `Technical assessment for the ${jobs[i].title} position`,
      sections: [
        {
          id: `section-${i + 1}-1`,
          title: 'Technical Skills',
          description: 'Evaluate technical competency',
          order: 0,
          questions: [
            {
              id: `q-${i + 1}-1`,
              type: 'single-choice',
              question: 'How many years of experience do you have?',
              required: true,
              options: ['0-1 years', '1-3 years', '3-5 years', '5+ years'],
              order: 0
            },
            {
              id: `q-${i + 1}-2`,
              type: 'multi-choice',
              question: 'Which technologies are you proficient in?',
              required: true,
              options: ['React', 'TypeScript', 'Node.js', 'Python', 'Java', 'Docker'],
              order: 1
            },
            {
              id: `q-${i + 1}-3`,
              type: 'short-text',
              question: 'What is your current job title?',
              required: true,
              validation: { maxLength: 100 },
              order: 2
            },
            {
              id: `q-${i + 1}-4`,
              type: 'long-text',
              question: 'Describe your most challenging project',
              required: true,
              validation: { maxLength: 1000 },
              order: 3
            },
            {
              id: `q-${i + 1}-5`,
              type: 'numeric',
              question: 'What is your expected salary range (in thousands)?',
              required: false,
              validation: { min: 50, max: 300 },
              order: 4
            }
          ]
        },
        {
          id: `section-${i + 1}-2`,
          title: 'Experience',
          description: 'Previous work experience',
          order: 1,
          questions: [
            {
              id: `q-${i + 1}-6`,
              type: 'single-choice',
              question: 'Have you worked remotely before?',
              required: true,
              options: ['Yes', 'No'],
              order: 0
            },
            {
              id: `q-${i + 1}-7`,
              type: 'long-text',
              question: 'Describe your remote work experience',
              required: false,
              conditionalLogic: {
                dependsOn: `q-${i + 1}-6`,
                showWhen: 'Yes'
              },
              validation: { maxLength: 500 },
              order: 1
            },
            {
              id: `q-${i + 1}-8`,
              type: 'single-choice',
              question: 'Are you available to start immediately?',
              required: true,
              options: ['Yes', 'No', 'Within 2 weeks', 'Within a month'],
              order: 2
            },
            {
              id: `q-${i + 1}-9`,
              type: 'short-text',
              question: 'If not immediately, when can you start?',
              required: false,
              conditionalLogic: {
                dependsOn: `q-${i + 1}-8`,
                showWhen: 'No'
              },
              validation: { maxLength: 100 },
              order: 3
            },
            {
              id: `q-${i + 1}-10`,
              type: 'file-upload',
              question: 'Upload your portfolio/work samples',
              required: false,
              order: 4
            }
          ]
        }
      ],
      createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    };
    
    assessments.push(assessment);
  }

  // Save to database
  await db.jobs.bulkAdd(jobs);
  await db.candidates.bulkAdd(candidates);
  await db.candidateTimeline.bulkAdd(timeline);
  await db.assessments.bulkAdd(assessments);

  console.log('Database seeded successfully!');
}