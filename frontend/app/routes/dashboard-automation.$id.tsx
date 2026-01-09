import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
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
  useReactFlow,
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
  Pause,
  X,
  MoreHorizontal,
  Instagram,
  Youtube,
  Share2,
  Trash2,
  Layout,
  Edit,
  CheckCircle,
  AlertCircle,
  Loader2,
  Code
} from "lucide-react";
import { useBio } from "~/contexts/bio.context";
import {
  createAutomation,
  updateAutomation,
  activateAutomation,
  deactivateAutomation,
  getAutomationById,
  type Automation,
  type AutomationNode as ServiceAutomationNode,
  type AutomationEdge as ServiceAutomationEdge
} from "~/services/automation.service";
import { api } from "~/services/api";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Automation | Portyo" },
    { name: "description", content: "Build email automation workflows" },
  ];
}

// --- Node Configuration ---

type NodeType = 'trigger' | 'action' | 'condition' | 'delay' | 'instagram' | 'youtube' | 'integration' | 'page_event' | 'update_element' | 'sms' | 'webhook' | 'tag' | 'split_test' | 'notification';

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
  page_event: { title: "Page Event", icon: Layout, color: "bg-teal-500" },
  update_element: { title: "Update Element", icon: Edit, color: "bg-orange-500" },
  sms: { title: "SMS", icon: Mail, color: "bg-green-500" },
  webhook: { title: "Webhook", icon: Share2, color: "bg-violet-600" },
  tag: { title: "Add Tag", icon: CheckCircle, color: "bg-emerald-500" },
  split_test: { title: "A/B Split", icon: Settings, color: "bg-cyan-500" },
  notification: { title: "Push Notify", icon: AlertCircle, color: "bg-rose-500" },
};

// --- Custom Node Component ---

const CustomNode = ({ id, data, type, selected }: any) => {
  const config = NODE_CONFIG[type as NodeType] || NODE_CONFIG.trigger;
  const Icon = config.icon;
  const { setNodes, setEdges } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes: any) => nodes.filter((n: any) => n.id !== id));
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
              <span className="text-gray-500">Check:</span>
              <span className="font-medium text-gray-900">
                {data.conditionType === 'element_property'
                  ? `${data.property} ${data.operator} ${data.value}`
                  : `Has Tag "${data.tagName || 'VIP'}"`}
              </span>
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
          {type === 'page_event' && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Event:</span>
              <span className="font-medium text-gray-900">{data.eventType === 'page_load' ? 'Page Load' : 'Custom'}</span>
            </div>
          )}
          {type === 'update_element' && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Target:</span>
              <span className="font-medium text-gray-900">{data.elementId ? 'Selected Element' : 'None'}</span>
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
  page_event: CustomNode,
  update_element: CustomNode,
  sms: CustomNode,
  webhook: CustomNode,
  tag: CustomNode,
  split_test: CustomNode,
  notification: CustomNode,
};

// --- Main Component ---

