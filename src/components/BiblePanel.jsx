
import React, { useState } from 'react';
import { Search, GripVertical, Book, Pin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { bibleDatabase } from '@/data/bibleData';

const BiblePanel = () => {
  const [search, setSearch] = useState('');
  const [pinned, setPinned] = useState([]);

  // Flatten database for search
  const allVerses = Object.entries(bibleDatabase).flatMap(([theme, verses]) => 
    verses.map(v => ({ ...v, theme }))
  );

  const filteredVerses = search
    ? allVerses.filter(v => 
        v.text.toLowerCase().includes(search.toLowerCase()) || 
        v.ref.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleDragStart = (e, verse) => {
    e.dataTransfer.setData('application/json', JSON.stringify(verse));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const togglePin = (verse) => {
    if (pinned.find(p => p.id === verse.id)) {
      setPinned(pinned.filter(p => p.id !== verse.id));
    } else {
      setPinned([...pinned, verse]);
    }
  };

  const renderVerseCard = (verse, isPinned = false) => (
    <div 
      key={verse.id}
      draggable
      onDragStart={(e) => handleDragStart(e, verse)}
      className="p-3 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 mb-2 cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors group relative"
    >
      <div className="flex justify-between items-start mb-1">
        <span className="font-serif font-bold text-slate-800 dark:text-slate-200 text-sm">{verse.ref}</span>
        <div className="flex gap-1">
          <button onClick={() => togglePin(verse)} className="text-slate-300 hover:text-blue-500">
            <Pin className={`w-3 h-3 ${isPinned ? 'fill-blue-500 text-blue-500' : ''}`} />
          </button>
          <GripVertical className="w-3 h-3 text-slate-300" />
        </div>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
        "{verse.text}"
      </p>
      {!isPinned && <span className="text-[10px] text-slate-400 mt-2 block uppercase tracking-wider">{verse.theme}</span>}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <h3 className="font-serif font-bold text-slate-800 dark:text-cream-50 flex items-center gap-2 mb-3">
          <Book className="w-4 h-4 text-blue-500" /> Biblical Database
        </h3>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search scripture..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-slate-50 dark:bg-slate-900"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {pinned.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Pin className="w-3 h-3" /> Pinned
            </h4>
            {pinned.map(v => renderVerseCard(v, true))}
          </div>
        )}

        {search ? (
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Search Results</h4>
            {filteredVerses.map(v => renderVerseCard(v))}
            {filteredVerses.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No verses found.</p>}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(bibleDatabase).map(([theme, verses]) => (
              <div key={theme}>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 sticky top-0 bg-slate-50 dark:bg-slate-900 py-1 z-10">
                  {theme}
                </h4>
                {verses.map(v => renderVerseCard({ ...v, theme }))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BiblePanel;
