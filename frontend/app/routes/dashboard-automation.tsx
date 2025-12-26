import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
  Panel,
  useReactFlow
} from 'reactflow';
import type { Connection, Edge, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import type { Route } from "../+types/root";
import { 
  Zap, 
  Mail, 
  Clock, 
  Settings, 
  Save, 
  Play, 
  X,
  MoreHorizontal,
  Instagram,
  Youtube,
  Share2,
  Trash2
} from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Automation | Portyo" },
    { name: "description", content: "Build email automation workflows" },
  ];
}

// --- Node Configuration ---

type NodeType = 'trigger' | 'action' | 'condition' | 'delay' | 'instagram' | 'youtube' | 'integration';

interface NodeData {
  title: string;
  icon: React.ElementType;
  color: string;
  description?: string;
}

const NODE_CONFIG: Record<NodeType, NodeData> = {
  trigger: { title: "Trigger", icon: Zap, color: "bg-amber-500" },
  action: { title: "Email", icon: Mail, color: "bg-blue-500" },
  condition: { title: "Condition", icon: Settings, color: "bg-gray-500" },
  delay: { title: "Delay", icon: Clock, color: "bg-purple-500" },
  instagram: { title: "Instagram", icon: Instagram, color: "bg-pink-600" },
  youtube: { title: "YouTube", icon: Youtube, color: "bg-red-600" },
  integration: { title: "Integration", icon: Share2, color: "bg-indigo-500" },
};

// --- Custom Node Component ---

const CustomNode = ({ id, data, type, selected }: any) => {
  const config = NODE_CONFIG[type as NodeType] || NODE_CONFIG.trigger;
  const Icon = config.icon;
  const { setNodes, setEdges } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  };

  return (
    <div className={`w-[280px] bg-white rounded-xl shadow-sm border transition-all duration-200 group relative
      ${selected 
        ? 'border-primary ring-2 ring-primary/20 shadow-lg' 
        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }
    `}>
      {/* Input Handle */}
      {type !== 'trigger' && (
        <Handle 
          type="target" 
          position={Position.Top} 
          className="!w-4 !h-4 !bg-white !border-[3px] !border-gray-300 !-top-2 hover:!border-primary transition-colors" 
        />
      )}

      {/* Node Content */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          
          {/* Text Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-sm font-bold text-gray-900 truncate leading-tight mb-1">{data.label}</h3>
            <p className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">{config.title}</p>
          </div>
          
          {/* Options (Delete) */}
          <button 
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-50 rounded"
            title="Delete Step"
          >
             <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 my-3" />

        {/* Body/Details */}
        <div className="text-xs text-gray-600 leading-relaxed">
          {type === 'action' && (
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
              <span className="truncate">Subject: <span className="font-medium text-gray-900">{data.subject || 'Welcome to Portyo!'}</span></span>
            </div>
          )}
          {type === 'delay' && (
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Wait for <span className="font-medium text-gray-900">{data.duration || '24'} {data.unit || 'hours'}</span></span>
            </div>
          )}
          {type === 'trigger' && (
            <div>
              When someone subscribes to <span className="font-medium text-gray-900">Newsletter</span>
            </div>
          )}
          {type === 'condition' && (
            <div className="flex items-center gap-2">
               <span className="text-gray-500">Check if:</span>
               <span className="font-medium text-gray-900">Has Tag "VIP"</span>
            </div>
          )}
          {type === 'instagram' && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Action:</span>
              <span className="font-medium text-gray-900">{data.actionType === 'reply_comment' ? 'Reply to Comment' : 'Send DM'}</span>
            </div>
          )}
          {type === 'youtube' && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Action:</span>
              <span className="font-medium text-gray-900">Reply to Comment</span>
            </div>
          )}
          {type === 'integration' && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Platform:</span>
              <span className="font-medium text-gray-900">{data.platform || 'Google Sheets'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Output Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-4 !h-4 !bg-white !border-[3px] !border-gray-300 !-bottom-2 hover:!border-primary transition-colors" 
      />
    </div>
  );
};

const nodeTypes = {
  trigger: CustomNode,
  action: CustomNode,
  condition: CustomNode,
  delay: CustomNode,
  instagram: CustomNode,
  youtube: CustomNode,
  integration: CustomNode,
};

// --- Main Component ---

