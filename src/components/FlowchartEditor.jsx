
import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Move, Type, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// Custom Flowchart Implementation since external libs are restricted
const FlowchartEditor = ({ noteId, onSave }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Load saved graph if available
  useEffect(() => {
    const savedGraph = localStorage.getItem(`pulpit_flowchart_${noteId}`);
    if (savedGraph) {
      const data = JSON.parse(savedGraph);
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
    } else {
      // Init with start node
      setNodes([{ id: 'start', x: 300, y: 200, text: 'Start Sermon', type: 'start' }]);
    }
  }, [noteId]);

  const saveGraph = () => {
    localStorage.setItem(`pulpit_flowchart_${noteId}`, JSON.stringify({ nodes, edges }));
    toast({ title: "Flowchart Saved", description: "Your sermon structure is safe." });
  };

  const addNode = (type = 'default', label = 'New Point') => {
    const id = `node_${Date.now()}`;
    setNodes([...nodes, { 
      id, 
      x: 350 - pan.x, 
      y: 250 - pan.y, 
      text: label, 
      type 
    }]);
  };

  const handleMouseDown = (e, nodeId) => {
    if (e.button === 0) { // Left click drag
      e.stopPropagation();
      setDragging({ id: nodeId, startX: e.clientX, startY: e.clientY });
    } else if (e.button === 2) { // Right click connect
      e.preventDefault();
      e.stopPropagation();
      setConnecting(nodeId);
    }
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const dx = e.clientX - dragging.startX;
      const dy = e.clientY - dragging.startY;
      
      setNodes(nodes.map(n => 
        n.id === dragging.id 
          ? { ...n, x: n.x + dx, y: n.y + dy }
          : n
      ));
      
      setDragging({ ...dragging, startX: e.clientX, startY: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setConnecting(null); // Cancel connection if dropped on empty space
  };

  const handleNodeMouseUp = (e, targetId) => {
    e.stopPropagation();
    if (connecting && connecting !== targetId) {
      // Create edge
      if (!edges.find(edge => edge.source === connecting && edge.target === targetId)) {
        setEdges([...edges, { id: `e_${Date.now()}`, source: connecting, target: targetId }]);
      }
    }
    setConnecting(null);
    setDragging(null);
  };

  const deleteNode = (id) => {
    setNodes(nodes.filter(n => n.id !== id));
    setEdges(edges.filter(e => e.source !== id && e.target !== id));
  };

  const updateNodeText = (id, text) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, text } : n));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const verseData = e.dataTransfer.getData('application/json');
    if (verseData) {
      const verse = JSON.parse(verseData);
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - pan.x;
      const y = e.clientY - rect.top - pan.y;
      
      const id = `node_${Date.now()}`;
      setNodes([...nodes, { 
        id, 
        x, 
        y, 
        text: `${verse.ref}\n${verse.text.substring(0, 30)}...`, 
        type: 'verse' 
      }]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#f8f9fa] dark:bg-slate-900 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button size="sm" onClick={() => addNode('default', 'Main Point')} className="shadow-sm bg-white text-slate-800 hover:bg-slate-50 border border-slate-200">
          <Plus className="w-4 h-4 mr-2" /> Point
        </Button>
        <Button size="sm" onClick={() => addNode('illustration', 'Illustration')} className="shadow-sm bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200">
          <Type className="w-4 h-4 mr-2" /> Illustration
        </Button>
        <Button size="sm" onClick={saveGraph} className="shadow-sm bg-green-50 text-green-800 hover:bg-green-100 border border-green-200">
          <Save className="w-4 h-4 mr-2" /> Save Chart
        </Button>
      </div>

      <div className="absolute bottom-4 left-4 z-10 text-xs text-slate-400 bg-white/80 p-2 rounded backdrop-blur-sm pointer-events-none">
        Right-click node & drag to connect • Drag from Bible panel to add verse
      </div>

      <div 
        ref={containerRef}
        className="flex-1 w-full h-full cursor-crosshair relative"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onContextMenu={(e) => e.preventDefault()}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
            </marker>
          </defs>
          {edges.map(edge => {
            const source = nodes.find(n => n.id === edge.source);
            const target = nodes.find(n => n.id === edge.target);
            if (!source || !target) return null;
            return (
              <line 
                key={edge.id}
                x1={source.x + 100} y1={source.y + 40}
                x2={target.x + 100} y2={target.y + 40}
                stroke="#94a3b8"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          {connecting && dragging && (
            <line
              x1={nodes.find(n => n.id === connecting).x + 100}
              y1={nodes.find(n => n.id === connecting).y + 40}
              x2={dragging.startX - containerRef.current.getBoundingClientRect().left}
              y2={dragging.startY - containerRef.current.getBoundingClientRect().top}
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
        </svg>

        {nodes.map(node => (
          <div
            key={node.id}
            className={`absolute w-[200px] min-h-[80px] p-3 rounded-lg shadow-sm border-2 transition-shadow hover:shadow-md cursor-move
              ${node.type === 'start' ? 'bg-slate-800 text-white border-slate-700' : 
                node.type === 'illustration' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800' :
                node.type === 'verse' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800' :
                'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'
              }
            `}
            style={{ left: node.x, top: node.y }}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
            onMouseUp={(e) => handleNodeMouseUp(e, node.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] uppercase tracking-wider opacity-50 font-bold">{node.type}</span>
              {node.type !== 'start' && (
                <button onClick={() => deleteNode(node.id)} className="text-slate-400 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <textarea
              value={node.text}
              onChange={(e) => updateNodeText(node.id, e.target.value)}
              className={`w-full bg-transparent resize-none outline-none text-sm font-hand leading-tight
                ${node.type === 'start' ? 'text-white' : 'text-slate-700 dark:text-slate-200'}
              `}
              rows={3}
              onMouseDown={(e) => e.stopPropagation()} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlowchartEditor;
