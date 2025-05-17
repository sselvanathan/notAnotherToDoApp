import React from 'react';

interface PopoverProps {
  content: React.ReactNode;
  children: React.ReactNode;
}

export const Popover: React.FC<PopoverProps> = ({ content, children }) => {
  return (
    <div className="group relative inline-block">
      {/* Trigger element */}
      <div className="inline-block">
        {children}
      </div>

      {/* Tooltip/Popover content */}
      <div className="absolute left-0 top-full mt-1 w-max min-w-[120px] max-w-[300px] 
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                      transition-all duration-150 ease-in-out z-50">
        <div className="bg-white border border-gray-200 rounded-md shadow-md p-2 text-sm">
          {content}
        </div>
      </div>
    </div>
  );
};
