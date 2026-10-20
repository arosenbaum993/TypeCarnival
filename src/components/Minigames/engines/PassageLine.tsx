import React from 'react';

// Shows a passage with typed text in green, the next character highlighted, and the rest plain.
export const PassageLine: React.FC<{ text: string; pos: number; error: boolean; className?: string }> = ({
  text,
  pos,
  error,
  className = '',
}) => {
  const next = text[pos];
  return (
    <div className={`font-mono leading-relaxed break-words ${className}`}>
      <span className="text-emerald-500">{text.slice(0, pos)}</span>
      {next !== undefined && (
        <span className={`${error ? 'bg-rose-500 text-white' : 'bg-amber-300 text-slate-950'} rounded px-0.5`}>
          {next === ' ' ? ' ' : next}
        </span>
      )}
      <span className="opacity-90">{text.slice(pos + 1)}</span>
    </div>
  );
};
