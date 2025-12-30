
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
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
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const editableNodeTypes = useMemo(() => new Set(['process', 'verse']), []);
  const pastelPalette = useMemo(
    () => ({
      text: [
        { label: 'Slate', value: '#334155' },
        { label: 'Rose', value: '#be4b5a' },
        { label: 'Sage', value: '#3f6c62' },
        { label: 'Indigo', value: '#4c5bd6' },
        { label: 'Amber', value: '#9a6b1b' },
      ],
      card: [
        { label: 'Ivory', value: '#fffdf5' },
        { label: 'Blush', value: '#fde7ec' },
        { label: 'Mint', value: '#e6f5f0' },
        { label: 'Sky', value: '#e7f1ff' },
        { label: 'Lavender', value: '#f1e9ff' },
      ],
    }),
    []
  );

  const getDefaultCardStyle = useCallback((type) => {
    if (type === 'verse') {
      return {
        fontFamily: 'serif',
        fontWeight: 500,
        textColor: '#92400e',
        cardColor: '#fffdf5',
        width: 288,
        height: 120,
      };
    }
    return {
      fontFamily: 'serif',
      fontWeight: 500,
      textColor: '#334155',
      cardColor: '#ffffff',
      width: 180,
      height: 80,
    };
  }, []);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  const selectedCardStyle = useMemo(() => {
    if (!selectedNode) return getDefaultCardStyle('process');
    return {
      ...getDefaultCardStyle(selectedNode.type),
      ...(selectedNode.data?.style || {}),
    };
  }, [selectedNode, getDefaultCardStyle]);

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
      const dropType =
        event.dataTransfer.getData('application/reactflow/type') ||
        event.dataTransfer.getData('application/reactflow');

      // Check if the drop target is valid
      if (!dropType && !verseDataString) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `node_${Date.now()}`,
        position,
      };

      if (verseDataString) {
        // Handle Bible Verse Drop (as Process Card)
        try {
          const verse = JSON.parse(verseDataString);
          newNode.type = 'process';
          newNode.data = {
            label: `${verse.ref}\n${verse.text}`,
            style: getDefaultCardStyle('process'),
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
        newNode.type = dropType;
        newNode.data = { 
          label: dropType === 'start' ? 'Start' : dropType === 'decision' ? 'Question?' : 'New Point',
          ...(dropType === 'process' ? { style: getDefaultCardStyle('process') } : {}),
        };
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, getDefaultCardStyle]
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

  const updateSelectedNodeStyle = (updates) => {
    if (!selectedNodeId) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id !== selectedNodeId) return node;
        const baseStyle = getDefaultCardStyle(node.type);
        return {
          ...node,
          data: {
            ...node.data,
            style: {
              ...baseStyle,
              ...(node.data?.style || {}),
              ...updates,
            },
          },
        };
      })
    );
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

        <div className="p-4 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Card Editor</h3>
          {!selectedNode && (
            <p className="text-xs text-slate-400">
              Select a card in the flow to customize its style.
            </p>
          )}
          {selectedNode && !editableNodeTypes.has(selectedNode.type) && (
            <p className="text-xs text-slate-400">
              Card styling is available for process and verse cards.
            </p>
          )}
          {selectedNode && editableNodeTypes.has(selectedNode.type) && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-600">Font Style</Label>
                <Select
                  value={selectedCardStyle.fontFamily}
                  onValueChange={(value) => updateSelectedNodeStyle({ fontFamily: value })}
                >
                  <SelectTrigger className="h-8 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="sans-serif">Sans Serif</SelectItem>
                    <SelectItem value="monospace">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-600">Font Weight</Label>
                <Select
                  value={`${selectedCardStyle.fontWeight}`}
                  onValueChange={(value) => updateSelectedNodeStyle({ fontWeight: Number(value) })}
                >
                  <SelectTrigger className="h-8 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="400">Regular</SelectItem>
                    <SelectItem value="500">Medium</SelectItem>
                    <SelectItem value="600">Semibold</SelectItem>
                    <SelectItem value="700">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-600">Text Color</Label>
                  <Select
                    value={selectedCardStyle.textColor}
                    onValueChange={(value) => updateSelectedNodeStyle({ textColor: value })}
                  >
                    <SelectTrigger className="h-8 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pastelPalette.text.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full border border-slate-200"
                              style={{ backgroundColor: option.value }}
                            />
                            {option.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-600">Card Color</Label>
                  <Select
                    value={selectedCardStyle.cardColor}
                    onValueChange={(value) => updateSelectedNodeStyle({ cardColor: value })}
                  >
                    <SelectTrigger className="h-8 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pastelPalette.card.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full border border-slate-200"
                              style={{ backgroundColor: option.value }}
                            />
                            {option.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-slate-600">Card Width</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedCardStyle.width]}
                      onValueChange={(value) => updateSelectedNodeStyle({ width: value[0] })}
                      min={140}
                      max={360}
                      step={10}
                      className="flex-1"
                    />
                    <span className="text-[10px] text-slate-500 w-8 text-right">
                      {selectedCardStyle.width}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Card Height</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[selectedCardStyle.height]}
                      onValueChange={(value) => updateSelectedNodeStyle({ height: value[0] })}
                      min={60}
                      max={220}
                      step={10}
                      className="flex-1"
                    />
                    <span className="text-[10px] text-slate-500 w-8 text-right">
                      {selectedCardStyle.height}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
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
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => setSelectedNodeId(null)}
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
