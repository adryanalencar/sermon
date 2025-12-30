import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
  useReactFlow, // Adicionei este hook para facilitar o drop
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
import { Save, Circle, Square, Diamond, MousePointer2 } from 'lucide-react';
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
  
  // Hook moderno para posicionamento (substitui o cálculo manual de project)
  const { screenToFlowPosition } = useReactFlow();

  // 1. LISTA DE TIPOS EDITÁVEIS (Agora todos são permitidos)
  const editableNodeTypes = useMemo(() => new Set(['process', 'verse', 'start', 'decision']), []);

  const pastelPalette = useMemo(
    () => ({
      text: [
        { label: 'Black', value: '#000000' },
        { label: 'Ink Slate', value: '#334155' },
        { label: 'Deep Coral', value: '#9f1239' },
        { label: 'Deep Teal', value: '#115e59' },
        { label: 'Deep Indigo', value: '#3730a3' },
        { label: 'Cocoa', value: '#854d0e' },
      ],
      card: [
        { label: 'White', value: '#ffffff' },
        { label: 'Highlighter Yellow', value: '#ffff00' },
        { label: 'Fluorescent Pink', value: '#ff00ff' },
        { label: 'Lime Punch', value: '#ccff00' },
        { label: 'Cyan Pop', value: '#00ffff' },
        { label: 'Electric Violet', value: '#d580ff' },
        { label: 'Black', value: '#1a1a1a' }, // Adicionei um card escuro para contraste
      ],
    }),
    []
  );

  // 2. ESTILOS PADRÃO (Com fontSize adicionado)
  const getDefaultCardStyle = useCallback((type) => {
    const baseStyle = {
      fontFamily: 'serif',
      fontWeight: 500,
      fontSize: 14, // <--- Novo padrão
      textColor: '#334155',
      cardColor: '#ffffff',
      width: 180,
      height: 80,
    };

    if (type === 'verse') {
      return {
        ...baseStyle,
        textColor: '#92400e',
        cardColor: '#fffdf5',
        width: 288,
        height: 120,
      };
    }
    
    // Estilos específicos para Start e Decision se quiser diferenciar
    if (type === 'start') {
       return { ...baseStyle, cardColor: '#f0fdf4', width: 120, height: 60 }; // Verde claro
    }
    if (type === 'decision') {
       return { ...baseStyle, cardColor: '#eff6ff', width: 140, height: 140 }; // Azul claro
    }

    return baseStyle;
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
      setNodes([
        {
          id: 'start-1',
          type: 'start',
          position: { x: 250, y: 50 },
          data: { label: 'Start Sermon', style: getDefaultCardStyle('start') },
        },
      ]);
    }
  }, [note.id, setNodes, setEdges, getDefaultCardStyle]);

  // Auto-save
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (nodes.length > 0) handleSave(true);
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

      const verseDataString = event.dataTransfer.getData('application/json');
      const dropType =
        event.dataTransfer.getData('application/reactflow/type') ||
        event.dataTransfer.getData('application/reactflow');

      if (!dropType && !verseDataString) return;

      // Uso do hook moderno para posição precisa
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `node_${Date.now()}`,
        position,
      };

      if (verseDataString) {
        try {
          const verse = JSON.parse(verseDataString);
          newNode.type = 'process'; // ou 'verse' se preferir usar o tipo dedicado
          newNode.data = {
            label: `${verse.ref}\n${verse.text}`,
            style: getDefaultCardStyle('verse'),
          };
          toast({ title: "Verse Added", description: verse.ref });
        } catch (e) {
          console.error(e);
          return;
        }
      } else {
        newNode.type = dropType;
        newNode.data = { 
          label: dropType === 'start' ? 'Start' : dropType === 'decision' ? 'Question?' : 'New Point',
          style: getDefaultCardStyle(dropType),
        };
      }

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes, getDefaultCardStyle]
  );

  const handleSave = (silent = false) => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      localStorage.setItem(`pulpit_reactflow_${note.id}`, JSON.stringify(flow));
      if (!silent) toast({ title: "Map Saved" });
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
        // Garante fusão profunda dos estilos
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

  const removeSelectedNode = () => {
    if (!selectedNodeId) return;
    setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
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
        
        {/* EDITING PANEL */}
        <div className="absolute right-4 top-20 w-64 max-h-[calc(100%-2rem)] overflow-y-auto rounded-lg border border-slate-200 bg-white/95 shadow-lg backdrop-blur-sm z-20">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Card Editor</h3>
              <Button
                variant="destructive"
                size="sm"
                onClick={removeSelectedNode}
                disabled={!selectedNode}
                className="h-7 px-2 text-[10px]"
              >
                Remove
              </Button>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            {!selectedNode ? (
              <p className="text-xs text-slate-400">
                Select a card in the flow to customize its style.
              </p>
            ) : (
              // Como todos os tipos estão em editableNodeTypes, isso renderiza sempre que houver seleção
              <div className="space-y-4">
                
                {/* Font Family */}
                <div className="space-y-2">
                  <Label className="text-xs text-slate-600">Font Style</Label>
                  <Select
                    value={selectedCardStyle.fontFamily}
                    onValueChange={(value) => updateSelectedNodeStyle({ fontFamily: value })}
                  >
                    <SelectTrigger className="h-8 bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serif">Serif</SelectItem>
                      <SelectItem value="sans-serif">Sans Serif</SelectItem>
                      <SelectItem value="monospace">Monospace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Font Weight */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Weight</Label>
                    <Select
                      value={`${selectedCardStyle.fontWeight}`}
                      onValueChange={(value) => updateSelectedNodeStyle({ fontWeight: Number(value) })}
                    >
                      <SelectTrigger className="h-8 bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="400">Regular</SelectItem>
                        <SelectItem value="500">Medium</SelectItem>
                        <SelectItem value="600">Bold</SelectItem>
                        <SelectItem value="700">Extra Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 3. NOVO: Font Size */}
                  <div className="space-y-2">
                     <Label className="text-xs text-slate-600">Size ({selectedCardStyle.fontSize}px)</Label>
                     <div className="flex items-center pt-1.5">
                       <Slider
                          value={[selectedCardStyle.fontSize || 14]}
                          onValueChange={(value) => updateSelectedNodeStyle({ fontSize: value[0] })}
                          min={10}
                          max={48}
                          step={1}
                          className="flex-1"
                        />
                     </div>
                  </div>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Text Color</Label>
                    <Select
                      value={selectedCardStyle.textColor}
                      onValueChange={(value) => updateSelectedNodeStyle({ textColor: value })}
                    >
                      <SelectTrigger className="h-8 bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {pastelPalette.text.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full border border-slate-200" style={{ backgroundColor: option.value }} />
                              {option.label}
                            </div>
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
                      <SelectTrigger className="h-8 bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {pastelPalette.card.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full border border-slate-200" style={{ backgroundColor: option.value }} />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <Label className="text-xs text-slate-600">Card Width ({selectedCardStyle.width}px)</Label>
                    <Slider
                      value={[selectedCardStyle.width]}
                      onValueChange={(value) => updateSelectedNodeStyle({ width: value[0] })}
                      min={60} max={500} step={10} className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600">Card Height ({selectedCardStyle.height}px)</Label>
                    <Slider
                      value={[selectedCardStyle.height]}
                      onValueChange={(value) => updateSelectedNodeStyle({ height: value[0] })}
                      min={40} max={400} step={10} className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
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

// Envolver com Provider para que useReactFlow funcione
const SermonMapView = (props) => (
  <ReactFlowProvider>
    <SermonMapContent {...props} />
  </ReactFlowProvider>
);

export default SermonMapView;