const initialNodes: Node[] = [
  { id: '1', type: 'trigger', position: { x: 250, y: 50 }, data: { label: 'New Subscriber' } },
  { id: '2', type: 'action', position: { x: 250, y: 250 }, data: { label: 'Welcome Email' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
];

export default function DashboardAutomation() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect = useCallback((params: Connection) => setEdges((eds:any) => addEdge(params, eds)), [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/label');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode: Node = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        position,
        data: { label: label },
      };

      setNodes((nds:any) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  };

  const onPaneClick = () => {
    setSelectedNodeId(null);
  };

  const updateNodeData = (key: string, value: any) => {
    setNodes((nds:any) =>
      nds.map((node:any) => {
        if (node.id === selectedNodeId) {
          return { ...node, data: { ...node.data, [key]: value } };
        }
        return node;
      })
    );
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="h-[calc(100vh-65px)] md:h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex overflow-hidden relative" ref={reactFlowWrapper}>
        {/* Top Right Actions */}
        <div className="absolute top-6 right-6 z-30 flex items-center gap-3 pointer-events-none">
          <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-gray-200/50 flex items-center gap-2 pointer-events-auto">
            <button className="px-4 py-2 hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <div className="w-px h-4 bg-gray-200"></div>
            <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm">
              <Play className="w-4 h-4" />
              Activate
            </button>
          </div>
        </div>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
          >
            <Background color="#94a3b8" gap={20} size={1} />
            <Controls className="!bg-white/80 !backdrop-blur-md !border-gray-200/50 !shadow-xl !rounded-xl !m-6" />
            
            <Panel position="top-left" className="!m-6">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-2 flex flex-col gap-1 w-14 items-center">
                {[
                  { type: 'trigger', label: 'Trigger', icon: Zap, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
                  { type: 'action', label: 'Email', icon: Mail, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
                  { type: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600 bg-pink-50 hover:bg-pink-100' },
                  { type: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600 bg-red-50 hover:bg-red-100' },
                  { type: 'delay', label: 'Delay', icon: Clock, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
                  { type: 'condition', label: 'Condition', icon: Settings, color: 'text-gray-600 bg-gray-50 hover:bg-gray-100' },
                  { type: 'integration', label: 'Integration', icon: Share2, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' },
                ].map((item) => (
                  <div
                    key={item.type}
                    className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center transition-colors cursor-grab active:cursor-grabbing relative group`}
                    onDragStart={(event) => {
                      event.dataTransfer.setData('application/reactflow', item.type);
                      event.dataTransfer.setData('application/label', item.label);
                      event.dataTransfer.effectAllowed = 'move';
                    }}
                    draggable
                    title={`Add ${item.label}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </ReactFlow>
        </ReactFlowProvider>

        {/* Properties Panel */}
        {selectedNode && (
          <div className="absolute right-6 top-6 bottom-6 w-[340px] bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-2xl flex flex-col z-30 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white/50 rounded-t-2xl">
              <h2 className="font-bold text-lg text-gray-900">Configuration</h2>
              <button 
                onClick={() => setSelectedNodeId(null)} 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              {/* Common: Label */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Step Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                  value={selectedNode.data.label}
                  onChange={(e) => updateNodeData('label', e.target.value)}
                />
              </div>

              {/* Trigger Configuration */}
              {selectedNode.type === 'trigger' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Event Type</label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                      value={selectedNode.data.eventType || 'newsletter_subscribe'}
                      onChange={(e) => updateNodeData('eventType', e.target.value)}
                    >
                        <option value="newsletter_subscribe">Newsletter Subscribe</option>
                        <option value="product_purchase">Product Purchase</option>
                        <option value="cart_abandoned">Cart Abandoned</option>
                        <option value="page_view">Page View</option>
                        <option value="custom_event">Custom Event</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <Settings className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Configuration */}
              {selectedNode.type === 'action' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Email Subject</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" 
                      placeholder="Enter subject..." 
                      value={selectedNode.data.subject || ''}
                      onChange={(e) => updateNodeData('subject', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Email Content</label>
                    <textarea 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm min-h-[120px] resize-y" 
                      placeholder="Write your email..."
                      value={selectedNode.data.content || ''}
                      onChange={(e) => updateNodeData('content', e.target.value)}
                    ></textarea>
                  </div>
                </>
              )}

              {/* Delay Configuration */}
              {selectedNode.type === 'delay' && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" 
                      defaultValue="1"
                      value={selectedNode.data.duration || '1'}
                      onChange={(e) => updateNodeData('duration', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Unit</label>
                    <select 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                      value={selectedNode.data.unit || 'Days'}
                      onChange={(e) => updateNodeData('unit', e.target.value)}
                    >
                      <option>Days</option>
                      <option>Hours</option>
                      <option>Minutes</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Instagram Configuration */}
              {selectedNode.type === 'instagram' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Action Type</label>
                    <select 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                      value={selectedNode.data.actionType || 'send_dm'}
                      onChange={(e) => updateNodeData('actionType', e.target.value)}
                    >
                      <option value="send_dm">Send DM</option>
                      <option value="reply_comment">Reply to Comment</option>
                      <option value="post_story">Post Story</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Message</label>
                    <textarea 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm min-h-[100px] resize-y" 
                      placeholder="Enter message..."
                      value={selectedNode.data.message || ''}
                      onChange={(e) => updateNodeData('message', e.target.value)}
                    ></textarea>
                  </div>
                </>
              )}

              {/* YouTube Configuration */}
              {selectedNode.type === 'youtube' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Action Type</label>
                    <select 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                      value={selectedNode.data.actionType || 'reply_comment'}
                      onChange={(e) => updateNodeData('actionType', e.target.value)}
                    >
                      <option value="reply_comment">Reply to Comment</option>
                      <option value="pin_comment">Pin Comment</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Comment Text</label>
                    <textarea 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm min-h-[100px] resize-y" 
                      placeholder="Enter comment..."
                      value={selectedNode.data.comment || ''}
                      onChange={(e) => updateNodeData('comment', e.target.value)}
                    ></textarea>
                  </div>
                </>
              )}

              {/* Integration Configuration */}
              {selectedNode.type === 'integration' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Platform</label>
                    <select 
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                      value={selectedNode.data.platform || 'google_sheets'}
                      onChange={(e) => updateNodeData('platform', e.target.value)}
                    >
                      <option value="google_sheets">Google Sheets</option>
                      <option value="slack">Slack</option>
                      <option value="webhook">Webhook</option>
                      <option value="zapier">Zapier</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Connection</label>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 flex items-center justify-between">
                      <span>No account connected</span>
                      <button className="text-primary font-bold text-xs hover:underline">Connect</button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex gap-3">
              <button 
                onClick={() => {
                  if (selectedNodeId) {
                    setNodes((nds:any) => nds.filter((n:any) => n.id !== selectedNodeId));
                    setEdges((eds:any) => eds.filter((edge:any) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
                    setSelectedNodeId(null);
                  }
                }}
                className="px-4 py-3.5 bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-xl font-bold transition-all shadow-sm"
                title="Delete Step"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setSelectedNodeId(null)}
                className="flex-1 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98]"
              >
                Apply Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
