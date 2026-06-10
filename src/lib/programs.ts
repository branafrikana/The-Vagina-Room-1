export interface LessonItem {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'pdf' | 'notes' | 'case_study';
  duration: string;
  isCompleted: boolean;
  materialUrl?: string;
  description: string;
}

export interface CourseProgram {
  id: string;
  title: string;
  category: string;
  description: string;
  instructor: string;
  bannerImage: string;
  modulesCount: number;
  lessons: LessonItem[];
  announcements: string[];
}

export const defaultPrograms: CourseProgram[] = [
  {
    id: 'prog-1',
    title: 'Clinical Fertility & Cellular Conception Masterclass',
    category: 'Fertility & Reproductive Wellness Program',
    description: 'Learn the medical-traditional synthesis for follicular hydration, endocrine tracking, and basal heat calculations. Designed to help women understand and restore ancestral fertile environments.',
    instructor: 'Dr. Audrey Finch (Senior OBGYN)',
    bannerImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600',
    modulesCount: 5,
    announcements: [
      '🌿 NEW Live Q&A regarding cervical mucus alkaline diets has been scheduled for Wednesday, June 10, 2026, at 18:00 UTC.',
      '📓 Download the 2026 Basal Temperature Indexing Logsheet added in Lesson 3 notes.'
    ],
    lessons: [
      {
        id: 'les-1-1',
        title: 'Ancestral Origins & Ovarian Membrane Fluid Dynamics',
        type: 'video',
        duration: '32m',
        isCompleted: true,
        description: 'Explore follicular envelopes, cellular stress triggers, and local lymphatic fluid drainage tracks.'
      },
      {
        id: 'les-1-2',
        title: 'Cervical Secretion Categorization & pH Balancing Indices',
        type: 'pdf',
        duration: '18 pages',
        isCompleted: true,
        materialUrl: 'cervical-ph-guide.pdf',
        description: 'A structured printable reference map detailing cycle pH guidelines, estrogen elasticity, and biological hygiene.'
      },
      {
        id: 'les-1-3',
        title: 'Progesterone Optimization Strategies & Diet Mappings',
        type: 'notes',
        duration: '15 mins',
        isCompleted: false,
        description: 'Targeted nutrition guidelines, organic fat integrations, and liver detoxification procedures.'
      },
      {
        id: 'les-1-4',
        title: 'Thermal Core Energy & Botanical Clay Steam Potencies',
        type: 'audio',
        duration: '22m',
        isCompleted: false,
        description: 'Streamable audio lesson describing steam temperature controls, regional herbs, and essential biological guidelines.'
      },
      {
        id: 'les-1-5',
        title: 'Uterine Tension & Neuro-Pelvic Somatic Relaxation',
        type: 'case_study',
        duration: '35 mins',
        isCompleted: false,
        description: 'In-depth case review tracing localized emotional storing, trauma release logs, and autonomic recovery parameters.'
      }
    ]
  },
  {
    id: 'prog-2',
    title: 'Women\'s Health Sovereignty & Endocrine Autonomy',
    category: 'Women\'s Health Education Track',
    description: 'Empowering you with structured knowledge for better understanding, better health, and better decisions. Deepdive into xenoestrogen detox, pelvic realignment, and anatomical self-advocacy.',
    instructor: 'Dr. FID (Chiropractic Founder)',
    bannerImage: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600',
    modulesCount: 4,
    announcements: [
      '⚖️ Review the legal frameworks for private wellness advocacy added under Certificates panel.',
      '🧪 Botanical formulation toxicity updates sent via digital community notifications.'
    ],
    lessons: [
      {
        id: 'les-2-1',
        title: 'Endocrine Disruption Protocols & Pure Household Detoxification',
        type: 'video',
        duration: '45m',
        isCompleted: true,
        description: 'Video-based session tracing toxic parabens, microplastic variables, and non-estrogenic household replacements.'
      },
      {
        id: 'les-2-2',
        title: 'Anatomical Chiropractic Pelvic Realignment & Postural Stretches',
        type: 'video',
        duration: '28m',
        isCompleted: false,
        description: 'Video masterclass detailing self-administered coccygeal decompressions and sacral mobilization loops.'
      },
      {
        id: 'les-2-3',
        title: 'Menstrual Restoration & Luteal Cycle Thermal Support Manual',
        type: 'pdf',
        duration: '12 pages',
        isCompleted: false,
        materialUrl: 'luteal-thermal-manual.pdf',
        description: 'Printable handbook mapping warm compress wraps, herbal formulations, and pelvic support bands.'
      },
      {
        id: 'les-2-4',
        title: 'Advanced Traditional Pelvic Lymph Drainage Methods',
        type: 'audio',
        duration: '30m',
        isCompleted: false,
        description: 'Guided audio teaching describing femoral lymph hubs, abdominal clockwise massage rates, and bloodflow enhancements.'
      }
    ]
  },
  {
    id: 'prog-3',
    title: 'Advocate Leadership, Peer Support & Intimacy Ethics',
    category: 'Self-Paced Leadership Track',
    description: 'Certifying members in sovereign reproductive support, multi-level sisterhood advising, legal protection frameworks, and private community administration.',
    instructor: 'Amina Bello (Griot Scholar) & Zainab Kabir',
    bannerImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600',
    modulesCount: 3,
    announcements: [
      '✨ All 3 core modules are authenticated! This course is marked as 100% complete.'
    ],
    lessons: [
      {
        id: 'les-3-1',
        title: 'Apothecary Heritage & Global Reproductive Sovereignty Records',
        type: 'video',
        duration: '40m',
        isCompleted: true,
        description: 'In-depth history of traditional midwifery, colonial healthcare intersections, and community-based healing circles.'
      },
      {
        id: 'les-3-2',
        title: 'Ethical Guidelines for Peer-to-Peer Reproductive Consultation',
        type: 'notes',
        duration: '25 mins',
        isCompleted: true,
        description: 'Private directory outline detailing peer advice boundaries, consent covenants, and informational support frameworks.'
      },
      {
        id: 'les-3-3',
        title: 'Sovereign Encryption Protocols & Member Autonomy Safeguards',
        type: 'notes',
        duration: '20 mins',
        isCompleted: true,
        description: 'Cryptographic safety recommendations, local data privacy standards, and secure platform logging guides.'
      }
    ]
  }
];
