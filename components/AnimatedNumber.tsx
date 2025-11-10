import React, { useState, useEffect, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value }) => {
  const [currentValue, setCurrentValue] = useState(value);
  const frameRef = useRef<number | undefined>();
  const prevValueRef = useRef(value);

  // Fix: Pass the animation frame ID to cancelAnimationFrame to prevent memory leaks.
  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    const duration = 500;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }
      
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const nextValue = startValue + (endValue - startValue) * progress;

      setCurrentValue(nextValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      prevValueRef.current = value;
    };
  }, [value]);

  return <span>{currentValue.toFixed(0)}</span>;
};