import React, { useRef, useEffect } from 'react';
import { Bold, Italic, List } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, className, placeholder }) => {
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync external value changes to contentEditable
  useEffect(() => {
    if (contentEditableRef.current) {
      if (contentEditableRef.current.innerHTML !== value && !isInternalChange.current) {
        contentEditableRef.current.innerHTML = value;
      }
      // Reset internal change flag after sync check
      isInternalChange.current = false;
    }
  }, [value]);

  const execCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    if (contentEditableRef.current) {
        handleInput();
        contentEditableRef.current.focus();
    }
  };

  const handleInput = () => {
    if (contentEditableRef.current) {
      isInternalChange.current = true;
      onChange(contentEditableRef.current.innerHTML);
    }
  };

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-700 flex flex-col ${className}`}>
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 transition-colors"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={contentEditableRef}
        className="flex-grow p-3 min-h-[150px] focus:outline-none dark:text-white rich-text overflow-y-auto"
        contentEditable
        onInput={handleInput}
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
      />
    </div>
  );
};
