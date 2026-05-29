import { 
  ShieldCheck, 
  BookOpen, 
  Heart, 
  Users, 
  Sparkles, 
  Lock,
  Stethoscope,
  HandHelping,
  Layers,
  Megaphone,
  UserCheck
} from 'lucide-react';

export const FOCUS_AREAS = [
  {
    title: "Vaginal & Reproductive Wellness",
    description: "Expert guidance and wellness solutions to help you understand, protect, and heal your intimate health.",
    icon: Stethoscope,
    items: [
      "Vaginal health & hygiene",
      "Vaginal microbiome health",
      "Infection treatment & prevention",
      "STI testing & treatment",
      "Menstrual health support",
      "Pelvic floor health",
      "Sexual pain management",
      "Hormonal balance & therapy",
      "Pregnancy & postpartum care",
      "Menopause support",
      "Fertility support & guidance",
      "Contraception & family planning"
    ]
  },
  {
    title: "Sexual Wellness & Relationship Support",
    description: "Safe and respectful spaces for women and couples to learn, heal, and grow in intimacy.",
    icon: Heart,
    items: [
      "Sexual health education",
      "Sexual intimacy coaching",
      "Libido & desire enhancement",
      "Sex therapy & counselling",
      "Relationship counselling",
      "Sexual trauma support",
      "Sexual education for life stages",
      "Identity & orientation support"
    ]
  },
  {
    title: "Holistic Healing & Empowerment",
    description: "Embracing emotional, mental, natural, and lifestyle-centered wellness for the whole woman.",
    icon: Sparkles,
    items: [
      "Body positivity & self-love",
      "Natural & alternative therapies",
      "Herbal wellness education",
      "Emotional wellness support",
      "Confidence rebuilding",
      "Reproductive rights advocacy"
    ]
  }
];

export const CORE_VALUES = [
  {
    name: "Confidentiality",
    description: "We protect every story with strict privacy and trust.",
    icon: Lock
  },
  {
    name: "Compassion",
    description: "We deliver care with empathy and understanding.",
    icon: Heart
  },
  {
    name: "Education",
    description: "We simplify knowledge for informed health decisions.",
    icon: BookOpen
  },
  {
    name: "Empowerment",
    description: "We equip people to take charge of their wellbeing.",
    icon: UserCheck
  },
  {
    name: "Wellness",
    description: "We restore balance through holistic, effective care.",
    icon: Sparkles
  },
  {
    name: "Advocacy",
    description: "We promote awareness and break health stigmas.",
    icon: Megaphone
  }
];

export const AUDIENCE = [
  "Teen girls",
  "Young women",
  "Married women",
  "Expectant mothers",
  "Postpartum mothers",
  "Women with fertility challenges",
  "Women navigating hormone changes",
  "Couples seeking intimacy support",
  "Women seeking healing from trauma"
];

export const DIFFERENTIATORS = [
  {
    title: "Safe & Judgment-Free",
    description: "We foster a confidential and compassionate environment where women can ask questions freely without fear, shame, or stigma.",
    icon: ShieldCheck
  },
  {
    title: "Education-Driven",
    description: "We simplify complex reproductive and sexual health conversations into relatable, practical, and empowering knowledge.",
    icon: BookOpen
  },
  {
    title: "Holistic Wellness Approach",
    description: "We combine medical education, emotional support, lifestyle wellness, counselling, and natural wellness perspectives to support the whole woman.",
    icon: Sparkles
  },
  {
    title: "Community & Support",
    description: "We are building a supportive ecosystem where women can connect, learn, heal, and grow together.",
    icon: Users
  }
];
