"use client";

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;           // current average (0–5)
  count?: number;          // number of votes
  interactive?: boolean;   // allow clicking
  onRate?: (stars: number) => void;
  userRating?: number;     // star the current user already chose
  size?: 'sm' | 'md';
  showCount?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  count,
  interactive = false,
  onRate,
  userRating,
  size = 'md',
  showCount = true,
}) => {
  const [hovered, setHovered] = useState(0);

  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  const getStarFill = (index: number) => {
    const active = interactive ? (hovered || userRating || 0) : value;
    if (index <= Math.floor(active)) return 'filled';
    if (index === Math.ceil(active) && active % 1 >= 0.5) return 'half';
    return 'empty';
  };

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => interactive && setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map(i => {
          const fill = getStarFill(i);
          const isUserStar = userRating === i;
          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
              onMouseEnter={() => interactive && setHovered(i)}
              onClick={() => interactive && onRate?.(i)}
            >
              <Star
                className={`${starSize} transition-colors ${
                  fill === 'filled'
                    ? isUserStar
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-primary text-primary'
                    : fill === 'half'
                      ? 'fill-primary/50 text-primary'
                      : interactive && i <= hovered
                        ? 'fill-primary/30 text-primary/50'
                        : 'fill-none text-muted-foreground/50'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showCount && (
        <span className={`${textSize} text-muted-foreground`}>
          {value > 0 ? value.toFixed(1) : ''}
          {count !== undefined && count > 0 && (
            <span className="ms-1 opacity-70">({count})</span>
          )}
          {(!count || count === 0) && value === 0 && (
            <span className="opacity-50">{interactive ? 'قيّم' : '—'}</span>
          )}
        </span>
      )}
    </div>
  );
};

export default StarRating;
