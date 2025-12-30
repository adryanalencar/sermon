
import React, { useRef, useEffect } from 'react';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const VisualEditor = ({ content, onChange, onDrop }) => {
  const editorRef = useRef(null);

  // Initial content load - rough conversion from markdown to HTML for display
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerText) {
      if (content.trim() === '') {
        editorRef.current.innerHTML = '<p><br/></p>';
        return;
      }
      
      // Very basic Markdown -> HTML parser for initial load
      // In a real production app, use a proper parser library
      let html = content
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
        .replace(/\*(.*?)\*/gim, '<i>$1</i>')
        .replace(/> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/\n/gim, '<br/>');
      
      // Only update if significantly different to avoid cursor jumping
      if (Math.abs(editorRef.current.innerHTML.length - html.length) > 10) {
        editorRef.current.innerHTML = html;
      }
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      // Basic HTML -> Markdown conversion on save
      let text = editorRef.current.innerHTML;
      
      // Replace HTML tags with Markdown
      text = text
        .replace(/<h1>(.*?)<\/h1>/gim, '# $1\n')
        .replace(/<h2>(.*?)<\/h2>/gim, '## $1\n')
        .replace(/<b>(.*?)<\/b>/gim, '**$1**')
        .replace(/<strong>(.*?)<\/strong>/gim, '**$1**')
        .replace(/<i>(.*?)<\/i>/gim, '*$1*')
        .replace(/<em>(.*?)<\/em>/gim, '*$1*')
        .replace(/<blockquote>(.*?)<\/blockquote>/gim, '> $1\n')
        .replace(/<br\s*\/?>/gim, '\n')
        .replace(/<div>/gim, '\n')
        .replace(/<\/div>/gim, '')
        .replace(/<p>/gim, '')
        .replace(/<\/p>/gim, '\n\n')
        .replace(/&nbsp;/gim, ' ');

      // Clean up multiple newlines
      text = text.replace(/\n{3,}/g, '\n\n').trim();
      
      onChange(text);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleInput();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDropEvent = (e) => {
    e.preventDefault();
    const verseData = e.dataTransfer.getData('application/json');
    if (verseData) {
      try {
        const verse = JSON.parse(verseData);
        // Insert verse at cursor
        const textToInsert = `> **${verse.ref}**\n> ${verse.text}\n\n`;
        document.execCommand('insertText', false, textToInsert);
        handleInput();
        toast({ title: "Verse Added", description: `Added ${verse.ref} to editor` });
      } catch (err) {
        console.error("Failed to parse verse data", err);
      }
    } else {
      onDrop && onDrop(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Visual Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-slate-700 bg-cream-50/50 dark:bg-slate-900/50">
        <Button variant="ghost" size="sm" onClick={() => execCommand('formatBlock', 'H1')} title="Heading 1" className="h-8 w-8 p-0">
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => execCommand('formatBlock', 'H2')} title="Heading 2" className="h-8 w-8 p-0">
          <Heading2 className="w-4 h-4" />
        </Button>
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
        <Button variant="ghost" size="sm" onClick={() => execCommand('bold')} title="Bold" className="h-8 w-8 p-0">
          <Bold className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => execCommand('italic')} title="Italic" className="h-8 w-8 p-0">
          <Italic className="w-4 h-4" />
        </Button>
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
        <Button variant="ghost" size="sm" onClick={() => execCommand('insertUnorderedList')} title="Bullet List" className="h-8 w-8 p-0">
          <List className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => execCommand('insertOrderedList')} title="Numbered List" className="h-8 w-8 p-0">
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => execCommand('formatBlock', 'BLOCKQUOTE')} title="Quote" className="h-8 w-8 p-0">
          <Quote className="w-4 h-4" />
        </Button>
        <div className="flex-1" />
        <span className="text-xs text-slate-400 select-none mr-2">Markdown Saved</span>
      </div>

      {/* Editor Content */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onDragOver={handleDragOver}
        onDrop={handleDropEvent}
        className="visual-editor flex-1 p-8 outline-none overflow-y-auto"
        style={{ minHeight: '100px' }}
      />
    </div>
  );
};

export default VisualEditor;
