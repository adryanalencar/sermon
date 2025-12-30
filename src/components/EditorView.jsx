
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Link as LinkIcon, Network, SplitSquareHorizontal, PanelRightClose, PanelRightOpen, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import VisualEditor from '@/components/VisualEditor';
import FlowchartEditor from '@/components/FlowchartEditor';
import BiblePanel from '@/components/BiblePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EditorView = ({ note, onUpdateNote, onDeleteNote, onNoteSelect }) => {
  const [title, setTitle] = useState(note.title);
  const [showSidebar, setShowSidebar] = useState(true);
  const saveTimeoutRef = useRef(null);

  const handleAutoSave = (newContent) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      onUpdateNote(note.id, {
        title,
        content: newContent,
      });
      
      toast({
        title: "Saved",
        description: "Document saved automatically.",
        duration: 1000,
      });
    }, 2000);
  };

  const handleContentChange = (newContent) => {
    handleAutoSave(newContent);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${note.title}"?`)) {
      onDeleteNote(note.id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Editor Header */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex-1 max-w-2xl">
           <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              onUpdateNote(note.id, { title: e.target.value });
            }}
            className="text-lg font-serif font-bold border-transparent hover:border-slate-200 focus:border-blue-300 bg-transparent px-2 h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 mr-2 flex items-center gap-1">
            <Save className="w-3 h-3" /> Auto-save on
          </span>
          <Button variant="ghost" size="icon" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <Button variant="ghost" size="icon" onClick={() => setShowSidebar(!showSidebar)} title="Toggle Sidebar">
             {showSidebar ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Visual Editor */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full`}>
           <VisualEditor 
            content={note.content} 
            onChange={handleContentChange}
           />
        </div>

        {/* Right: Sidebar (Flowchart & Bible) */}
        {showSidebar && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col shadow-xl z-10"
          >
            <Tabs defaultValue="bible" className="flex-1 flex flex-col">
              <div className="px-2 pt-2 border-b border-slate-100 dark:border-slate-700">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="bible" className="text-xs">Bible Database</TabsTrigger>
                  <TabsTrigger value="flowchart" className="text-xs">Sermon Map</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="bible" className="flex-1 mt-0 overflow-hidden">
                <BiblePanel />
              </TabsContent>
              
              <TabsContent value="flowchart" className="flex-1 mt-0 overflow-hidden relative">
                 <FlowchartEditor 
                   noteId={note.id} 
                 />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EditorView;
