
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Folder, FolderPlus, File, FilePlus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FolderTree = ({ folders, notes, onNoteSelect, onCreateFolder, onUpdateFolder, onDeleteFolder, onCreateNote }) => {
  const [expandedFolders, setExpandedFolders] = useState({});
  const [newFolderDialog, setNewFolderDialog] = useState({ open: false, parentId: null });
  const [newNoteDialog, setNewNoteDialog] = useState({ open: false, folderId: null });
  const [editFolderDialog, setEditFolderDialog] = useState({ open: false, folder: null });
  const [folderName, setFolderName] = useState('');
  const [noteName, setNoteName] = useState('');

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      onCreateFolder({
        name: folderName.trim(),
        parentId: newFolderDialog.parentId,
      });
      setFolderName('');
      setNewFolderDialog({ open: false, parentId: null });
    }
  };

  const handleCreateNote = () => {
    if (noteName.trim()) {
      const newNote = onCreateNote({
        title: noteName.trim(),
        content: `# ${noteName.trim()}\n\n`,
        folderId: newNoteDialog.folderId,
      });
      setNoteName('');
      setNewNoteDialog({ open: false, folderId: null });
      onNoteSelect(newNote);
    }
  };

  const handleEditFolder = () => {
    if (folderName.trim() && editFolderDialog.folder) {
      onUpdateFolder(editFolderDialog.folder.id, { name: folderName.trim() });
      setFolderName('');
      setEditFolderDialog({ open: false, folder: null });
    }
  };

  const renderFolder = (folder, level = 0) => {
    const childFolders = folders.filter(f => f.parentId === folder.id);
    const folderNotes = notes.filter(n => n.folderId === folder.id);
    const isExpanded = expandedFolders[folder.id];

    return (
      <div key={folder.id} className="select-none">
        <div
          className="flex items-center gap-1 py-1.5 px-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md cursor-pointer group transition-colors"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          <button
            onClick={() => toggleFolder(folder.id)}
            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            )}
          </button>
          
          <Folder className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          
          <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 font-medium">
            {folder.name}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setNewNoteDialog({ open: true, folderId: folder.id })}>
                <FilePlus className="w-4 h-4 mr-2" />
                New Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setNewFolderDialog({ open: true, parentId: folder.id })}>
                <FolderPlus className="w-4 h-4 mr-2" />
                New Subfolder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setFolderName(folder.name);
                setEditFolderDialog({ open: true, folder });
              }}>
                <Edit2 className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeleteFolder(folder.id)} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {childFolders.map(childFolder => renderFolder(childFolder, level + 1))}
              {folderNotes.map(note => (
                <div
                  key={note.id}
                  className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
                  style={{ paddingLeft: `${(level + 1) * 16 + 32}px` }}
                  onClick={() => onNoteSelect(note)}
                >
                  <File className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
                    {note.title}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const rootFolders = folders.filter(f => !f.parentId);
  const rootNotes = notes.filter(n => !n.folderId);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-serif font-semibold text-slate-800 dark:text-cream-50">
          Folders
        </h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={() => setNewFolderDialog({ open: true, parentId: null })}
          >
            <FolderPlus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={() => setNewNoteDialog({ open: true, folderId: null })}
          >
            <FilePlus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-0.5">
        {rootFolders.map(folder => renderFolder(folder))}
        {rootNotes.map(note => (
          <div
            key={note.id}
            className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md cursor-pointer transition-colors"
            onClick={() => onNoteSelect(note)}
          >
            <File className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
              {note.title}
            </span>
          </div>
        ))}
      </div>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialog.open} onOpenChange={(open) => setNewFolderDialog({ ...newFolderDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderDialog({ open: false, parentId: null })}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Note Dialog */}
      <Dialog open={newNoteDialog.open} onOpenChange={(open) => setNewNoteDialog({ ...newNoteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note-name">Note Title</Label>
              <Input
                id="note-name"
                value={noteName}
                onChange={(e) => setNoteName(e.target.value)}
                placeholder="Enter note title"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNote()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewNoteDialog({ open: false, folderId: null })}>
              Cancel
            </Button>
            <Button onClick={handleCreateNote}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={editFolderDialog.open} onOpenChange={(open) => setEditFolderDialog({ ...editFolderDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-folder-name">Folder Name</Label>
              <Input
                id="edit-folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                onKeyDown={(e) => e.key === 'Enter' && handleEditFolder()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFolderDialog({ open: false, folder: null })}>
              Cancel
            </Button>
            <Button onClick={handleEditFolder}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FolderTree;
