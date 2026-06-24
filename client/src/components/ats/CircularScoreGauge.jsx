import React from 'react';

const CircularScoreGauge = ({ score = 0 }) => {
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const getColor = (s) => {
    if (s <= 49) return '#EF4444';
    if (s <= 74) return '#F59E0B';
    return '#22C55E';
  };

  const color = getColor(clampedScore);

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
        {/* Score text centered */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="2.5rem"
          fontWeight="bold"
          fill={color}
          style={{ transition: 'fill 0.3s ease' }}
        >
          {clampedScore}
        </text>
      </svg>
    </div>
  );
};

export default CircularScoreGauge;
