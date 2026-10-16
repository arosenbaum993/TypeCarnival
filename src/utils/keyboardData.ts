import { FingerPosition, KeyInfo } from '../types';

export const KEYBOARD_ROWS: KeyInfo[][] = [
  // Number Row (Row 1)
  [
    { key: '`', shiftKey: '~', finger: 'left-pinky', row: 1 },
    { key: '1', shiftKey: '!', finger: 'left-pinky', row: 1 },
    { key: '2', shiftKey: '@', finger: 'left-ring', row: 1 },
    { key: '3', shiftKey: '#', finger: 'left-middle', row: 1 },
    { key: '4', shiftKey: '$', finger: 'left-index', row: 1 },
    { key: '5', shiftKey: '%', finger: 'left-index', row: 1 },
    { key: '6', shiftKey: '^', finger: 'right-index', row: 1 },
    { key: '7', shiftKey: '&', finger: 'right-index', row: 1 },
    { key: '8', shiftKey: '*', finger: 'right-middle', row: 1 },
    { key: '9', shiftKey: '(', finger: 'right-ring', row: 1 },
    { key: '0', shiftKey: ')', finger: 'right-pinky', row: 1 },
    { key: '-', shiftKey: '_', finger: 'right-pinky', row: 1 },
    { key: '=', shiftKey: '+', finger: 'right-pinky', row: 1 },
    { key: 'Backspace', label: 'delete', finger: 'right-pinky', row: 1, width: 'w-16' },
  ],
  // Top Row (Row 2)
  [
    { key: 'Tab', label: 'tab', finger: 'left-pinky', row: 2, width: 'w-14' },
    { key: 'q', shiftKey: 'Q', finger: 'left-pinky', row: 2 },
    { key: 'w', shiftKey: 'W', finger: 'left-ring', row: 2 },
    { key: 'e', shiftKey: 'E', finger: 'left-middle', row: 2 },
    { key: 'r', shiftKey: 'R', finger: 'left-index', row: 2 },
    { key: 't', shiftKey: 'T', finger: 'left-index', row: 2 },
    { key: 'y', shiftKey: 'Y', finger: 'right-index', row: 2 },
    { key: 'u', shiftKey: 'U', finger: 'right-index', row: 2 },
    { key: 'i', shiftKey: 'I', finger: 'right-middle', row: 2 },
    { key: 'o', shiftKey: 'O', finger: 'right-ring', row: 2 },
    { key: 'p', shiftKey: 'P', finger: 'right-pinky', row: 2 },
    { key: '[', shiftKey: '{', finger: 'right-pinky', row: 2 },
    { key: ']', shiftKey: '}', finger: 'right-pinky', row: 2 },
    { key: '\\', shiftKey: '|', finger: 'right-pinky', row: 2 },
  ],
  // Home Row (Row 3)
  [
    { key: 'CapsLock', label: 'caps', finger: 'left-pinky', row: 3, width: 'w-16' },
    { key: 'a', shiftKey: 'A', finger: 'left-pinky', row: 3 },
    { key: 's', shiftKey: 'S', finger: 'left-ring', row: 3 },
    { key: 'd', shiftKey: 'D', finger: 'left-middle', row: 3 },
    { key: 'f', shiftKey: 'F', finger: 'left-index', row: 3 },
    { key: 'g', shiftKey: 'G', finger: 'left-index', row: 3 },
    { key: 'h', shiftKey: 'H', finger: 'right-index', row: 3 },
    { key: 'j', shiftKey: 'J', finger: 'right-index', row: 3 },
    { key: 'k', shiftKey: 'K', finger: 'right-middle', row: 3 },
    { key: 'l', shiftKey: 'L', finger: 'right-ring', row: 3 },
    { key: ';', shiftKey: ':', finger: 'right-pinky', row: 3 },
    { key: "'", shiftKey: '"', finger: 'right-pinky', row: 3 },
    { key: 'Enter', label: 'return', finger: 'right-pinky', row: 3, width: 'w-20' },
  ],
  // Bottom Row (Row 4)
  [
    { key: 'Shift', label: 'shift', finger: 'left-pinky', row: 4, width: 'w-20' },
    { key: 'z', shiftKey: 'Z', finger: 'left-pinky', row: 4 },
    { key: 'x', shiftKey: 'X', finger: 'left-ring', row: 4 },
    { key: 'c', shiftKey: 'C', finger: 'left-middle', row: 4 },
    { key: 'v', shiftKey: 'V', finger: 'left-index', row: 4 },
    { key: 'b', shiftKey: 'B', finger: 'left-index', row: 4 },
    { key: 'n', shiftKey: 'N', finger: 'right-index', row: 4 },
    { key: 'm', shiftKey: 'M', finger: 'right-index', row: 4 },
    { key: ',', shiftKey: '<', finger: 'right-middle', row: 4 },
    { key: '.', shiftKey: '>', finger: 'right-ring', row: 4 },
    { key: '/', shiftKey: '?', finger: 'right-pinky', row: 4 },
    { key: 'ShiftRight', label: 'shift', finger: 'right-pinky', row: 4, width: 'w-20' },
  ],
  // Space Row (Row 5)
  [
    { key: ' ', label: 'space', finger: 'thumbs', row: 5, width: 'w-72' },
  ]
];

export const FINGER_COLORS: Record<FingerPosition, {
  bg: string;
  border: string;
  text: string;
  activeBg: string;
  name: string;
  hand: 'Left' | 'Right';
}> = {
  'left-pinky': {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    activeBg: 'bg-rose-500 text-white shadow-rose-200',
    name: 'Left Pinky',
    hand: 'Left'
  },
  'left-ring': {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    activeBg: 'bg-amber-500 text-white shadow-amber-200',
    name: 'Left Ring Finger',
    hand: 'Left'
  },
  'left-middle': {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    activeBg: 'bg-emerald-500 text-white shadow-emerald-200',
    name: 'Left Middle Finger',
    hand: 'Left'
  },
  'left-index': {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-800',
    activeBg: 'bg-sky-500 text-white shadow-sky-200',
    name: 'Left Index Finger',
    hand: 'Left'
  },
  'right-index': {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    activeBg: 'bg-blue-500 text-white shadow-blue-200',
    name: 'Right Index Finger',
    hand: 'Right'
  },
  'right-middle': {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    activeBg: 'bg-emerald-500 text-white shadow-emerald-200',
    name: 'Right Middle Finger',
    hand: 'Right'
  },
  'right-ring': {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    activeBg: 'bg-amber-500 text-white shadow-amber-200',
    name: 'Right Ring Finger',
    hand: 'Right'
  },
  'right-pinky': {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    activeBg: 'bg-purple-500 text-white shadow-purple-200',
    name: 'Right Pinky',
    hand: 'Right'
  },
  'thumbs': {
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    text: 'text-slate-800',
    activeBg: 'bg-slate-700 text-white shadow-slate-300',
    name: 'Thumb',
    hand: 'Left'
  }
};

// Fast lookup by character
const KEY_MAP = new Map<string, KeyInfo>();

KEYBOARD_ROWS.flat().forEach(info => {
  KEY_MAP.set(info.key.toLowerCase(), info);
  if (info.shiftKey) {
    KEY_MAP.set(info.shiftKey, info);
  }
});

export function getKeyInfo(char: string): KeyInfo | undefined {
  if (char === ' ') return KEY_MAP.get(' ');
  return KEY_MAP.get(char.toLowerCase()) || KEY_MAP.get(char);
}
