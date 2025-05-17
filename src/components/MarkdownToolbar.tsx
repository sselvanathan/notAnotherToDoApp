import React from 'react';
import { 
  Bold, Italic, List, ListChecks, Heading, Code, Link as LinkIcon
} from 'lucide-react';
import { Popover } from './Popover';

interface MarkdownToolbarProps {
  onInsert: (markdown: string) => void;
}

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({ onInsert }) => {
  const tools = [
    { icon: <Bold size={16} />, label: 'Bold', markdown: '**Bold text**', select: true, description: 'Makes text bold' },
    { icon: <Italic size={16} />, label: 'Italic', markdown: '*Italic text*', select: true, description: 'Makes text italic' },
    { icon: <Heading size={16} />, label: 'Heading', markdown: '## Heading', select: false, description: 'Creates a heading' },
    { icon: <List size={16} />, label: 'List', markdown: '- List item', select: false, description: 'Creates a bulleted list item' },
    { icon: <ListChecks size={16} />, label: 'Checkbox', markdown: '- [ ] ', select: false, description: 'Creates a checkbox item' },
    { icon: <Code size={16} />, label: 'Code', markdown: '`code`', select: true, description: 'Formats text as code' },
    { icon: <LinkIcon size={16} />, label: 'Link', markdown: '[Link text](url)', select: true, description: 'Creates a hyperlink' },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
      {tools.map((tool, index) => (
        <Popover 
          key={index}
          content={
            <div>
              <div className="font-medium">{tool.label}</div>
              <div className="text-gray-600">{tool.description}</div>
            </div>
          }
        >
          <button
            onClick={() => onInsert(tool.markdown)}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            type="button"
          >
            {tool.icon}
          </button>
        </Popover>
      ))}
    </div>
  );
};
