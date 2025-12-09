import React, { useState } from 'react';

const FlippingCard = ({ 
  width = 300, 
  height = 400, 
  frontContent, 
  backContent,
  onFlip 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (onFlip) {
      onFlip(!isFlipped);
    }
  };

  return (
    <div
      className="cursor-pointer perspective"
      onClick={handleFlip}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500 transform-gpu"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className="absolute w-full h-full"
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          {frontContent}
        </div>

        {/* Back */}
        <div
          className="absolute w-full h-full"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {backContent}
        </div>
      </div>
    </div>
  );
};

export default FlippingCard;
