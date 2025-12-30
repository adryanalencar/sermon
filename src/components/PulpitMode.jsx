
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize, Type, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const PulpitMode = ({ note }) => {
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [fontSize, setFontSize] = useState(24);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Split content into sections based on headers
    const lines = note.content.split('\n');
    const newSections = [];
    let currentSectionContent = [];

    lines.forEach(line => {
      if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### ')) {
        if (currentSectionContent.length > 0) {
          newSections.push(currentSectionContent.join('\n'));
          currentSectionContent = [];
        }
      }
      currentSectionContent.push(line);
    });

    if (currentSectionContent.length > 0) {
      newSections.push(currentSectionContent.join('\n'));
    }

    setSections(newSections.length > 0 ? newSections : [note.content]);
  }, [note]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const renderSection = (content) => {
    let html = content;

    // Headers with high contrast
    html = html.replace(/^### (.*$)/gim, `<h3 class="text-${fontSize + 8}px font-serif font-bold mb-6"style="font-size: ${fontSize + 8}px;">$1</h3>`);
    html = html.replace(/^## (.*$)/gim, `<h2 class="text-${fontSize + 16}px font-serif font-bold mb-8" style="font-size: ${fontSize + 16}px;">$1</h2>`);
    html = html.replace(/^# (.*$)/gim, `<h1 class="text-${fontSize + 24}px font-serif font-bold mb-10" style="font-size: ${fontSize + 24}px;">$1</h1>`);

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');

    // Line breaks
    html = html.replace(/\n\n/g, `</p><p class="mb-6" style="font-size: ${fontSize}px; line-height: 1.8;">`);
    html = html.replace(/\n/g, '<br />');

    html = `<p class="mb-6" style="font-size: ${fontSize}px; line-height: 1.8;">` + html + '</p>';

    return html;
  };

  return (
    <div className="h-full bg-black text-white flex flex-col">
      {/* Controls */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSection}
            disabled={currentSection === 0}
            className="text-white hover:bg-gray-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <span className="text-sm font-mono">
            {currentSection + 1} / {sections.length}
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSection}
            disabled={currentSection === sections.length - 1}
            className="text-white hover:bg-gray-800"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Type className="w-4 h-4" />
            <Slider
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
              min={16}
              max={48}
              step={2}
              className="w-32"
            />
            <span className="text-sm font-mono w-12">{fontSize}px</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white hover:bg-gray-800"
          >
            <Maximize className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-12 flex items-center justify-center">
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl w-full"
        >
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: renderSection(sections[currentSection] || '') }}
          />
        </motion.div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 text-center">
        <p className="text-sm text-gray-400 font-serif">
          {note.title}
        </p>
      </div>
    </div>
  );
};

export default PulpitMode;
