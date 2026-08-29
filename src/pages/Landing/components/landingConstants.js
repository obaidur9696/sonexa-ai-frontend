export const HERO_STATS = [
  { value: '100+', label: 'Languages', icon: '🌐' },
  { value: '1000+', label: 'Topics', icon: '🎯' },
  { value: '<1000ms', label: 'Latency', icon: '⚡' },
  { value: '24/7', label: 'Available', icon: '🕐' },
];

export const FEATURES = [
  { icon: '🌍', title: 'Multi-Language Support', description: 'Speak naturally in 100+ languages with near-native voice quality and real-time translation.', gradient: 'from-blue-500 to-cyan-500' },
  { icon: '🧠', title: 'Deep Conversation AI', description: 'Intelligent, context-aware conversations that stay focused on your selected topic. Speak at any time to interrupt the AI—the conversation pauses and listens to you.', gradient: 'from-violet-500 to-purple-500' },
  { icon: '⚡', title: 'Lightning Fast', description: 'Ultra-low latency responses that keep up with your thoughts. If you are away, Sonexa offers gentle reminders before safely ending an inactive session.', gradient: 'from-orange-500 to-rose-500' },
  { icon: '🔒', title: 'Enterprise Security', description: 'Bank-grade encryption, data privacy, and compliance. Your conversations are always secure.', gradient: 'from-emerald-500 to-teal-500' },
  { icon: '🎯', title: 'Personalized Experience', description: 'Adapts to your speaking style, preferences, and learning goals for a truly tailored interaction.', gradient: 'from-pink-500 to-rose-500' },
  { icon: '📊', title: 'Conversation Insights', description: 'Get detailed analytics on your communication skills, engagement, and language proficiency.', gradient: 'from-indigo-500 to-purple-500' },
];

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not', label: 'Prefer not to say' },
];

export const HERO_PARTICLES = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 53) % 100}%`,
  size: index % 3 === 0 ? 2 : 1,
  duration: 4 + (index % 4),
  delay: (index % 6) * 0.45,
  drift: index % 2 === 0 ? 24 : -24,
}));
