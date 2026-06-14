export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'pdf' | 'ebook' | 'worksheet' | 'checklist' | 'guide';
  url: string;
  duration?: string;
  fileSize?: string;
  author: string;
  category: 'Fertility' | 'Hormones' | 'Intimacy' | 'Pregnancy' | 'Menopause' | 'Mental Wellness' | string;
  thumbnail: string;
  highlights: string[];
}

export const defaultResources: ResourceItem[] = [
  {
    id: 'res-fert-1',
    title: 'Fertility Awareness Guide',
    description: 'Learn the foundational principles of cycle tracking, basal body temperature indexing, and ovulation timing to support your preconception journey naturally.',
    type: 'guide',
    url: '#',
    fileSize: '2.4 MB',
    author: 'Dr. Audrey Finch',
    category: 'Fertility',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600',
    highlights: ['Cycle baselines', 'Ovulation indicators', 'Hormonal charting']
  },
  {
    id: 'res-horm-1',
    title: 'Hormonal Balance Checklist',
    description: 'A daily checklist to keep your hormones in check. Covers nutrition, stress management, sleep hygiene, and essential routines.',
    type: 'checklist',
    url: '#',
    fileSize: '1.1 MB',
    author: 'Dr. FID',
    category: 'Hormones',
    thumbnail: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600',
    highlights: ['Daily routines', 'Symptom tracking', 'Dietary checks']
  },
  {
    id: 'res-intim-1',
    title: 'Intimacy and Connection Webinar',
    description: 'Expert webinar on how emotional and physical connection builds systemic wellness and relationship health in couples.',
    type: 'video',
    url: '#',
    duration: '45m',
    author: 'Zainab Kabir',
    category: 'Intimacy',
    thumbnail: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600',
    highlights: ['Emotional connection', 'Communication protocols', 'Body awareness']
  },
  {
    id: 'res-preg-1',
    title: 'Pregnancy Preparation Manual',
    description: 'Comprehensive manual detailing essential preconception wellness milestones, required nutrients, and emotional preparation steps.',
    type: 'pdf',
    url: '#',
    fileSize: '4.8 MB',
    author: 'Dr. Audrey Finch',
    category: 'Pregnancy',
    thumbnail: 'https://images.unsplash.com/photo-1563214532-613d9ea729df?auto=format&fit=crop&q=80&w=600',
    highlights: ['Prenatal nutrition', 'Body readiness', 'Preconception lifestyle']
  },
  {
    id: 'res-meno-1',
    title: 'Menopause Wellness Journey',
    description: 'Audio guidance and affirmations designed for women moving through the perimenopause and menopause transition phases smoothly.',
    type: 'audio',
    url: '#',
    duration: '32m',
    author: 'Amina Bello (Griot Scholar)',
    category: 'Menopause',
    thumbnail: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=600',
    highlights: ['Hormonal shifts', 'Emotional resilience', 'Cooling techniques']
  },
  {
    id: 'res-ment-1',
    title: 'Stress Response Mastery Worksheet',
    description: 'Interactive worksheet designed to map your somatic anxiety triggers and help regulate your vagus nerve activity.',
    type: 'worksheet',
    url: '#',
    fileSize: '1.5 MB',
    author: 'Dr. FID',
    category: 'Mental Wellness',
    thumbnail: 'https://images.unsplash.com/photo-1511296265581-c2450046447d?auto=format&fit=crop&q=80&w=600',
    highlights: ['Vagus nerve tracking', 'Trigger identification', 'Somatic recovery']
  }
];
