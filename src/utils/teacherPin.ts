import { DEFAULT_TEACHER_PIN_HASH } from '../config';

const STORAGE_KEY_PIN = 'typecarnival_teacher_pin_hash';

const sha256 = async (text: string): Promise<string> => {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(bytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const currentPinHash = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEY_PIN) || DEFAULT_TEACHER_PIN_HASH;
  } catch {
    return DEFAULT_TEACHER_PIN_HASH;
  }
};

export const checkTeacherPin = async (pin: string): Promise<boolean> => {
  return (await sha256(pin.trim())) === currentPinHash();
};

export const setTeacherPin = async (pin: string): Promise<void> => {
  localStorage.setItem(STORAGE_KEY_PIN, await sha256(pin.trim()));
};
