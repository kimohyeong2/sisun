import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

// Notion design: feature-card chrome
export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white p-8 rounded-xl shadow-sm border border-[#e6e6e6] ${className}`}>
      {children}
    </div>
  );
};
