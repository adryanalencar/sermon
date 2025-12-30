
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Link as LinkIcon } from 'lucide-react';

const KnowledgeGraph = ({ notes, onNoteSelect }) => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    // Parse WikiLinks and create graph data
    const graphNodes = notes.map((note, index) => ({
      id: note.id,
      title: note.title,
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      vx: 0,
      vy: 0,
    }));

    const graphLinks = [];
    const noteMap = new Map(notes.map(n => [n.title.toLowerCase(), n.id]));

    notes.forEach(note => {
      // Extract WikiLinks [[Note Title]]
      const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
      let match;
      
      while ((match = wikiLinkRegex.exec(note.content)) !== null) {
        const linkedTitle = match[1].toLowerCase();
        const targetId = noteMap.get(linkedTitle);
        
        if (targetId && targetId !== note.id) {
          graphLinks.push({
            source: note.id,
            target: targetId,
          });
        }
      }
    });

    setNodes(graphNodes);
    setLinks(graphLinks);
  }, [notes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Simple force simulation
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Apply forces
      nodes.forEach(node => {
        // Centering force
        const centerX = width / 2;
        const centerY = height / 2;
        node.vx += (centerX - node.x) * 0.001;
        node.vy += (centerY - node.y) * 0.001;

        // Link forces
        links.forEach(link => {
          if (link.source === node.id) {
            const target = nodes.find(n => n.id === link.target);
            if (target) {
              const dx = target.x - node.x;
              const dy = target.y - node.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const force = (distance - 150) * 0.01;
              node.vx += (dx / distance) * force;
              node.vy += (dy / distance) * force;
            }
          }
        });

        // Repulsion between nodes
        nodes.forEach(other => {
          if (other.id !== node.id) {
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) {
              const force = (100 - distance) * 0.02;
              node.vx += (dx / distance) * force;
              node.vy += (dy / distance) * force;
            }
          }
        });

        // Apply velocity with damping
        node.vx *= 0.9;
        node.vy *= 0.9;
        node.x += node.vx;
        node.y += node.vy;

        // Boundary constraints
        node.x = Math.max(50, Math.min(width - 50, node.x));
        node.y = Math.max(50, Math.min(height - 50, node.y));
      });

      // Draw links
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = 1.5;
      links.forEach(link => {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (source && target) {
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      });

      // Draw nodes
      nodes.forEach(node => {
        const isHovered = hoveredNode === node.id;
        
        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, isHovered ? 24 : 20, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? '#3b82f6' : '#60a5fa';
        ctx.fill();
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Node label
        ctx.fillStyle = '#1e293b';
        ctx.font = '12px serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          node.title.length > 15 ? node.title.substring(0, 12) + '...' : node.title,
          node.x,
          node.y + 35
        );
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [nodes, links, hoveredNode]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < 20;
    });

    if (clickedNode) {
      const note = notes.find(n => n.id === clickedNode.id);
      if (note) onNoteSelect(note);
    }
  };

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hoveredNode = nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < 20;
    });

    setHoveredNode(hoveredNode ? hoveredNode.id : null);
    canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
  };

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
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            className="block"
          />
          
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
