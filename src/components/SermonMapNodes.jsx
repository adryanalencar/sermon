
import React, { memo, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Book } from 'lucide-react';

// Common handle styles
const handleStyle = { width: 8, height: 8, background: '#94a3b8' };

const NodeInput = ({ value, nodeId, field = 'label', className, isTextArea = false }) => {
  const { setNodes } = useReactFlow();

  const handleChange = useCallback((evt) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              [field]: evt.target.value,
            },
          };
        }
        return node;
      })
    );
  }, [nodeId, setNodes, field]);

  if (isTextArea) {
    return (
      <textarea
        className={`nodrag bg-transparent outline-none resize-none w-full h-full overflow-hidden font-inherit ${className}`}
        value={value}
        onChange={handleChange}
        placeholder="Type here..."
      />
    );
  }

  return (
    <input
      className={`nodrag bg-transparent outline-none w-full text-center font-inherit ${className}`}
      value={value}
      onChange={handleChange}
      placeholder="Label"
    />
  );
};

export const StartNode = memo(({ id, data, isConnectable }) => {
  return (
    <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-green-100 border-2 border-green-300 shadow-sm transition-all hover:shadow-md">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={handleStyle} />
      <div className="p-2 w-full flex items-center justify-center">
        <NodeInput 
          nodeId={id} 
          value={data.label} 
          className="text-xs font-serif font-bold text-green-800 placeholder:text-green-800/50"
        />
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={handleStyle} />
    </div>
  );
});

export const ProcessNode = memo(({ id, data, isConnectable }) => {
  return (
    <div className="relative px-2 py-2 shadow-md rounded-md bg-white border-2 border-slate-200 w-[180px] min-h-[80px] flex items-center transition-all hover:shadow-lg">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={handleStyle} />
      <div className="w-full h-full">
        <NodeInput 
          nodeId={id} 
          value={data.label} 
          isTextArea 
          className="font-serif font-medium text-slate-700 text-sm text-center min-h-[60px]"
        />
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={handleStyle} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} style={handleStyle} />
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} style={handleStyle} />
    </div>
  );
});

export const DecisionNode = memo(({ id, data, isConnectable }) => {
  return (
    <div className="relative w-36 h-36 flex items-center justify-center group">
      <div className="absolute inset-0 bg-blue-50 border-2 border-blue-200 rotate-45 rounded-sm shadow-sm transition-all group-hover:border-blue-300 group-hover:shadow-md"></div>
      <div className="relative z-10 p-2 w-[100px] h-[100px] flex items-center justify-center">
        <NodeInput 
          nodeId={id} 
          value={data.label} 
          isTextArea
          className="text-xs font-serif font-bold text-blue-800 text-center placeholder:text-blue-800/50"
        />
      </div>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={{ ...handleStyle, top: -4 }} />
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} style={{ ...handleStyle, right: -4 }} />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={{ ...handleStyle, bottom: -4 }} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} style={{ ...handleStyle, left: -4 }} />
    </div>
  );
});

export const VerseNode = memo(({ id, data, isConnectable }) => {
  return (
    <div className="relative w-72 bg-cream-50 border-l-4 border-amber-300 shadow-md rounded-r-md p-3 transition-all hover:shadow-lg bg-[#fffdf5]">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={handleStyle} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} style={handleStyle} />
      
      <div className="flex items-center gap-2 mb-2 text-amber-800 pb-2 border-b border-amber-100">
        <Book className="w-3.5 h-3.5 flex-shrink-0" />
        <NodeInput 
          nodeId={id} 
          value={data.ref} 
          field="ref"
          className="text-xs font-bold uppercase tracking-wider text-left bg-transparent w-full"
        />
      </div>
      <div className="h-full">
        <NodeInput 
          nodeId={id} 
          value={data.text} 
          field="text"
          isTextArea
          className="text-xs font-serif italic text-slate-600 leading-relaxed min-h-[80px]"
        />
      </div>
      
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={handleStyle} />
    </div>
  );
});
