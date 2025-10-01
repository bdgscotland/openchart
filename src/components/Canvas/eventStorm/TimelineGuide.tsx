import React from 'react';
import { ArrowRight } from 'lucide-react';
import './TimelineGuide.css';

interface TimelineGuideProps {
  visible?: boolean;
  showSwimLanes?: boolean;
}

/**
 * Timeline Direction Guide
 * Shows chronological flow direction and optional swim lanes for Event Storming workshops
 */
export const TimelineGuide: React.FC<TimelineGuideProps> = ({
  visible = true,
  showSwimLanes = true
}) => {
  if (!visible) return null;

  // Generate swim lanes for snapping visualization
  const swimLaneHeight = 180;
  const numberOfLanes = 20; // Enough to cover most canvas sizes
  const swimLanes = Array.from({ length: numberOfLanes }, (_, i) => i * swimLaneHeight);

  return (
    <>
      {/* Swim lanes background */}
      {showSwimLanes && (
        <div className="timeline-swim-lanes">
          {swimLanes.map((y, index) => (
            <div
              key={index}
              className="swim-lane"
              style={{ top: `${y}px` }}
            />
          ))}
        </div>
      )}

      {/* Direction indicator */}
      <div className="timeline-guide">
        <div className="timeline-guide-content">
          <span className="timeline-text">Time flows</span>
          <ArrowRight size={24} className="timeline-arrow" />
        </div>
      </div>
    </>
  );
};

export default TimelineGuide;
