import React from 'react';
import { ArrowRight } from 'lucide-react';
import './TimelineGuide.css';

interface TimelineGuideProps {
  visible?: boolean;
}

/**
 * Timeline Direction Guide
 * Shows chronological flow direction for Event Storming workshops
 */
export const TimelineGuide: React.FC<TimelineGuideProps> = ({ visible = true }) => {
  if (!visible) return null;

  return (
    <div className="timeline-guide">
      <div className="timeline-guide-content">
        <span className="timeline-text">Time flows</span>
        <ArrowRight size={24} className="timeline-arrow" />
      </div>
    </div>
  );
};

export default TimelineGuide;
