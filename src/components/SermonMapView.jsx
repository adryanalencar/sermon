
import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Save, Plus, Circle, Square, Diamond, MousePointer2 } from 'lucide-react';
import BiblePanel from '@/components/BiblePanel';
import { StartNode, ProcessNode, DecisionNode, VerseNode } from './SermonMapNodes';

const nodeTypes = {
  start: StartNode,
  process: ProcessNode,
  decision: DecisionNode,
  verse: VerseNode,
};

const SermonMapContent = ({ note, onSave }) => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Load initial data
  useEffect(() => {
    const savedFlow = localStorage.getItem(`pulpit_reactflow_${note.id}`);
    if (savedFlow) {
      const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedFlow);
      setNodes(savedNodes || []);
      setEdges(savedEdges || []);
    } else {
      // Default start node if new
      setNodes([
        {
          id: 'start-1',
          type: 'start',
          position: { x: 250, y: 50 },
          data: { label: 'Start Sermon' },
        },
      ]);
    }
  }, [note.id, setNodes, setEdges]);

  // Auto-save when nodes/edges change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (nodes.length > 0) {
        handleSave(true); // Silent save
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [nodes, edges]);


  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragOver(false);

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const verseDataString = event.dataTransfer.getData('application/json');
      const type = event.dataTransfer.getData('application/reactflow/type');

      // Check if the drop target is valid
      if (!type && !verseDataString) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `node_${Date.now()}`,
        position,
      };

      if (verseDataString) {
        // Handle Bible Verse Drop
        try {
          const verse = JSON.parse(verseDataString);
          newNode.type = 'verse';
          newNode.data = { 
            label: verse.ref, 
            ref: verse.ref, 
            text: verse.text 
          };
          toast({
            title: "Verse Added",
            description: `Added ${verse.ref} to the map.`,
          });
        } catch (e) {
          console.error('Invalid verse data', e);
          return;
        }
      } else {
        // Handle Shape Drop
        newNode.type = type;
        newNode.data = { 
          label: type === 'start' ? 'Start' : type === 'decision' ? 'Question?' : 'New Point' 
        };
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const handleSave = (silent = false) => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      localStorage.setItem(`pulpit_reactflow_${note.id}`, JSON.stringify(flow));
      if (!silent) {
        toast({
          title: "Map Saved",
          description: "Your sermon structure has been saved.",
        });
      }
      if (onSave) onSave();
    }
  };

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#FDFBF7]">
      {/* Sidebar Tools */}
      <div className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden h-[30vh] md:h-full z-10 shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Flow Shapes</h3>
          <div className="grid grid-cols-2 gap-3">
             <div 
               className="h-16 border-2 border-slate-200 rounded-md flex flex-col items-center justify-center cursor-grab hover:border-green-300 hover:bg-green-50 transition-colors bg-white"
               onDragStart={(event) => onDragStart(event, 'start')}
               draggable
             >
               <Circle className="w-5 h-5 text-green-500 mb-1" />
               <span className="text-[10px] text-slate-500 font-medium">Start/End</span>
             </div>
             <div 
               className="h-16 border-2 border-slate-200 rounded-md flex flex-col items-center justify-center cursor-grab hover:border-slate-400 hover:bg-slate-50 transition-colors bg-white"
               onDragStart={(event) => onDragStart(event, 'process')}
               draggable
             >
               <Square className="w-5 h-5 text-slate-500 mb-1" />
               <span className="text-[10px] text-slate-500 font-medium">Process</span>
             </div>
             <div 
               className="h-16 border-2 border-slate-200 rounded-md flex flex-col items-center justify-center cursor-grab hover:border-blue-300 hover:bg-blue-50 transition-colors bg-white"
               onDragStart={(event) => onDragStart(event, 'decision')}
               draggable
             >
               <Diamond className="w-5 h-5 text-blue-500 mb-1" />
               <span className="text-[10px] text-slate-500 font-medium">Decision</span>
             </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 flex items-center gap-1 justify-center">
            <MousePointer2 className="w-3 h-3" /> Drag shapes to canvas
          </p>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col border-t border-slate-100 bg-slate-50/50">
          <BiblePanel />
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 h-[70vh] md:h-full relative transition-colors duration-200" ref={reactFlowWrapper}>
        <div className={`absolute inset-0 pointer-events-none z-10 bg-blue-50/30 transition-opacity duration-200 ${isDragOver ? 'opacity-100' : 'opacity-0'}`} />
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          nodeTypes={nodeTypes}
          fitView
          className="bg-[#FDFBF7]"
        >
          <Background color="#94a3b8" gap={24} size={1} className="opacity-20" />
          <Controls className="bg-white border border-slate-200 shadow-sm !m-4" />
          <Panel position="top-right" className="!m-4">
            <Button onClick={() => handleSave(false)} className="shadow-sm gap-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200">
              <Save className="w-4 h-4" /> Save Map
            </Button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

const SermonMapView = (props) => (
  <ReactFlowProvider>
    <SermonMapContent {...props} />
  </ReactFlowProvider>
);

export default SermonMapView;
