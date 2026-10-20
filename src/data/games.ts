import { TestLevelId } from './speedTest';

export type GameSkill =
  | 'Letters'
  | 'Home Row'
  | 'Top Row'
  | 'Bottom Row'
  | 'Numbers'
  | 'Words'
  | 'Sentences'
  | 'Punctuation'
  | 'Full Keyboard'
  | 'Speed'
  | 'Accuracy'
  | 'Memory';

export const ALL_SKILLS: GameSkill[] = [
  'Letters',
  'Home Row',
  'Top Row',
  'Bottom Row',
  'Numbers',
  'Words',
  'Sentences',
  'Punctuation',
  'Full Keyboard',
  'Speed',
  'Accuracy',
  'Memory',
];

export interface GameMeta {
  id: string; // also the key the hub uses to open the game
  sessionId: string; // lessonId written to the student's sessions
  name: string;
  emoji: string;
  tagline: string;
  grades: TestLevelId[];
  skills: GameSkill[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  minutes: number;
  // Literal Tailwind classes so the build keeps them
  border: string;
  button: string;
  tint: string;
  isNew?: boolean;
  seasonal?: string;
}

export const GAMES: GameMeta[] = [
  {
    id: 'confetti',
    sessionId: 'game-confetti-cannon',
    name: 'Confetti Cannon',
    emoji: '🎊',
    tagline: 'Letters rain down from the confetti cannon. Press each one before it lands!',
    grades: ['prek', 'k', 'g1'],
    skills: ['Letters'],
    difficulty: 1,
    minutes: 2,
    border: 'border-pink-300',
    button: 'bg-pink-500 hover:bg-pink-600 text-white',
    tint: 'bg-pink-100',
    isNew: true,
  },
  {
    id: 'parade',
    sessionId: 'game-alphabet-parade',
    name: 'Alphabet Parade',
    emoji: '🐘',
    tagline: 'Type A to Z in order. Every letter adds an animal to the circus parade. No timer.',
    grades: ['prek', 'k', 'g1'],
    skills: ['Letters'],
    difficulty: 1,
    minutes: 3,
    border: 'border-lime-300',
    button: 'bg-lime-600 hover:bg-lime-700 text-white',
    tint: 'bg-lime-100',
    isNew: true,
  },
  {
    id: 'balloons',
    sessionId: 'game-balloon-dart',
    name: 'Balloon Dart Pop',
    emoji: '🎈',
    tagline: 'Pop floating letter balloons before they escape into the sky.',
    grades: ['k', 'g1', 'g2'],
    skills: ['Letters', 'Home Row'],
    difficulty: 1,
    minutes: 1,
    border: 'border-rose-300',
    button: 'bg-rose-600 hover:bg-rose-700 text-white',
    tint: 'bg-rose-100',
  },
  {
    id: 'numbers',
    sessionId: 'game-number-wheel',
    name: 'Lucky Number Wheel',
    emoji: '🔢',
    tagline: 'Numbers float up from the prize wheel. Tap 0 through 9 on the number row to catch them.',
    grades: ['k', 'g1', 'g2'],
    skills: ['Numbers'],
    difficulty: 1,
    minutes: 1,
    border: 'border-violet-300',
    button: 'bg-violet-600 hover:bg-violet-700 text-white',
    tint: 'bg-violet-100',
    isNew: true,
  },
  {
    id: 'ringtoss',
    sessionId: 'game-home-row-ring-toss',
    name: 'Home Row Ring Toss',
    emoji: '🥫',
    tagline: 'Only A S D F G H J K L ; fall here. Keep your fingers on the bumps and toss rings!',
    grades: ['g1', 'g2'],
    skills: ['Home Row', 'Letters'],
    difficulty: 2,
    minutes: 1,
    border: 'border-sky-300',
    button: 'bg-sky-600 hover:bg-sky-700 text-white',
    tint: 'bg-sky-100',
    isNew: true,
  },
  {
    id: 'ferris',
    sessionId: 'game-top-row-ferris',
    name: 'Top Row Ferris Wheel',
    emoji: '🎡',
    tagline: 'Reach up for Q W E R T Y U I O P as the carts drop past. Snap back to home row after each key.',
    grades: ['g1', 'g2', 'g3'],
    skills: ['Top Row', 'Letters'],
    difficulty: 2,
    minutes: 1,
    border: 'border-orange-300',
    button: 'bg-orange-500 hover:bg-orange-600 text-white',
    tint: 'bg-orange-100',
    isNew: true,
  },
  {
    id: 'bumper',
    sessionId: 'game-bottom-row-bumper',
    name: 'Bottom Row Bumper Cars',
    emoji: '🚗',
    tagline: 'Bumper cars zoom across carrying Z X C V B N M. Reach down and bump them out!',
    grades: ['g1', 'g2', 'g3'],
    skills: ['Bottom Row', 'Letters'],
    difficulty: 2,
    minutes: 1,
    border: 'border-teal-300',
    button: 'bg-teal-600 hover:bg-teal-700 text-white',
    tint: 'bg-teal-100',
    isNew: true,
  },
  {
    id: 'memory',
    sessionId: 'game-fortune-memory',
    name: 'Fortune Teller Memory',
    emoji: '🔮',
    tagline: 'The crystal ball flashes letters, then hides them. Type them back from memory.',
    grades: ['g2', 'g3', 'g4', 'g5'],
    skills: ['Memory', 'Letters', 'Words', 'Accuracy'],
    difficulty: 3,
    minutes: 4,
    border: 'border-purple-300',
    button: 'bg-purple-600 hover:bg-purple-700 text-white',
    tint: 'bg-purple-100',
    isNew: true,
  },
  {
    id: 'clouds',
    sessionId: 'game-cotton-candy-clouds',
    name: 'Cotton Candy Clouds',
    emoji: '🍭',
    tagline: 'Sight words drift up on cotton candy clouds. Type a whole word to grab it before it floats away.',
    grades: ['g2', 'g3'],
    skills: ['Words'],
    difficulty: 3,
    minutes: 1,
    border: 'border-fuchsia-300',
    button: 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white',
    tint: 'bg-fuchsia-100',
    isNew: true,
  },
  {
    id: 'tickets',
    sessionId: 'game-ticket-sprint',
    name: 'Ticket Roller Sprint',
    emoji: '🎟️',
    tagline: 'Type carnival words to crank tickets out of the dispenser in a 60-second burst.',
    grades: ['g2', 'g3', 'g4'],
    skills: ['Words', 'Speed'],
    difficulty: 3,
    minutes: 1,
    border: 'border-yellow-400',
    button: 'bg-amber-500 hover:bg-amber-600 text-amber-950',
    tint: 'bg-yellow-100',
  },
  {
    id: 'claw',
    sessionId: 'game-claw-machine',
    name: 'Claw Machine Word Grab',
    emoji: '🧸',
    tagline: 'Type target words with zero errors to drop the claw and rescue plushies.',
    grades: ['g2', 'g3', 'g4', 'g5'],
    skills: ['Words', 'Accuracy'],
    difficulty: 3,
    minutes: 3,
    border: 'border-indigo-300',
    button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    tint: 'bg-indigo-100',
  },
  {
    id: 'funhouse',
    sessionId: 'game-haunted-funhouse',
    name: 'Haunted Funhouse',
    emoji: '👻',
    tagline: 'Friendly ghosts drift toward the lantern carrying words. Type each word to send its ghost home. 3 lives.',
    grades: ['g2', 'g3', 'g4', 'g5'],
    skills: ['Words', 'Full Keyboard', 'Accuracy'],
    difficulty: 3,
    minutes: 2,
    border: 'border-slate-400',
    button: 'bg-slate-800 hover:bg-slate-900 text-white',
    tint: 'bg-slate-200',
    isNew: true,
    seasonal: 'October',
  },
  {
    id: 'kart',
    sessionId: 'game-go-kart',
    name: 'Go-Kart Grand Prix',
    emoji: '🏎️',
    tagline: 'Race the carnival pace car. Every word you type pushes your kart forward. Mistakes cost speed.',
    grades: ['g3', 'g4', 'g5', 'g68'],
    skills: ['Words', 'Speed', 'Full Keyboard'],
    difficulty: 4,
    minutes: 1,
    border: 'border-red-300',
    button: 'bg-red-600 hover:bg-red-700 text-white',
    tint: 'bg-red-100',
    isNew: true,
  },
  {
    id: 'sentences',
    sessionId: 'game-sentence-parade',
    name: 'Big Top Sentence Parade',
    emoji: '🎪',
    tagline: 'Type each sentence exactly, capitals and punctuation included, to march the parade to the next ring.',
    grades: ['g3', 'g4', 'g5', 'g68'],
    skills: ['Sentences', 'Punctuation', 'Accuracy'],
    difficulty: 4,
    minutes: 2,
    border: 'border-amber-400',
    button: 'bg-amber-600 hover:bg-amber-700 text-white',
    tint: 'bg-amber-100',
    isNew: true,
  },
  {
    id: 'ringmaster',
    sessionId: 'game-ringmaster-60',
    name: 'Ringmaster Challenge',
    emoji: '🎩',
    tagline: '60 or 120 seconds. Passages get harder as the clock runs. Score = WPM × accuracy.',
    grades: ['g4', 'g5', 'g68'],
    skills: ['Full Keyboard', 'Speed', 'Accuracy', 'Punctuation'],
    difficulty: 5,
    minutes: 2,
    border: 'border-blue-300',
    button: 'bg-blue-700 hover:bg-blue-800 text-white',
    tint: 'bg-blue-100',
    isNew: true,
  },
];

export const getGame = (id: string) => GAMES.find(g => g.id === id);

export const GRADE_CHIPS: { id: TestLevelId; label: string }[] = [
  { id: 'prek', label: 'Pre-K' },
  { id: 'k', label: 'K' },
  { id: 'g1', label: '1st' },
  { id: 'g2', label: '2nd' },
  { id: 'g3', label: '3rd' },
  { id: 'g4', label: '4th' },
  { id: 'g5', label: '5th' },
  { id: 'g68', label: '6-8' },
];

export const gradeLabel = (id: TestLevelId) => GRADE_CHIPS.find(c => c.id === id)?.label || id;

// Simple, original word banks shared by the word games
export const WORD_BANKS = {
  sight: [
    'the', 'and', 'see', 'can', 'play', 'jump', 'run', 'look', 'come', 'here', 'said', 'went',
    'big', 'little', 'make', 'help', 'find', 'yellow', 'blue', 'red', 'down', 'away', 'funny', 'where',
    'like', 'have', 'they', 'what', 'good', 'into', 'ride', 'saw', 'now', 'please', 'want', 'well',
  ],
  carnival: [
    'ticket', 'prize', 'clown', 'popcorn', 'balloon', 'circus', 'ferris', 'wheel', 'candy', 'juggle',
    'parade', 'magic', 'acrobat', 'tent', 'booth', 'cotton', 'lemonade', 'carousel', 'trophy', 'confetti',
    'music', 'drum', 'trumpet', 'lion', 'tiger', 'seal', 'stilts', 'tightrope', 'cannon', 'spotlight',
  ],
  spooky: [
    'boo', 'ghost', 'moon', 'bat', 'owl', 'cat', 'web', 'mask', 'candy', 'cape', 'broom', 'witch',
    'pumpkin', 'lantern', 'shadow', 'whisper', 'creak', 'midnight', 'haunted', 'spider', 'skeleton',
    'costume', 'treat', 'trick', 'howl', 'fog', 'cobweb', 'creepy', 'potion', 'mummy',
  ],
  race: [
    'speed', 'fast', 'turn', 'track', 'gear', 'brake', 'pit', 'lap', 'flag', 'zoom', 'engine', 'driver',
    'helmet', 'corner', 'finish', 'start', 'race', 'wheel', 'tire', 'fuel', 'pass', 'lead', 'boost',
    'steer', 'rocket', 'bolt', 'dash', 'sprint', 'champion', 'victory', 'rapid', 'swift', 'quick',
  ],
};
