import { GradeLevel } from '../types';

export type TestLevelId = 'prek' | 'k' | 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g68';

export interface TestLevel {
  id: TestLevelId;
  label: string; // chip label
  name: string; // long name
  avgLow: number; // typical WPM range for this level
  avgHigh: number;
  goodWpm: number; // "strong for this grade" line
  targetAccuracy: number;
  passages: string[];
}

// Passages are written for TypeCarnival and matched to what a student at each level can read.
// Lower levels type letters and short words so the test measures typing, not reading.
export const TEST_LEVELS: TestLevel[] = [
  {
    id: 'prek',
    label: 'Pre-K',
    name: 'Pre-K',
    avgLow: 2,
    avgHigh: 5,
    goodWpm: 6,
    targetAccuracy: 75,
    passages: [
      'a s d f j k l a s d f j k l',
      'f j f j d k d k s l s l a a',
      'a b c d e f g h i j k l m',
      'n o p q r s t u v w x y z',
      'f f j j d d k k s s l l',
      'a a s s d d f f j j k k',
    ],
  },
  {
    id: 'k',
    label: 'K',
    name: 'Kindergarten',
    avgLow: 5,
    avgHigh: 8,
    goodWpm: 10,
    targetAccuracy: 80,
    passages: [
      'cat dog sun hat run big red fun',
      'I see a cat. I see a dog.',
      'mom dad sit hop pig bus cup map',
      'a fox can run. a bug can hop.',
      'the sun is up. we can go out.',
      'pen jam box top bed fan web zip',
    ],
  },
  {
    id: 'g1',
    label: '1st',
    name: '1st grade',
    avgLow: 8,
    avgHigh: 12,
    goodWpm: 15,
    targetAccuracy: 85,
    passages: [
      'The dog ran to get the red ball.',
      'We like to play in the sand at the beach.',
      'My cat naps on the rug by the door.',
      'Sam has a big blue kite that can fly up high.',
      'We went to the farm and fed the goats.',
      'The frog sat on a log and sang a song.',
    ],
  },
  {
    id: 'g2',
    label: '2nd',
    name: '2nd grade',
    avgLow: 12,
    avgHigh: 18,
    goodWpm: 20,
    targetAccuracy: 88,
    passages: [
      'The class planted seeds in small cups and set them by the window.',
      'A gray squirrel hid three acorns under the old oak tree.',
      'On Friday we rode the bus to the science museum downtown.',
      'Mia drew a map of the park and marked where the swings were.',
      'The baker made warm bread, and the whole street smelled sweet.',
      'Our team cheered when the last runner crossed the finish line.',
    ],
  },
  {
    id: 'g3',
    label: '3rd',
    name: '3rd grade',
    avgLow: 15,
    avgHigh: 22,
    goodWpm: 25,
    targetAccuracy: 90,
    passages: [
      'Sea turtles crawl onto the beach at night to lay their eggs in the warm sand.',
      'The library has a quiet corner with beanbags where we can read after lunch.',
      'Thunder rumbled across the marsh, so we packed up the picnic and ran inside.',
      'My grandfather keeps bees, and every summer he lets me help collect honey.',
      'The shrimp boats came back to the dock just as the sun went down.',
      'When you practice a little every day, hard things slowly become easy.',
    ],
  },
  {
    id: 'g4',
    label: '4th',
    name: '4th grade',
    avgLow: 20,
    avgHigh: 28,
    goodWpm: 30,
    targetAccuracy: 92,
    passages: [
      'Georgia has five regions, and each one has its own landforms, plants, and animals.',
      'The lighthouse on the island has guided ships safely into the harbor for many years.',
      'Before the storm arrived, the families stacked sandbags along the edge of the yard.',
      'Our class voted to raise money for the animal shelter by selling homemade cookies.',
      'A good paragraph starts with a clear topic sentence and ends with a strong closing.',
      'The marsh grass bends with the tide, and fiddler crabs scatter when you step close.',
    ],
  },
  {
    id: 'g5',
    label: '5th',
    name: '5th grade',
    avgLow: 25,
    avgHigh: 35,
    goodWpm: 35,
    targetAccuracy: 95,
    passages: [
      'Scientists study tree rings to learn how much rain fell during each year of a tree\'s life.',
      'The colonists depended on ships to bring tools, cloth, and news from across the ocean.',
      'When the water evaporates, it rises, cools, and forms clouds that will later bring rain.',
      'Our debate team spent weeks gathering evidence, so we felt ready when the judges arrived.',
      'A fraction shows a part of a whole, and equivalent fractions name the same amount.',
      'The museum guide explained how the old rice plantations used tides to flood the fields.',
    ],
  },
  {
    id: 'g68',
    label: '6-8',
    name: 'Middle school',
    avgLow: 30,
    avgHigh: 40,
    goodWpm: 40,
    targetAccuracy: 95,
    passages: [
      'Although the hurricane weakened before landfall, the storm surge still flooded several coastal roads.',
      'In a well-built argument, every claim is supported by evidence, and every piece of evidence is explained.',
      'The ratio of students to computers changed dramatically, from 4:1 in 2015 to nearly 1:1 today.',
      'Ecosystems depend on balance; when one species disappears, the effects ripple through the food web.',
      'Her research question was simple: "Does the amount of sunlight affect how quickly seeds sprout?"',
      'The council approved the plan, but residents asked for more time to review the budget and timeline.',
    ],
  },
];

