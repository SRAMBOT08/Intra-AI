export interface CandidateItem {
  id: string;
  name: string;
  email: string;
  role: string;
  source: 'LinkedIn' | 'Internshala' | 'Glassdoor' | 'Direct Form' | 'HR Manual';
  atsMatchScore: number;
  aiVoiceScore: number | null; // null if not completed
  status: 'INVITED' | 'IN_PROGRESS' | 'COMPLETED' | 'SHORTLISTED' | 'ARCHIVED';
  appliedAt: string;
  deadlineHours: number;
  deadlineTimestamp: string;
  matchedSkills: string[];
  missingSkills: string[];
  cvSummary: string;
  questions: Array<{
    id: string;
    question: string;
    score: number;
    evidence: string[];
    spokenQuote: string;
    aiReasoning: string;
  }>;
  followUps: string[];
  integrity: {
    voiceprintMatch: number; // e.g. 99.8%
    browserFocusLostCount: number;
    averageResponseLatencySec: number;
  };
  recruiterNotes?: string;
}

export const INITIAL_CANDIDATE_DATA: CandidateItem[] = [
  {
    id: 'INT-101',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@techmail.io',
    role: 'Senior Distributed Systems Engineer',
    source: 'LinkedIn',
    atsMatchScore: 94,
    aiVoiceScore: 4.0,
    status: 'SHORTLISTED',
    appliedAt: '2026-09-02T10:30:00Z',
    deadlineHours: 48,
    deadlineTimestamp: '2026-09-04T10:30:00Z',
    matchedSkills: ['Redis Caching', 'Apache Kafka', 'Distributed Locking', 'P99 SLA', 'Go/Rust', 'PgBouncer'],
    missingSkills: ['CockroachDB Multi-Region'],
    cvSummary:
      'Principal Distributed Systems Architect with 12+ years experience. Designed and deployed active-active Payment API processing $4B annually. Architected globally distributed ledger using PostgreSQL, Redis, and Kafka.',
    questions: [
      {
        id: 'q1',
        question: 'How do you design an active-active cache synchronization layer using Redis and Apache Kafka?',
        score: 4.0,
        evidence: [
          'Articulated read-through and write-behind cache topologies.',
          'Addressed split-brain handling using jittered lease expiration.',
          'Quantified latency drop from 850ms to 95ms P99 SLA.',
        ],
        spokenQuote:
          'We decoupled writes by routing updates to Kafka partitions keyed on customer ID, then had worker replicas flush to Redis with idempotent deduplication.',
        aiReasoning:
          'Strong technical articulation with verifiable latency metrics and fault-tolerant architecture.',
      },
      {
        id: 'q2',
        question: 'How did this architectural refactor impact user engagement or business revenue?',
        score: 4.0,
        evidence: [
          'Calculated 14% uplift in completed checkout transactions.',
          'Estimated $180k yearly compute reduction from cache efficiency.',
        ],
        spokenQuote:
          'Sub-100ms response times directly prevented checkout abandonment, driving a 14% improvement in completed conversions.',
        aiReasoning:
          'Excellent product perspective connecting infrastructure performance directly to business outcomes.',
      },
    ],
    followUps: [
      'Inquire about Elena’s experience with CockroachDB multi-region cross-cloud failover.',
      'Ask how she mentors mid-level engineers through post-mortem incident analyses.',
    ],
    integrity: {
      voiceprintMatch: 99.8,
      browserFocusLostCount: 0,
      averageResponseLatencySec: 1.2,
    },
    recruiterNotes: 'Exceptional depth. Hiring manager wants to expedite onsite final round for tomorrow.',
  },
  {
    id: 'INT-102',
    name: 'Josh Blake',
    email: 'josh.blake@saaspro.com',
    role: 'Senior Product Marketing Manager',
    source: 'Glassdoor',
    atsMatchScore: 88,
    aiVoiceScore: 3.0,
    status: 'COMPLETED',
    appliedAt: '2026-09-02T14:15:00Z',
    deadlineHours: 48,
    deadlineTimestamp: '2026-09-04T14:15:00Z',
    matchedSkills: ['GTM Strategy', 'Sales Enablement', 'Positioning Frameworks', 'Telemetry Analysis'],
    missingSkills: ['Direct P&L Ownership'],
    cvSummary:
      'Senior PMM with 6 years experience in B2B SaaS. Led 8 major feature launches and revamped competitive sales battlecards for 120-person sales organization.',
    questions: [
      {
        id: 'q1',
        question:
          'Can you describe a time when you successfully launched a new product or feature in a SaaS environment? What was your approach to positioning and messaging?',
        score: 3.0,
        evidence: [
          'Measured success by tracking utilization and users ability to leverage full functionality.',
          'Reported high usage across internal teams and quick customer adoption.',
        ],
        spokenQuote:
          'Yes. Um, I guess one example would be leading the team’s communications around a new feature. We coordinated release notes and tracked user adoption through weekly telemetry.',
        aiReasoning:
          'Solid description of launch communications and internal training, but lacked specific revenue metrics or influenced pipeline numbers.',
      },
      {
        id: 'q2',
        question:
          'Tell us about a situation where you had to collaborate with cross-functional teams to drive a go-to-market strategy.',
        score: 3.0,
        evidence: [
          'Aligned product management, sales enablement, and customer success.',
          'Created unified collateral and sales objection battlecards.',
        ],
        spokenQuote:
          'I led weekly syncs between product managers and sales reps to ensure everyone had the same talking points before our quarterly launch.',
        aiReasoning:
          'Good cross-functional alignment, but would benefit from deeper dive into resolving priority conflicts.',
      },
    ],
    followUps: [
      'Walk through one end-to-end product launch: target personas, pricing decisions, and influenced pipeline.',
      'How do you measure marketing attribution across enterprise sales cycles?',
    ],
    integrity: {
      voiceprintMatch: 99.4,
      browserFocusLostCount: 0,
      averageResponseLatencySec: 1.8,
    },
  },
  {
    id: 'INT-103',
    name: 'Jay Gardner',
    email: 'jay.gardner@salesleader.co',
    role: 'Enterprise Account Executive',
    source: 'LinkedIn',
    atsMatchScore: 92,
    aiVoiceScore: 4.0,
    status: 'SHORTLISTED',
    appliedAt: '2026-09-01T09:00:00Z',
    deadlineHours: 48,
    deadlineTimestamp: '2026-09-03T09:00:00Z',
    matchedSkills: ['MEDDPICC', 'Enterprise Procurement', '$2M+ Quota', 'Security Reviews', 'C-Level Selling'],
    missingSkills: ['EMEA Expansion Experience'],
    cvSummary:
      'Enterprise AE specializing in 7-figure compliance and developer tool contracts. Closed $2.4M in new ARR in 2025 across fintech and healthcare accounts.',
    questions: [
      {
        id: 'q1',
        question: 'How do you navigate multi-stakeholder procurement and security reviews in 7-figure enterprise deals?',
        score: 4.0,
        evidence: [
          'Identified champion and economic buyer within first 14 days.',
          'Prepared pre-emptive InfoSec compliance packet.',
        ],
        spokenQuote:
          'I build mutual action plans with the customer champion and map technical stakeholders to their risk concerns early in the evaluation.',
        aiReasoning: 'Clear consultative methodology with proven enterprise sales velocity.',
      },
    ],
    followUps: ['Discuss how you manage territory pipeline during macroeconomic downturns.'],
    integrity: {
      voiceprintMatch: 99.7,
      browserFocusLostCount: 0,
      averageResponseLatencySec: 1.1,
    },
    recruiterNotes: 'Top sales performer candidate. Moving directly to VP of Sales call.',
  },
  {
    id: 'INT-104',
    name: 'Jordan Alvarez',
    email: 'jordan.alvarez@cloudops.org',
    role: 'Staff Infrastructure Lead',
    source: 'Direct Form',
    atsMatchScore: 86,
    aiVoiceScore: 3.5,
    status: 'COMPLETED',
    appliedAt: '2026-09-01T16:20:00Z',
    deadlineHours: 48,
    deadlineTimestamp: '2026-09-03T16:20:00Z',
    matchedSkills: ['Kubernetes Operators', 'Multi-Region Failover', 'Terraform', 'Zero-Downtime DB'],
    missingSkills: ['eBPF Kernel Tracing'],
    cvSummary:
      'Staff Infrastructure Engineer with 9 years scaling Kubernetes clusters across AWS and GCP. Reduced multi-region cloud spend by 22% while improving SLA to 99.99%.',
    questions: [
      {
        id: 'q1',
        question: 'What strategies do you use for zero-downtime database schema migrations on high-write clusters?',
        score: 3.5,
        evidence: [
          'Detailed expand-and-contract pattern.',
          'Validated ghost table replication with gh-ost.',
        ],
        spokenQuote:
          'We use expand-and-contract migration patterns with backwards-compatible columns and async backfilling.',
        aiReasoning: 'Accurate execution pattern with high operational awareness.',
      },
    ],
    followUps: ['Explore experience with service mesh observability overhead.'],
    integrity: {
      voiceprintMatch: 99.1,
      browserFocusLostCount: 1,
      averageResponseLatencySec: 1.5,
    },
  },
  {
    id: 'INT-105',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@intern.dev',
    role: 'Backend Engineering Fellow',
    source: 'Internshala',
    atsMatchScore: 82,
    aiVoiceScore: null,
    status: 'INVITED',
    appliedAt: '2026-09-02T18:00:00Z',
    deadlineHours: 48,
    deadlineTimestamp: '2026-09-04T18:00:00Z',
    matchedSkills: ['Node.js', 'PostgreSQL', 'Docker Basics', 'REST APIs'],
    missingSkills: ['Distributed Transactions', 'Production SLAs'],
    cvSummary:
      'Recent Computer Science graduate with internship experience building REST microservices in Express.js and PostgreSQL. Built open-source Redis job queue tool.',
    questions: [],
    followUps: [],
    integrity: {
      voiceprintMatch: 100,
      browserFocusLostCount: 0,
      averageResponseLatencySec: 0,
    },
  },
];
