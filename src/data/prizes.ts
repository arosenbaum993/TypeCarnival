import { PrizeItem } from '../types';

export const PRIZES: PrizeItem[] = [
  // Collectible Plushies
  {
    id: 'prize-bear',
    name: 'Carnival Teddy Bear',
    category: 'plushie',
    cost: 100,
    description: 'A classic carnival plushie with a festive striped ribbon.',
    icon: '🧸',
  },
  {
    id: 'prize-dino',
    name: 'Pixel T-Rex Dino',
    category: 'plushie',
    cost: 150,
    description: 'A neon green arcade mascot who loves fast typists.',
    icon: '🦖',
  },
  {
    id: 'prize-lion',
    name: 'Golden Ringmaster Lion',
    category: 'plushie',
    cost: 250,
    description: 'Majestic carnival king awarded for high typing accuracy.',
    icon: '🦁',
  },
  {
    id: 'prize-alien',
    name: 'Galactic Arcade Alien',
    category: 'plushie',
    cost: 300,
    description: 'Direct from the retro pixel machine with glowing eyes.',
    icon: '👾',
  },
  {
    id: 'prize-duck',
    name: 'Rubber Duck Champion',
    category: 'plushie',
    cost: 80,
    description: 'First prize from the carnival water fountain pond game.',
    icon: '🦆',
  },

  // Themes
  {
    id: 'theme-classic',
    name: 'Carnival Classic',
    category: 'theme',
    cost: 0,
    description: 'Traditional golden midway marquee with warm amber highlights.',
    icon: '🎪',
    previewColor: '#f59e0b',
  },
  {
    id: 'theme-neon',
    name: 'Neon Cyber Arcade',
    category: 'theme',
    cost: 200,
    description: 'High-energy electric cyan and magenta retro arcade vibe.',
    icon: '🕹️',
    previewColor: '#06b6d4',
  },
  {
    id: 'theme-candy',
    name: 'Cotton Candy Dream',
    category: 'theme',
    cost: 220,
    description: 'Pastel pinks and baby blues as sweet as carnival spun sugar.',
    icon: '🍭',
    previewColor: '#ec4899',
  },
  {
    id: 'theme-crt',
    name: 'Retro 80s Terminal',
    category: 'theme',
    cost: 350,
    description: 'Phosphor emerald glowing keys reminiscent of vintage computers.',
    icon: '📺',
    previewColor: '#10b981',
  },

  // Hats & Badges
  {
    id: 'badge-lightning',
    name: 'Lightning Fingers Badge',
    category: 'badge',
    cost: 180,
    description: 'Awarded for typing over 20 WPM with high consistency.',
    icon: '⚡',
  },
  {
    id: 'badge-perfection',
    name: 'Bullseye Accuracy Star',
    category: 'badge',
    cost: 220,
    description: 'Proof of achieving 98%+ accuracy across 5 sessions.',
    icon: '🎯',
  },
  {
    id: 'hat-ringmaster',
    name: 'Ringmaster Top Hat',
    category: 'hat',
    cost: 400,
    description: 'Show off your mastery at the head of the classroom midway.',
    icon: '🎩',
  },
];