export const getTestLevel = (id: string): TestLevel =>
  TEST_LEVELS.find(l => l.id === id) || TEST_LEVELS[4];

export const levelForGrade = (grade: GradeLevel): TestLevelId => {
  switch (grade) {
    case 'Grade 2':
      return 'g2';
    case 'Grade 4':
      return 'g4';
    case 'Grade 5':
      return 'g5';
    default:
      return 'g3';
  }
};

// lessonId format: speed-test-1m-g3
export const speedTestLessonId = (minutes: number, level: TestLevelId) => `speed-test-${minutes}m-${level}`;

export const parseSpeedTestLessonId = (lessonId: string): { minutes: number; level: TestLevel } | null => {
  const m = /^speed-test-(\d+)m-([a-z0-9]+)$/.exec(lessonId);
  if (!m) return null;
  return { minutes: Number(m[1]), level: getTestLevel(m[2]) };
};

// Builds a long stream of passages so even a fast 3-minute run never runs out of text.
export const buildTestText = (level: TestLevel, minChars: number): string => {
  const parts: string[] = [];
  let pool: string[] = [];
  let length = 0;
  while (length < minChars) {
    if (pool.length === 0) pool = [...level.passages].sort(() => Math.random() - 0.5);
    const next = pool.pop() as string;
    if (parts.length > 0 && parts[parts.length - 1] === next) continue;
    parts.push(next);
    length += next.length + 1;
  }
  return parts.join(' ');
};

export type BenchmarkBand = 'beginning' | 'developing' | 'on-track' | 'strong';

export const rateResult = (level: TestLevel, wpm: number, accuracy: number): { band: BenchmarkBand; message: string } => {
  if (accuracy < level.targetAccuracy - 5) {
    return {
      band: 'beginning',
      message: `Slow down a little. Accuracy comes first: aim for ${level.targetAccuracy}% before chasing speed.`,
    };
  }
  if (wpm >= level.goodWpm && accuracy >= level.targetAccuracy) {
    return { band: 'strong', message: `Strong result for ${level.name}. Try the next level up or the 3-minute run.` };
  }
  if (wpm >= level.avgLow) {
    return {
      band: 'on-track',
      message:
        accuracy >= level.targetAccuracy
          ? `Right where ${level.name} typists should be. Keep practicing to reach ${level.goodWpm}+ WPM.`
          : `Speed is on track. Tighten accuracy to ${level.targetAccuracy}% and the speed will hold.`,
    };
  }
  return {
    band: 'developing',
    message: `Still building. Lessons and arcade games between tests will move this number. Goal: ${level.avgLow}-${level.avgHigh} WPM.`,
  };
};
