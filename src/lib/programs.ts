export interface LessonItem {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'pdf' | 'notes' | 'case_study' | 'quiz' | 'assessment';
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
    id: 'prog-fertility',
    title: 'Fertility School: Reproductive Health & Conception',
    category: 'Fertility School',
    description: 'Members gain deep clarity on how fertility works and how to support healthy conception naturally and scientifically. Includes cycle understanding, ovulation knowledge, and preconception health.',
    instructor: 'Dr. Audrey Finch (Senior OBGYN)',
    bannerImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600',
    modulesCount: 5,
    announcements: [
      '🌿 NEW Live Q&A regarding cervical mucus has been scheduled for Wednesday.',
      '📓 Complete the end-of-module assessment to unlock your certificate.'
    ],
    lessons: [
      {
        id: 'les-fert-1',
        title: 'Fertility Awareness Education & Cycle Tracking',
        type: 'video',
        duration: '32m',
        isCompleted: true,
        description: 'Explore the biological foundations of cycle tracking, temperature indexing, and ovulation timing.'
      },
      {
        id: 'les-fert-2',
        title: 'Cervical Secretion Categorization Guide',
        type: 'pdf',
        duration: '18 pages',
        isCompleted: true,
        materialUrl: 'cervical-ph-guide.pdf',
        description: 'A structured printable reference map detailing cycle guidelines and biological indicators.'
      },
      {
        id: 'les-fert-3',
        title: 'Check Your Knowledge: Cycle Anatomy',
        type: 'quiz',
        duration: '10 mins',
        isCompleted: false,
        description: 'Interactive knowledge check to reinforce your learning on the reproductive cycle.'
      },
      {
        id: 'les-fert-4',
        title: 'Preconception Health & Couples Education',
        type: 'audio',
        duration: '22m',
        isCompleted: false,
        description: 'Streamable audio lesson describing lifestyle and nutritional preparation for conception.'
      },
      {
        id: 'les-fert-5',
        title: 'Module Assessment: Conception Readiness',
        type: 'assessment',
        duration: '35 mins',
        isCompleted: false,
        description: 'Deeper evaluation covering all topics in the module. Pass to earn your digital certification.'
      }
    ]
  },
  {
    id: 'prog-wellness',
    title: 'Women\'s Wellness School: Holistic Mastery',
    category: 'Women\'s Wellness School',
    description: 'Learn how to understand and improve your overall wellbeing through daily health awareness. Focuses on menstrual health, emotional wellbeing, sleep, stress, and energy.',
    instructor: 'Dr. FID (Founder)',
    bannerImage: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600',
    modulesCount: 4,
    announcements: [
      '⚖️ Review the new lifestyle optimization protocols added in Lesson 3.'
    ],
    lessons: [
      {
        id: 'les-well-1',
        title: 'Menstrual Health & Cycle Consistency',
        type: 'video',
        duration: '45m',
        isCompleted: true,
        description: 'Understanding your cycle patterns and identifying early warning indicators of irregularity.'
      },
      {
        id: 'les-well-2',
        title: 'Sleep, Stress, and Energy Regulation',
        type: 'audio',
        duration: '28m',
        isCompleted: false,
        description: 'How lifestyle adjustments can profoundly influence your daily vitality.'
      },
      {
        id: 'les-well-3',
        title: 'Wellness Progress Check',
        type: 'quiz',
        duration: '15 mins',
        isCompleted: false,
        description: 'A short quiz reinforcing concepts on stress and sleep recovery.'
      }
    ]
  },
  {
    id: 'prog-hormones',
    title: 'Hormonal Balance School',
    category: 'Hormonal Balance School',
    description: 'Learn how hormones influence every aspect of your physical and emotional health. Covers PCOS awareness, thyroid basics, and the lifestyle-hormone connection.',
    instructor: 'Amina Bello (Griot Scholar) & Dr. FID',
    bannerImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600',
    modulesCount: 3,
    announcements: [
      '✨ Hormonal wellness assessment is now live.'
    ],
    lessons: [
      {
        id: 'les-horm-1',
        title: 'Mastering Hormonal Cycles & Identifying Imbalances',
        type: 'video',
        duration: '40m',
        isCompleted: true,
        description: 'Explore the signs of common hormonal imbalances and how to track fluctuations.'
      },
      {
        id: 'les-horm-2',
        title: 'PCOS and Thyroid Awareness Basics',
        type: 'notes',
        duration: '25 mins',
        isCompleted: true,
        description: 'Foundational education on PCOS management strategies and thyroid health optimization.'
      },
      {
        id: 'les-horm-3',
        title: 'End of Module Assessment',
        type: 'assessment',
        duration: '30 mins',
        isCompleted: true,
        description: 'Comprehensive exam testing your knowledge on reproductive and hormonal systems.'
      }
    ]
  },
  {
    id: 'prog-intimacy',
    title: 'Intimacy Education School',
    category: 'Intimacy Education School',
    description: 'Develop healthy, informed, and confident perspectives about intimacy, body awareness, and relationship communication.',
    instructor: 'Zainab Kabir',
    bannerImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600',
    modulesCount: 2,
    announcements: [],
    lessons: [
      {
        id: 'les-int-1',
        title: 'Body Awareness & Sexual Wellness',
        type: 'video',
        duration: '35m',
        isCompleted: false,
        description: 'A delicate holding space for exploring pelvic wellness, autonomic relaxation, and somatic cues.'
      }
    ]
  },
  {
    id: 'prog-pregnancy',
    title: 'Pregnancy Preparation School',
    category: 'Pregnancy Preparation School',
    description: 'Guiding you toward a healthier, more prepared pregnancy journey. Focuses on preconception readiness and nutrition.',
    instructor: 'Dr. Audrey Finch',
    bannerImage: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600',
    modulesCount: 2,
    announcements: [],
    lessons: [
      {
        id: 'les-preg-1',
        title: 'Pre-Pregnancy Readiness Checklist',
        type: 'pdf',
        duration: '5 pages',
        isCompleted: false,
        description: 'Complete list of lifestyle, nutritional, and emotional preparations before trying to conceive.',
        materialUrl: 'pre-pregnancy.pdf'
      }
    ]
  },
  {
    id: 'prog-marriage',
    title: 'Marriage & Wellness School',
    category: 'Marriage & Wellness School',
    description: 'Learn how wellness, fertility, and relationships are interconnected. Covers emotional intimacy and conflict resolution.',
    instructor: 'Amina Bello (Griot Scholar)',
    bannerImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600',
    modulesCount: 2,
    announcements: [],
    lessons: [
      {
        id: 'les-marr-1',
        title: 'Fertility in Marriage & Shared Wellness',
        type: 'audio',
        duration: '42m',
        isCompleted: false,
        description: 'Audio seminar on communication protocols and navigating the emotional journey of fertility as a couple.'
      }
    ]
  }
];
