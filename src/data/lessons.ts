import { Lesson, GradeLevel } from '../types';

export const LESSONS: Lesson[] = [
  // Tier 1: Home Row Haven
  {
    id: 'lesson-1',
    tier: 1,
    title: 'Tent 1: Home Row Anchor',
    subtitle: 'Master the core resting keys: F and J bumps, then A S D and K L ;',
    gradeRecommended: 'Grade 2',
    category: 'home-row',
    targetKeys: ['f', 'j', 'd', 'k', 's', 'l', 'a', ';'],
    exercises: [
      'f j f j ff jj fj fj',
      'd k d k dd kk dk dk',
      's l s l ss ll sl sl',
      'a ; a ; aa ;; a; a;',
      'asdf jkl; asdf jkl;',
      'fad lad ask fall flask dads',
      'all lads fall as dad asks',
    ],
    requiredAccuracy: 90,
    minWpm: 8,
    ticketReward: 50,
    iconName: 'tent',
  },
  {
    id: 'lesson-2',
    tier: 1,
    title: 'Tent 1B: Home Row Center Reach',
    subtitle: 'Reach with your index fingers to the middle keys: G and H',
    gradeRecommended: 'Grade 2',
    category: 'home-row',
    targetKeys: ['g', 'h', 'f', 'j', 'd', 'k'],
    exercises: [
      'f g f g ff gg fg fg',
      'j h j h jj hh jh jh',
      'f g h j fg hj gf jh',
      'glad half flag hash glad',
      'flash glass dash hall flash',
      'a glad lad had a half glass',
    ],
    requiredAccuracy: 90,
    minWpm: 10,
    ticketReward: 60,
    iconName: 'sparkles',
  },

  // Tier 2: Top Row Trampoline
  {
    id: 'lesson-3',
    tier: 2,
    title: 'Tent 2: Top Row Reaches',
    subtitle: 'Bounce up to R, U, E, I from the home row safely',
    gradeRecommended: 'Grade 3',
    category: 'top-row',
    targetKeys: ['r', 'u', 'e', 'i', 'f', 'j', 'd', 'k'],
    exercises: [
      'f r f r j u j u fr ju',
      'd e d e k i k i de ki',
      'red rug due kid rid jar',
      'fire ride dark lure lake sure',
      'ride safe kid as the fireflies rise',
      'sure kids fill the jar with fresh fruit',
    ],
    requiredAccuracy: 90,
    minWpm: 12,
    ticketReward: 75,
    iconName: 'zap',
  },
  {
    id: 'lesson-4',
    tier: 2,
    title: 'Tent 2B: Full Top Row Whirl',
    subtitle: 'Reach outer corners: Q, W, T, Y, O, P',
    gradeRecommended: 'Grade 3',
    category: 'top-row',
    targetKeys: ['q', 'w', 't', 'y', 'o', 'p'],
    exercises: [
      'a q a q s w s w aq sw',
      'j y j y f t f t jy ft',
      'l o l o ; p ; p lo ;p',
      'pop top pot toy wet quit post play',
      'pretty yellow kites fly over the quiet park',
      'two puppies play with fluffy sweet treats',
    ],
    requiredAccuracy: 90,
    minWpm: 14,
    ticketReward: 85,
    iconName: 'flame',
  },

  // Tier 3: Bottom Row Bumper Cars
  {
    id: 'lesson-5',
    tier: 3,
    title: 'Tent 3: Bottom Row Bumper Cars',
    subtitle: 'Steer downward to Z, X, C, V, B, N, M and punctuation',
    gradeRecommended: 'Grade 3',
    category: 'bottom-row',
    targetKeys: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
    exercises: [
      'f v f v f b f b fv fb',
      'j m j m j n j n jm jn',
      'd c d c s x s x dc sx a z az',
      'cab van box zoo man map nice calm',
      'max can visit the big zoo by the cabin.',
      'brave foxes jump over quick brown rocks.',
    ],
    requiredAccuracy: 92,
    minWpm: 15,
    ticketReward: 100,
    iconName: 'car',
  },

  // Tier 4: Number & Symbol Coaster
  {
    id: 'lesson-6',
    tier: 4,
    title: 'Tent 4: Number & Symbol Coaster',
    subtitle: 'Climb the top coaster track: 1 through 0 with Shift symbols',
    gradeRecommended: 'Grade 4',
    category: 'numbers',
    targetKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '!', '?', "'"],
    exercises: [
      '1 2 3 4 5 and 6 7 8 9 0',
      '10 tickets, 25 points, 100 tokens!',
      'can you type 123 quickly? yes!',
      'room 405 won 1st prize at the fair!',
      "don't stop now! 5 + 5 = 10 big cheers!",
      'the clown had 3 blue hats and 7 red balls!',
    ],
    requiredAccuracy: 90,
    minWpm: 16,
    ticketReward: 120,
    iconName: 'star',
  },

  // Tier 5: Word Midway
  {
    id: 'lesson-7',
    tier: 5,
    title: 'Tent 5: Midway Word Master',
    subtitle: 'High frequency sight words and carnival vocabulary',
    gradeRecommended: 'Grade 4',
    category: 'words',
    targetKeys: ['all'],
    exercises: [
      'fun fair game prize ride spin glow ticket cheer win',
      'magic clown booth popcorn balloon merry music laugh joy',
      'roller coaster ferris wheel cotton candy bumper cars',
      'every student learned good typing habits today at school',
      'friends gather together near the dazzling carnival midway',
      'practice makes your fingers fly like lightning across keys',
    ],
    requiredAccuracy: 92,
    minWpm: 18,
    ticketReward: 150,
    iconName: 'award',
  },

  // Tier 6: Sentence Spectacular
  {
    id: 'lesson-8',
    tier: 6,
    title: 'Tent 6: Grand Finale Spectacular',
    subtitle: 'Full sentences with natural rhythm, speed, and great accuracy',
    gradeRecommended: 'Grade 5',
    category: 'sentences',
    targetKeys: ['all'],
    exercises: [
      'Welcome to the greatest typing carnival in the whole school!',
      'The neon lights twinkled brightly above the bustling arcade tents.',
      'Maya zoomed through the home row without glancing down once.',
      'Leo collected three hundred golden tickets at the claw machine.',
      'Good posture and smooth finger rhythm make typing super easy.',
      'Congratulations on becoming a master carnival keyboard champ!',
    ],
    requiredAccuracy: 94,
    minWpm: 22,
    ticketReward: 200,
    iconName: 'trophy',
  },
];

// Helper to generate a tailored booster drill based on struggling keys
export function generateStruggleKeyDrill(struggleKeys: string[]): Lesson {
  const keys = struggleKeys.length > 0 ? struggleKeys.slice(0, 4) : ['a', 'p', 'b', 'q'];
  const joined = keys.join(' ');
  const drillExercises = [
    `${joined} ${joined} ${joined}`,
    keys.map(k => `${k}${k} ${k} ${k}${k}${k}`).join(' '),
    `focus on ${keys.join(' and ')} with light quick taps`,
    `practice keys: ${keys.map(k => `${k}a${k} ${k}e${k}`).join(' ')}`,
    `you can master ${keys.join(', ')} with carnival pride!`,
  ];

  return {
    id: 'adaptive-booster',
    tier: 0,
    title: 'Midway Booster: Custom Practice',
    subtitle: `Targeted review drill for your focus keys: ${keys.map(k => k.toUpperCase()).join(', ')}`,
    gradeRecommended: 'Grade 3',
    category: 'home-row',
    targetKeys: keys,
    exercises: drillExercises,
    requiredAccuracy: 90,
    minWpm: 10,
    ticketReward: 80,
    iconName: 'sparkles',
  };
}
