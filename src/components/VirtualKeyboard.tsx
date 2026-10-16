import React from 'react';
import { KEYBOARD_ROWS, FINGER_COLORS, getKeyInfo } from '../utils/keyboardData';
import { FingerPosition } from '../types';

interface VirtualKeyboardProps {
  activeChar: string;
  lastPressedKey?: string;
  isError?: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  activeChar,
  lastPressedKey,
  isError,
}) => {
  const safeChar = typeof activeChar === 'string' ? activeChar : '';
  const targetKeyInfo = safeChar ? getKeyInfo(safeChar) : undefined;
  const activeFinger: FingerPosition | undefined = targetKeyInfo?.finger;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none">
      {/* Finger Hint Bar */}
      {targetKeyInfo && (
        <div className="mb-3 flex items-center justify-center gap-3 text-sm font-semibold">
          <span className="text-slate-500">Next Finger:</span>
          <span
            className={`px-3 py-1 rounded-md text-xs uppercase tracking-wider font-bold ${
              FINGER_COLORS[targetKeyInfo.finger]?.activeBg || 'bg-slate-800 text-white'
            }`}
          >
            {FINGER_COLORS[targetKeyInfo.finger]?.name}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600 font-mono">
            Key: <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-xs font-bold text-slate-900">{safeChar === ' ' ? 'SPACE' : safeChar}</kbd>
          </span>
        </div>
      )}

      {/* Keyboard Enclosure */}
      <div className="p-3 sm:p-4 bg-slate-900 rounded-2xl shadow-xl border-4 border-amber-400/40 w-full overflow-x-auto">
        <div className="flex flex-col gap-1.5 min-w-[680px]">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1.5">
              {row.map((keyInfo) => {
                const isTarget = safeChar
                  ? (keyInfo.key.toLowerCase() === safeChar.toLowerCase()) ||
                    (keyInfo.shiftKey === safeChar) ||
                    (keyInfo.key === ' ' && safeChar === ' ')
                  : false;

                const isLastPressed = lastPressedKey && typeof lastPressedKey === 'string'
                  ? lastPressedKey.toLowerCase() === keyInfo.key.toLowerCase()
                  : false;
                const fingerMeta = FINGER_COLORS[keyInfo.finger];

                let keyClasses = 'h-11 sm:h-12 flex flex-col items-center justify-center rounded-lg text-xs sm:text-sm font-bold transition-all duration-100 shadow-sm border ';
                
                // Width assignment
                if (keyInfo.width) {
                  keyClasses += `${keyInfo.width} `;
                } else {
                  keyClasses += 'w-10 sm:w-11 ';
                }

                // Styling logic based on target / error / idle
                if (isTarget) {
                  keyClasses += isError
                    ? 'bg-rose-500 text-white border-rose-300 ring-4 ring-rose-400/50 scale-105 z-10 animate-bounce '
                    : `${fingerMeta.activeBg} ring-4 ring-amber-300/80 scale-105 z-10 shadow-lg `;
                } else if (isLastPressed) {
                  keyClasses += 'bg-amber-300 text-slate-950 border-amber-400 scale-95 ';
                } else {
                  // Default subtle finger color coded key
                  keyClasses += `${fingerMeta.bg} ${fingerMeta.border} ${fingerMeta.text} hover:opacity-95 `;
                }

                return (
                  <div
                    key={keyInfo.key}
                    className={keyClasses}
                    title={`${keyInfo.label || keyInfo.key} (${fingerMeta.name})`}
                  >
                    {keyInfo.shiftKey && (
                      <span className="text-[10px] opacity-70 leading-none -mb-0.5">
                        {keyInfo.shiftKey}
                      </span>
                    )}
                    <span className="leading-tight">
                      {keyInfo.label || (keyInfo.key === ' ' ? 'SPACE' : keyInfo.key.toUpperCase())}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Visual Hands Guide Diagram */}
      <div className="mt-4 flex items-center justify-center gap-8 text-xs">
        {/* Left Hand */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-slate-600 mb-1">Left Hand</span>
          <div className="flex items-end gap-1.5 p-2 bg-white rounded-xl border border-slate-200 shadow-xs">
            {/* Left Pinky */}
            <div
              className={`w-4 rounded-t-full transition-all ${
                activeFinger === 'left-pinky' ? 'h-12 bg-rose-500 ring-2 ring-rose-300' : 'h-8 bg-rose-200'
              }`}
              title="Left Pinky"
            />
            {/* Left Ring */}
            <div
              className={`w-4 rounded-t-full transition-all ${
                activeFinger === 'left-ring' ? 'h-15 bg-amber-500 ring-2 ring-amber-300' : 'h-11 bg-amber-200'
              }`}
              title="Left Ring"
            />
            {/* Left Middle */}
            <div
              className={`w-4 rounded-t-full transition-all ${
                activeFinger === 'left-middle' ? 'h-17 bg-emerald-500 ring-2 ring-emerald-300' : 'h-13 bg-emerald-200'
              }`}
              title="Left Middle"
            />
            {/* Left Index */}
            <div
              className={`w-4 rounded-t-full transition-all ${
                activeFinger === 'left-index' ? 'h-14 bg-sky-500 ring-2 ring-sky-300' : 'h-10 bg-sky-200'
              }`}
              title="Left Index"
            />
            {/* Left Thumb */}
            <div
              className={`w-5 rounded-t-full transition-all ${
                activeFinger === 'thumbs' ? 'h-9 bg-slate-700 ring-2 ring-slate-400' : 'h-6 bg-slate-300'
              }`}
              title="Left Thumb"
            />
          </div>
        </div>

        {/* Right Hand */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-slate-600 mb-1">Right Hand</span>
          <div className="flex items-end gap-1.5 p-2 bg-white rounded-xl border border-slate-200 shadow-xs">
            {/* Right Thumb */}
            <div
              className={`w-5 rounded-t-full transition-all ${
                activeFinger === 'thumbs' ? 'h-9 bg-slate-700 ring-2 ring-slate-400' : 'h-6 bg-slate-300'
              }`}
              title="Right Thumb"
            />
            {/* Right Index */}
            <div
              className={`w-4 rounded-t-full transition-all ${
                activeFinger === 'right-index' ? 'h-14 bg-blue-500 ring-2 ring-blue-300' : 'h-10 bg-blue-200'
              }`}
              title="Right Index"
            />
            {/* Right Middle */}
            <div
              className={`w-4 rounded-t-full transition-all ${
                activeFinger === 'right-middle' ? 'h-17 bg-emerald-500 ring-2 ring-emerald-300' : 'h-13 bg-emerald-200'
              }`}
              title="Right Middle"
            />
            {/* Right Ring */}
            <div
              className={`w-4 rounded-t-full transition-all ${
                activeFinger === 'right-ring' ? 'h-15 bg-amber-500 ring-2 ring-amber-300' : 'h-11 bg-amber-200'
              }`}
              title="Right Ring"
            />
            {/* Right Pinky */}
            <div
              className={`w-4 rounded-t-full transition-all ${
                activeFinger === 'right-pinky' ? 'h-12 bg-purple-500 ring-2 ring-purple-300' : 'h-8 bg-purple-200'
              }`}
              title="Right Pinky"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
