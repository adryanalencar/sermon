
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

const QuickCapture = ({ folders, onCreateNote }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('none');

  const handleQuickCapture = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note.",
        variant: "destructive",
      });
      return;
    }

    onCreateNote({
      title: title.trim(),
      content: content.trim() || `# ${title.trim()}\n\n`,
      folderId: selectedFolder === 'none' ? null : selectedFolder,
    });

    setTitle('');
    setContent('');
    setSelectedFolder('none');

    toast({
      title: "Note captured!",
      description: "Your note has been created successfully.",
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-serif font-semibold text-slate-800 dark:text-cream-50">
          Quick Capture
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Quickly capture your thoughts
        </p>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor="quick-title" className="text-slate-700 dark:text-slate-300">
            Title
          </Label>
          <Input
            id="quick-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label htmlFor="quick-folder" className="text-slate-700 dark:text-slate-300">
            Folder
          </Label>
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600">
              <SelectValue placeholder="Select folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Root (No folder)
                </span>
              </SelectItem>
              {folders.map(folder => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <Label htmlFor="quick-content" className="text-slate-700 dark:text-slate-300">
            Content (Optional)
          </Label>
          <Textarea
            id="quick-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing... Use [[Note Title]] for WikiLinks"
            className="min-h-[200px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 font-mono text-sm resize-none"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleQuickCapture}
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4" />
            Create Note
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-4 border-t border-slate-200 dark:border-slate-700"
        >
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Quick Tips
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Use [[Note Title]] to create links between notes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Notes auto-save when you edit them</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Organize with folders for better structure</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default QuickCapture;
