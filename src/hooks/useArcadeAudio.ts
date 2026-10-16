import { useCallback } from 'react';
import { sound } from '../utils/audio';

export interface ArcadeAudioControls {
  playLessonComplete: (isMastered?: boolean) => void;
  playPrizeRedeem: () => void;
  playTicketChime: () => void;
  playKeyClick: () => void;
  playKeyError: () => void;
  playBalloonPop: () => void;
  playClawGrab: () => void;
  toggleMute: () => boolean;
  isMuted: boolean;
}

/**
 * Hook to trigger arcade-style carnival sound effects
 */
export function useArcadeAudio(): ArcadeAudioControls {
  const playLessonComplete = useCallback((isMastered: boolean = true) => {
    sound.playLessonComplete(isMastered);
  }, []);

  const playPrizeRedeem = useCallback(() => {
    sound.playPrizeRedeem();
  }, []);

  const playTicketChime = useCallback(() => {
    sound.playTicketChime();
  }, []);

  const playKeyClick = useCallback(() => {
    sound.playKeyClick();
  }, []);

  const playKeyError = useCallback(() => {
    sound.playKeyError();
  }, []);

  const playBalloonPop = useCallback(() => {
    sound.playBalloonPop();
  }, []);

  const playClawGrab = useCallback(() => {
    sound.playClawGrab();
  }, []);

  const toggleMute = useCallback(() => {
    return sound.toggleMute();
  }, []);

  return {
    playLessonComplete,
    playPrizeRedeem,
    playTicketChime,
    playKeyClick,
    playKeyError,
    playBalloonPop,
    playClawGrab,
    toggleMute,
    isMuted: sound.getMuted(),
  };
}
