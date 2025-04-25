import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';

function StarRating({ max = 5, initialRating = 0, onRating }) {
  const [hoverValue, setHoverValue] = useState(null);

  const handleMouseMove = (e, index) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const hoverVal = x < width / 2 ? index + 0.5 : index + 1;
    setHoverValue(hoverVal);
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const handleRate = (e, index) => {
    try { 
      const { left, width } = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - left;
      const isHalf = x < width / 2;
      const newValue = isHalf ? index + 0.5 : index + 1;   
      onRating(newValue);
    } catch (error) {
      console.error("Error in handleRate", error);
    }
  };

  return (
    <div>
      {[...Array(max)].map((_, i) => {
        const value = i + 1;
        const current = hoverValue ?? initialRating;

        let icon = faStar;
        let colorClass = "text-gray-300";

        if (current >= value) {
          colorClass = "text-yellow-400";
        } else if (current >= value - 0.5) {
          icon = faStarHalfAlt;
          colorClass = "text-yellow-400";
        }

        return (
          <span
            key={i}
            className="cursor-pointer text-xl"
            onClick={(e) => handleRate(e, i)}
            onMouseMove={(e) => handleMouseMove(e, i)}
            onMouseLeave={handleMouseLeave}
          >
            <FontAwesomeIcon icon={icon} className={colorClass} />
          </span>
        );
      })}
    </div>
  );
}

export default StarRating;