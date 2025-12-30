
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Link as LinkIcon } from 'lucide-react';

const getNotePath = (note) => note.path || note.id || note.title || '';

const getNodeColor = (note) => {
  const path = getNotePath(note).toLowerCase();
  if (path.includes('antigo')) return '#8a9a5b';
  if (path.includes('novo')) return '#5d7c9c';
  if (path.includes('tema')) return '#d4a373';
  return '#7f8c8d';
};

const buildInvertedIndex = (notes) => {
  const index = new Map();
  notes.forEach((note) => {
    const relativePath = getNotePath(note);
    const normalizedPath = relativePath.replace(/\\/g, '/');
    const parts = normalizedPath.split('/');
    const filename = parts.pop();
    const dir = parts.length ? parts.join('/') : '.';

    if (!filename) return;

    if (!index.has(filename)) {
      index.set(filename, []);
    }
    index.get(filename).push(dir);
  });
  return index;
};

const labelToPath = (invertedIndex, label) => {
  const [rawLabel] = label.split('|', 1);
  const extensionMatch = rawLabel.match(/\.[^/.]+$/);
  const hasExtension = Boolean(extensionMatch);
  const file = hasExtension ? rawLabel : `${rawLabel}.md`;

  const normalizedFile = file.replace(/\\/g, '/');
  const parts = normalizedFile.split('/');
  const filename = parts.pop();
  const dir = parts.join('/');

  if (!filename || !invertedIndex.has(filename)) {
    return null;
  }

  if (!dir) {
    const paths = invertedIndex.get(filename);
    if (!paths || paths.length !== 1) {
      return null;
    }
    const path = paths[0] === '.' ? '' : paths[0];
    return path ? `${path}/${filename}` : filename;
  }

  return filename;
};

const extractWikiLinks = (content) => {
  const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
  const links = [];
  let match;
  while ((match = wikiLinkRegex.exec(content)) !== null) {
    links.push(match[1]);
  }
  return links;
};

const KnowledgeGraph = ({ notes, onNoteSelect }) => {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const graphRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const graphNodes = notes.map((note) => ({
      id: note.id,
      title: note.title,
      color: getNodeColor(note),
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      vx: 0,
      vy: 0,
    }));

    const invertedIndex = buildInvertedIndex(notes);
    const notePathMap = new Map(
      notes.map((note) => [getNotePath(note).replace(/\\/g, '/'), note.id])
    );

    const graphLinks = [];

    notes.forEach((note) => {
      const links = extractWikiLinks(note.content || '');
      links.forEach((label) => {
        const resolvedPath = labelToPath(invertedIndex, label);
        if (!resolvedPath) return;

        const normalizedPath = resolvedPath.replace(/\\/g, '/');
        let targetId = notePathMap.get(normalizedPath);

        if (!targetId) {
          const fallbackNote = notes.find((candidate) =>
            getNotePath(candidate).endsWith(`/${normalizedPath}`)
          );
          targetId = fallbackNote?.id;
        }

        if (targetId && targetId !== note.id) {
          graphLinks.push({
            source: note.id,
            target: targetId,
          });
        }
      });
    });

    setNodes(graphNodes);
    setLinks(graphLinks);
  }, [notes]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ForceGraph = window.ForceGraph;
    if (!ForceGraph) return;

    if (!graphRef.current) {
      graphRef.current = ForceGraph()(container)
        .backgroundColor('#ffffff')
        .nodeRelSize(5)
        .nodeLabel('title')
        .nodeColor((node) => node.color || '#5d7c9c')
        .linkColor(() => '#a0a0a0')
        .linkWidth(1.5)
        .linkDirectionalParticles(2)
        .linkDirectionalParticleWidth(2)
        .onNodeClick((node) => {
          const note = notes.find((item) => item.id === node.id);
          if (note) onNoteSelect(note);
          graphRef.current.centerAt(node.x, node.y, 1000);
          graphRef.current.zoom(3, 1000);
        });

      graphRef.current.d3Force('charge').strength(-150);
    }

    const handleResize = () => {
      if (!graphRef.current) return;
      graphRef.current.width(container.offsetWidth);
      graphRef.current.height(container.offsetHeight);
      graphRef.current.zoomToFit(500);
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [nodes, links, notes, onNoteSelect]);

  useEffect(() => {
    if (!graphRef.current) return;
    graphRef.current.graphData({
      nodes: nodes.map((node) => ({ ...node })),
      links: links.map((link) => ({ ...link })),
    });
  }, [nodes, links]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-serif font-bold text-slate-800 dark:text-cream-50 mb-1">
          Knowledge Graph
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Visualizing connections between {notes.length} notes
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden"
        >
          <div ref={containerRef} className="w-[800px] h-[600px]" />
          
          {notes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-800">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                <p className="text-slate-500 dark:text-slate-400">
                  Create notes to see connections
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-400"></div>
            <span>Notes</span>
          </div>
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-blue-400" />
            <span>WikiLinks</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;
