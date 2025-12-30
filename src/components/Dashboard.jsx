
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FolderTree from '@/components/FolderTree';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import QuickCapture from '@/components/QuickCapture';
import EditorView from '@/components/EditorView';
import PulpitMode from '@/components/PulpitMode';
import SermonMapView from '@/components/SermonMapView';
import { Button } from '@/components/ui/button';
import { BookOpen, Moon, Sun, Layout, Network, Presentation, GitBranch } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false); // Default to light mode for pastel theme
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, editor, pulpit, sermonMap
  const [selectedNote, setSelectedNote] = useState(null);
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    // Load data from localStorage
    const savedFolders = localStorage.getItem('pulpitgraph_folders');
    const savedNotes = localStorage.getItem('pulpitgraph_notes');
    
    if (savedFolders) {
      setFolders(JSON.parse(savedFolders));
    } else {
      // Initialize with default folder structure
      const defaultFolders = [
        { id: '1', name: 'Sermons', parentId: null, expanded: true },
        { id: '2', name: 'Bible Studies', parentId: null, expanded: true },
        { id: '3', name: 'Devotionals', parentId: null, expanded: false },
        { id: '4', name: 'Series: Genesis', parentId: '1', expanded: false },
      ];
      setFolders(defaultFolders);
      localStorage.setItem('pulpitgraph_folders', JSON.stringify(defaultFolders));
    }
    
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      // Initialize with sample notes
      const defaultNotes = [
        {
          id: '1',
          title: 'The Grace of God',
          content: '# The Grace of God\n\nIntroduction to the sermon on Grace.\n\n## Key Points\n1. Grace is unmerited favor\n2. Grace empowers us\n\n> "For by grace you have been saved through faith..." - Ephesians 2:8\n',
          folderId: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setNotes(defaultNotes);
      localStorage.setItem('pulpitgraph_notes', JSON.stringify(defaultNotes));
    }

    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleNoteSelect = (note) => {
    setSelectedNote(note);
    setCurrentView('editor');
  };

  const handleCreateNote = (noteData) => {
    const newNote = {
      id: Date.now().toString(),
      title: noteData.title || 'Untitled Note',
      content: noteData.content || '',
      folderId: noteData.folderId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    localStorage.setItem('pulpitgraph_notes', JSON.stringify(updatedNotes));
    
    toast({
      title: "Note created",
      description: `"${newNote.title}" has been created successfully.`,
    });
    
    return newNote;
  };

  const handleUpdateNote = (noteId, updates) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    );
    setNotes(updatedNotes);
    localStorage.setItem('pulpitgraph_notes', JSON.stringify(updatedNotes));
    
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, ...updates });
    }
  };

  const handleDeleteNote = (noteId) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    localStorage.setItem('pulpitgraph_notes', JSON.stringify(updatedNotes));
    
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setCurrentView('dashboard');
    }
    
    toast({
      title: "Note deleted",
      description: "The note has been removed.",
    });
  };

  const handleCreateFolder = (folderData) => {
    const newFolder = {
      id: Date.now().toString(),
      name: folderData.name || 'New Folder',
      parentId: folderData.parentId || null,
      expanded: false,
    };
    
    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    localStorage.setItem('pulpitgraph_folders', JSON.stringify(updatedFolders));
    
    toast({
      title: "Folder created",
      description: `"${newFolder.name}" has been created.`,
    });
  };

  const handleUpdateFolder = (folderId, updates) => {
    const updatedFolders = folders.map(folder => 
      folder.id === folderId ? { ...folder, ...updates } : folder
    );
    setFolders(updatedFolders);
    localStorage.setItem('pulpitgraph_folders', JSON.stringify(updatedFolders));
  };

  const handleDeleteFolder = (folderId) => {
    // Delete all notes in the folder
    const updatedNotes = notes.filter(note => note.folderId !== folderId);
    setNotes(updatedNotes);
    localStorage.setItem('pulpitgraph_notes', JSON.stringify(updatedNotes));
    
    // Delete the folder and its subfolders
    const folderIds = [folderId];
    const getAllChildFolderIds = (parentId) => {
      folders.forEach(folder => {
        if (folder.parentId === parentId) {
          folderIds.push(folder.id);
          getAllChildFolderIds(folder.id);
        }
      });
    };
    getAllChildFolderIds(folderId);
    
    const updatedFolders = folders.filter(folder => !folderIds.includes(folder.id));
    setFolders(updatedFolders);
    localStorage.setItem('pulpitgraph_folders', JSON.stringify(updatedFolders));
    
    toast({
      title: "Folder deleted",
      description: "The folder and its contents have been removed.",
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-slate-900' : 'bg-[#FDFBF7]'}`}>
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-white p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-serif font-bold text-slate-800 dark:text-cream-50 tracking-tight">PulpitGraph</h1>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
            <Button
              variant={currentView === 'dashboard' ? 'white' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('dashboard')}
              className={`gap-2 h-8 text-xs font-medium ${currentView === 'dashboard' ? 'bg-white shadow-sm' : ''}`}
            >
              <Network className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            
            <Button
              variant={currentView === 'editor' ? 'white' : 'ghost'}
              size="sm"
              onClick={() => {
                if (selectedNote) {
                  setCurrentView('editor');
                } else {
                  toast({
                    title: "Select a note",
                    description: "Please select or create a note to edit.",
                  });
                }
              }}
              className={`gap-2 h-8 text-xs font-medium ${currentView === 'editor' ? 'bg-white shadow-sm' : ''}`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Workspace</span>
            </Button>

            <Button
              variant={currentView === 'sermonMap' ? 'white' : 'ghost'}
              size="sm"
              onClick={() => {
                if (selectedNote) {
                  setCurrentView('sermonMap');
                } else {
                  toast({
                    title: "Select a note",
                    description: "Please select a note to map.",
                  });
                }
              }}
              className={`gap-2 h-8 text-xs font-medium ${currentView === 'sermonMap' ? 'bg-white shadow-sm' : ''}`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sermon Map</span>
            </Button>
            
            <Button
              variant={currentView === 'pulpit' ? 'white' : 'ghost'}
              size="sm"
              onClick={() => {
                if (selectedNote) {
                  setCurrentView('pulpit');
                } else {
                  toast({
                    title: "Select a note",
                    description: "Please select a note to preach.",
                  });
                }
              }}
              className={`gap-2 h-8 text-xs font-medium ${currentView === 'pulpit' ? 'bg-white shadow-sm' : ''}`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pulpit</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="ml-2 rounded-full w-8 h-8"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {currentView === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex h-[calc(100vh-65px)]"
          >
            {/* Left Sidebar - Folder Tree */}
            <div className="w-72 border-r border-slate-200 dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-800 overflow-y-auto">
              <FolderTree
                folders={folders}
                notes={notes}
                onNoteSelect={handleNoteSelect}
                onCreateFolder={handleCreateFolder}
                onUpdateFolder={handleUpdateFolder}
                onDeleteFolder={handleDeleteFolder}
                onCreateNote={handleCreateNote}
              />
            </div>

            {/* Center - Knowledge Graph */}
            <div className="flex-1 bg-[#FDFBF7] dark:bg-slate-900 relative">
              <KnowledgeGraph notes={notes} onNoteSelect={handleNoteSelect} />
            </div>

            {/* Right Sidebar - Quick Capture */}
            <div className="w-80 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-y-auto shadow-[-5px_0_15px_-5px_rgba(0,0,0,0.05)]">
              <QuickCapture
                folders={folders}
                onCreateNote={handleCreateNote}
              />
            </div>
          </motion.div>
        )}

        {currentView === 'editor' && selectedNote && (
          <motion.div
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-[calc(100vh-65px)]"
          >
            <EditorView
              note={selectedNote}
              notes={notes}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onNoteSelect={handleNoteSelect}
            />
          </motion.div>
        )}

        {currentView === 'sermonMap' && selectedNote && (
          <motion.div
            key="sermonMap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-[calc(100vh-65px)]"
          >
            <SermonMapView note={selectedNote} />
          </motion.div>
        )}

        {currentView === 'pulpit' && selectedNote && (
          <motion.div
            key="pulpit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-[calc(100vh-65px)]"
          >
            <PulpitMode note={selectedNote} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
