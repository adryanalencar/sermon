import React, { memo, useCallback, useEffect, useRef } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Book } from 'lucide-react';

// Common handle styles
const handleStyle = { width: 8, height: 8, background: '#94a3b8' };

// --- NOVO COMPONENTE DE INPUT QUE CRESCE ---
const AutoResizingTextarea = ({ value, onChange, className, style, placeholder }) => {
  const textareaRef = useRef(null);

  // Ajusta a altura sempre que o valor mudar
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reseta para calcular corretamente
      textarea.style.height = `${textarea.scrollHeight}px`; // Define a nova altura
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      className={`nodrag bg-transparent outline-none resize-none w-full overflow-hidden block ${className}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={style}
      rows={1}
    />
  );
};

const NodeInput = ({ value, nodeId, field = 'label', className, isTextArea = false, style }) => {
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
      <AutoResizingTextarea
        className={className}
        value={value}
        onChange={handleChange}
        placeholder="Type here..."
        style={style}
      />
    );
  }

  return (
    <input
      className={`nodrag bg-transparent outline-none w-full text-center font-inherit ${className}`}
      value={value}
      onChange={handleChange}
      placeholder="Label"
      style={style}
    />
  );
};

const resolveCardStyle = (dataStyle = {}, defaults = {}) => ({
  fontFamily: 'serif',
  fontWeight: 500,
  fontSize: 14,
  textColor: '#334155',
  cardColor: '#ffffff',
  width: 180,
  height: 80,
  ...defaults,
  ...dataStyle,
});

export const StartNode = memo(({ id, data, isConnectable }) => {
  const cardStyle = resolveCardStyle(data?.style, {
    width: 80,
    height: 80,
    cardColor: '#dcfce7',
    textColor: '#166534'
  });

  return (
    <div 
      className="relative flex items-center justify-center rounded-full border-2 shadow-sm transition-all hover:shadow-md"
      style={{
        width: cardStyle.width,
        height: cardStyle.height,
        backgroundColor: cardStyle.cardColor,
        borderColor: cardStyle.textColor,
        color: cardStyle.textColor,
        fontFamily: cardStyle.fontFamily,
        fontWeight: cardStyle.fontWeight,
        fontSize: `${cardStyle.fontSize}px`,
      }}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={handleStyle} />
      <div className="p-2 w-full flex items-center justify-center">
        <NodeInput 
          nodeId={id} 
          value={data.label} 
          className="font-bold placeholder:opacity-50 text-center"
          style={{ fontSize: 'inherit' }} 
        />
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={handleStyle} />
    </div>
  );
});

export const ProcessNode = memo(({ id, data, isConnectable }) => {
  const cardStyle = resolveCardStyle(data?.style);
  
  return (
    <div
      className="relative px-2 py-2 shadow-md rounded-md border-2 border-slate-200 flex items-center flex-col justify-center transition-all hover:shadow-lg"
      style={{
        width: cardStyle.width,
        minHeight: cardStyle.height, // Alterado para minHeight
        height: 'auto',              // Permite crescer
        backgroundColor: cardStyle.cardColor,
        color: cardStyle.textColor,
        fontFamily: cardStyle.fontFamily,
        fontWeight: cardStyle.fontWeight,
        fontSize: `${cardStyle.fontSize}px`,
      }}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={handleStyle} />
      <div className="w-full flex items-center justify-center my-auto">
        <NodeInput 
          nodeId={id} 
          value={data.label} 
          isTextArea 
          className="text-center"
          style={{
            color: 'inherit',
            fontSize: 'inherit',
            fontFamily: 'inherit',
            fontWeight: 'inherit',
          }}
        />
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={handleStyle} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} style={handleStyle} />
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} style={handleStyle} />
    </div>
  );
});

export const DecisionNode = memo(({ id, data, isConnectable }) => {
  const cardStyle = resolveCardStyle(data?.style, {
    width: 140,
    height: 140,
    cardColor: '#eff6ff',
    textColor: '#1e40af'
  });

  return (
    <div 
      className="relative flex items-center justify-center group"
      style={{ width: cardStyle.width, height: cardStyle.height }}
    >
      <div 
        className="absolute inset-0 border-2 rotate-45 rounded-sm shadow-sm transition-all group-hover:shadow-md"
        style={{
          backgroundColor: cardStyle.cardColor,
          borderColor: cardStyle.textColor,
          opacity: 0.9
        }}
      ></div>
      
      <div 
        className="relative z-10 p-4 flex items-center justify-center w-full h-full"
        style={{
          fontFamily: cardStyle.fontFamily,
          fontWeight: cardStyle.fontWeight,
          fontSize: `${cardStyle.fontSize}px`,
          color: cardStyle.textColor
        }}
      >
        <NodeInput 
          nodeId={id} 
          value={data.label} 
          isTextArea
          className="font-bold text-center placeholder:opacity-50"
          style={{ fontSize: 'inherit', color: 'inherit' }}
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
  const cardStyle = resolveCardStyle(data?.style, {
    width: 288,
    height: 120,
    cardColor: '#fffdf5',
    textColor: '#92400e',
    fontSize: 14
  });

  let refText = data.ref;
  let bodyText = data.text;

  if (!refText && !bodyText && data.label) {
    const parts = data.label.split('\n');
    refText = parts[0];
    bodyText = parts.slice(1).join('\n');
  }

  return (
    <div
      // 1. Reduzi o padding de p-3 para p-2
      className="relative border-l-4 border-amber-300 shadow-md rounded-r-md p-2 transition-all hover:shadow-lg flex flex-col"
      style={{
        width: cardStyle.width,
        minHeight: cardStyle.height, // 2. Usa minHeight
        height: 'auto',              // 3. Permite crescer
        backgroundColor: cardStyle.cardColor,
        color: cardStyle.textColor,
        fontFamily: cardStyle.fontFamily,
        fontWeight: cardStyle.fontWeight,
        fontSize: `${cardStyle.fontSize}px`,
      }}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={handleStyle} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} style={handleStyle} />
      
      {/* 4. Reduzi margens do cabeçalho (mb-2 pb-2 -> mb-1 pb-1) */}
      <div className="flex items-center gap-2 mb-1 pb-1 border-b border-amber-100/50 shrink-0">
        <Book className="w-4 h-4 flex-shrink-0 opacity-70" />
        <NodeInput 
          nodeId={id} 
          value={refText} 
          field="ref"
          className="uppercase tracking-wider text-left bg-transparent w-full font-bold"
          style={{
            fontSize: '0.9em',
            color: 'inherit'
          }}
        />
      </div>
      
      {/* 5. Área de texto flexível */}
      <div className="flex-1 min-h-[40px]">
        <NodeInput 
          nodeId={id} 
          value={bodyText} 
          field="text"
          isTextArea
          className="italic leading-relaxed"
          style={{
            fontSize: 'inherit',
            color: 'inherit'
          }}
        />
      </div>
      
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={handleStyle} />
    </div>
  );
});