const initialNodes: Node[] = [
  { id: '1', type: 'trigger', position: { x: 250, y: 50 }, data: { label: 'New Subscriber', eventType: 'newsletter_subscribe' } },
  { id: '2', type: 'action', position: { x: 250, y: 250 }, data: { label: 'Welcome Email', subject: 'Welcome to our newsletter!', content: 'Thank you for subscribing! We are excited to have you on board.' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
];

export default function DashboardAutomation() {
  const { bio } = useBio();
  const params = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Automation state
  const [currentAutomation, setCurrentAutomation] = useState<Automation | null>(null);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [automationName, setAutomationName] = useState("My Automation");
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    if (bio?.id) {
      api.get(`/templates/${bio.id}`).then(res => setTemplates(res.data)).catch(() => { });
    }
  }, [bio?.id]);

  // Helper function to ensure node data has required defaults
  const normalizeNodeData = (node: any) => {
    const data = { ...node.data };

    // Ensure trigger nodes have eventType
    if (node.type === 'trigger' && !data.eventType) {
      data.eventType = 'newsletter_subscribe';
    }

    // Ensure action nodes have default email content
    if (node.type === 'action') {
      if (!data.subject) data.subject = 'Welcome!';
      if (!data.content) data.content = 'Thank you for subscribing!';
    }

    return { ...node, data };
  };

  // Load existing automations
  // Load automation by ID
  useEffect(() => {
    const loadAutomation = async () => {
      if (!params.id) return;
      try {
        const data = await getAutomationById(params.id);
        setCurrentAutomation(data);
        setAutomationName(data.name);
        setNodes(data.nodes.map(normalizeNodeData));
        setEdges(data.edges);
      } catch (error) {
        console.error("Failed to load automation:", error);
        setStatusMessage({ type: 'error', message: 'Failed to find automation' });
      }
    };
    loadAutomation();
  }, [params.id]);

  // Clear status message after 3 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Save Draft handler
  const handleSaveDraft = async () => {
    if (!bio?.id) {
      setStatusMessage({ type: 'error', message: 'No bio selected' });
      return;
    }

    setIsSaving(true);
    try {
      const nodesData = nodes.map((n) => ({
        id: n.id,
        type: n.type as ServiceAutomationNode['type'],
        position: n.position,
        data: { ...n.data }
      }));

      const edgesData = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target
      }));

      let savedAutomation: Automation;

      if (currentAutomation) {
        // Update existing automation
        savedAutomation = await updateAutomation(currentAutomation.id, {
          name: automationName,
          nodes: nodesData,
          edges: edgesData
        });
      } else {
        // Create new automation
        savedAutomation = await createAutomation(bio.id, automationName, nodesData, edgesData);
      }

      setCurrentAutomation(savedAutomation);
      setStatusMessage({ type: 'success', message: 'Automation saved successfully!' });
    } catch (error: any) {
      console.error("Failed to save automation:", error);
      setStatusMessage({ type: 'error', message: error.response?.data?.message || 'Failed to save automation' });
    } finally {
      setIsSaving(false);
    }
  };

  // Activate/Deactivate handler
  const handleActivate = async () => {
    if (!currentAutomation) {
      // First save the automation if it doesn't exist
      await handleSaveDraft();
      return;
    }

    setIsActivating(true);
    try {
      let updatedAutomation: Automation;

      if (currentAutomation.isActive) {
        updatedAutomation = await deactivateAutomation(currentAutomation.id);
        setStatusMessage({ type: 'success', message: 'Automation deactivated!' });
      } else {
        updatedAutomation = await activateAutomation(currentAutomation.id);
        setStatusMessage({ type: 'success', message: 'Automation activated!' });
      }

      setCurrentAutomation(updatedAutomation);
    } catch (error: any) {
      console.error("Failed to toggle automation:", error);
      setStatusMessage({ type: 'error', message: error.response?.data?.message || 'Failed to toggle automation' });
    } finally {
      setIsActivating(false);
    }
  };

  const onConnect = useCallback((params: Connection) => setEdges((eds: any) => addEdge(params, eds)), [setEdges]);

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

      const newNode: Node = normalizeNodeData({
        id: Math.random().toString(36).substr(2, 9),
        type,
        position,
        data: { label: label },
      });

      setNodes((nds: any) => nds.concat(newNode));
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
    setNodes((nds: any) =>
      nds.map((node: any) => {
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
      <div className="h-[calc(100vh-65px)] md:h-screen flex flex-col bg-gray-50 flex-1">
        {/* Status Message Toast */}
        {statusMessage && (
          <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300 ${statusMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
            {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm font-medium">{statusMessage.message}</span>
          </div>
        )}

        {/* Header Bar */}
        <div className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-6 z-40 relative">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard/automation")}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-200"></div>
            <input
              type="text"
              value={automationName}
              onChange={(e) => setAutomationName(e.target.value)}
              className="bg-transparent border-none outline-none text-base font-bold text-gray-900 placeholder:text-gray-400 w-64 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors focus:bg-white focus:ring-2 focus:ring-primary/20"
              placeholder="Automation Name"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            {currentAutomation && (
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${currentAutomation.isActive
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}>
                <span className={`w-2 h-2 rounded-full ${currentAutomation.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                {currentAutomation.isActive ? 'Active' : 'Draft'}
              </div>
            )}

            <div className="w-px h-6 bg-gray-200 mx-2"></div>

            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-4 py-2 hover:bg-white hover:shadow-sm text-gray-600 rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 border border-transparent hover:border-gray-200"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>

            <button
              onClick={handleActivate}
              disabled={isActivating}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 ${currentAutomation?.isActive
                ? 'bg-red-50 text-red-600 bg-red-50 hover:bg-red-100 border border-red-100'
                : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md'
                }`}
            >
              {isActivating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : currentAutomation?.isActive ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isActivating ? 'Processing...' : currentAutomation?.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative" ref={reactFlowWrapper}>
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
              fitViewOptions={{ maxZoom: 1 }}
              minZoom={0.1}
              maxZoom={1}
              className="bg-gray-50"
            >
              <Background color="#94a3b8" gap={20} size={1} />
              <Controls className="!bg-white !border-gray-200 !shadow-lg !rounded-xl !m-4" />

              <Panel position="top-left" className="!m-4 !top-4">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-2 flex flex-col gap-1 w-14 items-center">
                  {[
                    { type: 'trigger', label: 'Trigger', icon: Zap, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
                    { type: 'action', label: 'Email', icon: Mail, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
                    { type: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600 bg-pink-50 hover:bg-pink-100' },
                    { type: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600 bg-red-50 hover:bg-red-100' },
                    { type: 'delay', label: 'Delay', icon: Clock, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
                    { type: 'condition', label: 'Condition', icon: Settings, color: 'text-gray-600 bg-gray-50 hover:bg-gray-100' },
                    { type: 'integration', label: 'Integration', icon: Share2, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' },
                    { type: 'page_event', label: 'Page Event', icon: Layout, color: 'text-teal-600 bg-teal-50 hover:bg-teal-100' },
                    { type: 'update_element', label: 'Update Element', icon: Edit, color: 'text-orange-600 bg-orange-50 hover:bg-orange-100' },
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
                        <optgroup label="📧 Subscriber Events">
                          <option value="newsletter_subscribe">New Subscriber</option>
                          <option value="subscriber_unsubscribe">Unsubscribed</option>
                          <option value="email_opened">Email Opened</option>
                          <option value="email_clicked">Email Link Clicked</option>
                        </optgroup>
                        <optgroup label="👁️ Page Events">
                          <option value="bio_visit">Bio Page Visit</option>
                          <option value="link_click">Link Click</option>
                          <option value="qrcode_scan">QR Code Scanned</option>
                          <option value="video_watch">Video Watched</option>
                          <option value="scroll_depth">Scroll Depth Reached</option>
                        </optgroup>
                        <optgroup label="💳 E-commerce">
                          <option value="product_purchase">Product Purchase</option>
                          <option value="cart_abandoned">Cart Abandoned</option>
                          <option value="checkout_started">Checkout Started</option>
                          <option value="refund_requested">Refund Requested</option>
                        </optgroup>
                        <optgroup label="📊 Analytics">
                          <option value="milestone_reached">Milestone Reached</option>
                          <option value="views_milestone">Views Milestone (100, 1K, 10K)</option>
                          <option value="followers_milestone">Followers Milestone</option>
                        </optgroup>
                        <optgroup label="📅 Time-based">
                          <option value="schedule_daily">Daily Schedule</option>
                          <option value="schedule_weekly">Weekly Schedule</option>
                          <option value="date_trigger">Specific Date/Time</option>
                          <option value="subscriber_anniversary">Subscriber Anniversary</option>
                        </optgroup>
                        <optgroup label="⚡ Other">
                          <option value="form_submit">Form Submit</option>
                          <option value="social_follow">Social Follow</option>
                          <option value="webhook_received">Webhook Received</option>
                          <option value="custom_event">Custom Event</option>
                        </optgroup>
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
                    <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Load from Template</label>
                      <select
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                        onChange={(e) => {
                          const template = templates.find(t => t.id === e.target.value);
                          if (template && template.html) {
                            if (confirm("This will overwrite existing content. Continue?")) {
                              updateNodeData('content', template.html);
                            }
                          }
                        }}
                        value=""
                      >
                        <option value="">Select a template...</option>
                        {templates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Email Subject</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        placeholder="Welcome {{ownerFirstName}}'s newsletter!"
                        value={selectedNode.data.subject || ''}
                        onChange={(e) => updateNodeData('subject', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Email Content</label>
                      <textarea
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm min-h-[120px] resize-y"
                        placeholder="Hi there! Thanks for subscribing to {{bioName}}..."
                        value={selectedNode.data.content || ''}
                        onChange={(e) => updateNodeData('content', e.target.value)}
                      ></textarea>
                    </div>

                    {/* Template Variables Documentation */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Code className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Template Variables</span>
                      </div>
                      <p className="text-xs text-blue-600">Use these variables in subject or content. They'll be replaced with real values.</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-700">Subscriber</p>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{email}}"}</code>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-700">Your Bio</p>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{bioName}}"}</code>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{bioUrl}}"}</code>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-700">Owner (You)</p>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{ownerName}}"}</code>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{ownerFirstName}}"}</code>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-700">Date/Time</p>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{currentDate}}"}</code>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{currentYear}}"}</code>
                        </div>
                      </div>
                      <details className="text-xs">
                        <summary className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium">More variables...</summary>
                        <div className="mt-2 grid grid-cols-2 gap-1 text-blue-600">
                          <code className="bg-white/60 px-1.5 py-0.5 rounded">{"{{bioDescription}}"}</code>
                          <code className="bg-white/60 px-1.5 py-0.5 rounded">{"{{bioViews}}"}</code>
                          <code className="bg-white/60 px-1.5 py-0.5 rounded">{"{{bioClicks}}"}</code>
                          <code className="bg-white/60 px-1.5 py-0.5 rounded">{"{{instagram}}"}</code>
                          <code className="bg-white/60 px-1.5 py-0.5 rounded">{"{{twitter}}"}</code>
                          <code className="bg-white/60 px-1.5 py-0.5 rounded">{"{{youtube}}"}</code>
                          <code className="bg-white/60 px-1.5 py-0.5 rounded">{"{{linkedin}}"}</code>
                          <code className="bg-white/60 px-1.5 py-0.5 rounded">{"{{website}}"}</code>
                          <code className="bg-white/60 px-1.5 py-0.5 rounded">{"{{currentTime}}"}</code>
                        </div>
                      </details>
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

                {/* Condition Configuration */}
                {selectedNode.type === 'condition' && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Condition Type</label>
                      <select
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                        value={selectedNode.data.conditionType || 'tag'}
                        onChange={(e) => updateNodeData('conditionType', e.target.value)}
                      >
                        <option value="tag">Has Tag</option>
                        <option value="element_property">Element Property</option>
                      </select>
                    </div>

                    {selectedNode.data.conditionType === 'element_property' && (
                      <>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Target Element</label>
                          <select
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                            value={selectedNode.data.elementId || ''}
                            onChange={(e) => updateNodeData('elementId', e.target.value)}
                          >
                            <option value="">Select an element...</option>
                            {bio?.blocks?.map((block) => (
                              <option key={block.id} value={block.id}>
                                {block.title || block.type} ({block.id.substr(0, 4)})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Property</label>
                          <select
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                            value={selectedNode.data.property || 'title'}
                            onChange={(e) => updateNodeData('property', e.target.value)}
                          >
                            <option value="title">Title</option>
                            <option value="body">Body</option>
                            <option value="href">URL</option>
                            <option value="visible">Visibility</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Operator</label>
                          <select
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                            value={selectedNode.data.operator || 'equals'}
                            onChange={(e) => updateNodeData('operator', e.target.value)}
                          >
                            <option value="equals">Equals</option>
                            <option value="contains">Contains</option>
                            <option value="not_equals">Not Equals</option>
                            <option value="starts_with">Starts With</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Value</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            placeholder="Value to check..."
                            value={selectedNode.data.value || ''}
                            onChange={(e) => updateNodeData('value', e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    {(!selectedNode.data.conditionType || selectedNode.data.conditionType === 'tag') && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Tag Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                          placeholder="e.g. VIP"
                          value={selectedNode.data.tagName || ''}
                          onChange={(e) => updateNodeData('tagName', e.target.value)}
                        />
                      </div>
                    )}
                  </>
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

                {/* Page Event Configuration */}
                {selectedNode.type === 'page_event' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Event Type</label>
                    <select
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                      value={selectedNode.data.eventType || 'page_load'}
                      onChange={(e) => updateNodeData('eventType', e.target.value)}
                    >
                      <option value="page_load">Page Load</option>
                      <option value="scroll_percentage">Scroll Percentage</option>
                      <option value="exit_intent">Exit Intent</option>
                    </select>
                  </div>
                )}

                {selectedNode.type === 'update_element' && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Target Element</label>
                      <select
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                        value={selectedNode.data.elementId || ''}
                        onChange={(e) => updateNodeData('elementId', e.target.value)}
                      >
                        <option value="">Select an element...</option>
                        {bio?.blocks?.map((block) => (
                          <option key={block.id} value={block.id}>
                            {block.title || block.type} ({block.id.substr(0, 4)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Property to Update</label>
                      <select
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                        value={selectedNode.data.property || 'title'}
                        onChange={(e) => updateNodeData('property', e.target.value)}
                      >
                        <option value="title">Title</option>
                        <option value="body">Body</option>
                        <option value="href">URL</option>
                        <option value="buttonStyle">Button Style</option>
                        <option value="visible">Visibility</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">New Value</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        placeholder="Enter new value..."
                        value={selectedNode.data.value || ''}
                        onChange={(e) => updateNodeData('value', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* SMS Configuration */}
                {selectedNode.type === 'sms' && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        placeholder="+55 11 99999-9999 or {{phone}}"
                        value={selectedNode.data.phone || ''}
                        onChange={(e) => updateNodeData('phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Message</label>
                      <textarea
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm min-h-[100px] resize-y"
                        placeholder="Hi {{ownerFirstName}}! Thanks for subscribing..."
                        value={selectedNode.data.message || ''}
                        onChange={(e) => updateNodeData('message', e.target.value)}
                      />
                      <p className="text-xs text-gray-500">Max 160 characters for SMS. Use template variables.</p>
                    </div>
                  </>
                )}

                {/* Webhook Configuration */}
                {selectedNode.type === 'webhook' && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Method</label>
                      <select
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                        value={selectedNode.data.method || 'POST'}
                        onChange={(e) => updateNodeData('method', e.target.value)}
                      >
                        <option value="POST">POST</option>
                        <option value="GET">GET</option>
                        <option value="PUT">PUT</option>
                        <option value="PATCH">PATCH</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">URL</label>
                      <input
                        type="url"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        placeholder="https://api.example.com/webhook"
                        value={selectedNode.data.webhookUrl || ''}
                        onChange={(e) => updateNodeData('webhookUrl', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Headers (JSON)</label>
                      <textarea
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm min-h-[60px] resize-y font-mono text-xs"
                        placeholder='{"Authorization": "Bearer token"}'
                        value={selectedNode.data.headers || ''}
                        onChange={(e) => updateNodeData('headers', e.target.value)}
                      />
                    </div>
                    <div className="bg-violet-50 border border-violet-200/50 rounded-xl p-3">
                      <p className="text-xs text-violet-700">📤 All context data will be sent in the request body as JSON.</p>
                    </div>
                  </>
                )}

                {/* Tag Configuration */}
                {selectedNode.type === 'tag' && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Action</label>
                      <select
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                        value={selectedNode.data.tagAction || 'add'}
                        onChange={(e) => updateNodeData('tagAction', e.target.value)}
                      >
                        <option value="add">Add Tag</option>
                        <option value="remove">Remove Tag</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Tag Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        placeholder="e.g. VIP, Newsletter, Engaged"
                        value={selectedNode.data.tagName || ''}
                        onChange={(e) => updateNodeData('tagName', e.target.value)}
                      />
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200/50 rounded-xl p-3">
                      <p className="text-xs text-emerald-700">🏷️ Tags help segment your subscribers for targeted automations.</p>
                    </div>
                  </>
                )}

                {/* Split Test Configuration */}
                {selectedNode.type === 'split_test' && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Split Ratio</label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 mb-1 block">Path A</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            value={selectedNode.data.splitA || '50'}
                            onChange={(e) => updateNodeData('splitA', e.target.value)}
                          />
                        </div>
                        <span className="text-gray-400 font-bold mt-6">:</span>
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 mb-1 block">Path B</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            value={selectedNode.data.splitB || '50'}
                            onChange={(e) => updateNodeData('splitB', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="bg-cyan-50 border border-cyan-200/50 rounded-xl p-3">
                      <p className="text-xs text-cyan-700">🔀 Connect two different paths from this node. Traffic will be randomly split.</p>
                    </div>
                  </>
                )}

                {/* Notification Configuration */}
                {selectedNode.type === 'notification' && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Notification Type</label>
                      <select
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                        value={selectedNode.data.notifyType || 'owner'}
                        onChange={(e) => updateNodeData('notifyType', e.target.value)}
                      >
                        <option value="owner">Notify Me (Owner)</option>
                        <option value="email">Email Alert</option>
                        <option value="slack">Slack Message</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Title</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        placeholder="New subscriber!"
                        value={selectedNode.data.notifyTitle || ''}
                        onChange={(e) => updateNodeData('notifyTitle', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Message</label>
                      <textarea
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm min-h-[80px] resize-y"
                        placeholder="{{email}} subscribed to your newsletter!"
                        value={selectedNode.data.notifyMessage || ''}
                        onChange={(e) => updateNodeData('notifyMessage', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex gap-3">
                <button
                  onClick={() => {
                    if (selectedNodeId) {
                      setNodes((nds: any) => nds.filter((n: any) => n.id !== selectedNodeId));
                      setEdges((eds: any) => eds.filter((edge: any) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
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
    </div>
  );
}
