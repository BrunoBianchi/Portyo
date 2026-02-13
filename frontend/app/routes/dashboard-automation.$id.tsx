import { useState, useCallback, useRef, useEffect, useContext, useMemo } from 'react';
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
  Code,
  Calculator,
  Calendar,
  QrCode,
  Trophy,
  GitBranch,
  Timer,
  Globe,
  MessageSquare,
  BadgePercent
} from "lucide-react";
import { useBio } from "~/contexts/bio.context";
import AuthContext from "~/contexts/auth.context";
import { AuthorizationGuard } from "~/contexts/guard.context";
import {
  createAutomation,
  updateAutomation,
  activateAutomation,
  deactivateAutomation,
  getAutomationById,
  getAutomationsByBio,
  type Automation,
  type AutomationNode as ServiceAutomationNode,
  type AutomationEdge as ServiceAutomationEdge
} from "~/services/automation.service";
import { api } from "~/services/api";
import { useTranslation } from "react-i18next";
import { useDriverTour, useIsMobile } from "~/utils/driver";
import type { DriveStep } from "driver.js";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Automation | Portyo" },
    { name: "description", content: "Build email automation workflows" },
  ];
}

// --- Node Configuration ---

type NodeType = 'trigger' | 'action' | 'condition' | 'delay' | 'instagram' | 'youtube' | 'integration' | 'page_event' | 'update_element' | 'sms' | 'webhook' | 'tag' | 'split_test' | 'notification' | 'math_operation' | 'wait' | 'discord' | 'stripe_discount';

interface NodeData {
  title: string;
  icon: React.ElementType;
  color: string;
  description?: string;
}

const NODE_CONFIG: Record<NodeType, NodeData> = {
  trigger: { title: "Trigger", icon: Zap, color: "bg-amber-100" },
  action: { title: "Email", icon: Mail, color: "bg-blue-100" },
  condition: { title: "Condition", icon: GitBranch, color: "bg-orange-100" },
  delay: { title: "Delay", icon: Clock, color: "bg-primary" },
  instagram: { title: "Instagram", icon: Instagram, color: "bg-pink-600" },
  youtube: { title: "YouTube", icon: Youtube, color: "bg-red-600" },
  integration: { title: "Integration", icon: Share2, color: "bg-indigo-100" },
  page_event: { title: "Page Event", icon: Layout, color: "bg-teal-500" },
  update_element: { title: "Update Element", icon: Edit, color: "bg-amber-500" },
  sms: { title: "SMS", icon: Mail, color: "bg-green-100" },
  webhook: { title: "Webhook", icon: Globe, color: "bg-violet-600" },
  tag: { title: "Add Tag", icon: CheckCircle, color: "bg-emerald-100" },
  split_test: { title: "A/B Split", icon: Settings, color: "bg-cyan-100" },
  notification: { title: "Push Notify", icon: AlertCircle, color: "bg-rose-500" },
  math_operation: { title: "Math", icon: Calculator, color: "bg-indigo-600" },
  wait: { title: "Wait", icon: Timer, color: "bg-slate-500" },
  discord: { title: "Discord", icon: MessageSquare, color: "bg-blue-600" },
  stripe_discount: { title: "Stripe Discount", icon: BadgePercent, color: "bg-emerald-600" },
};

// --- Custom Node Component ---

const CustomNode = ({ id, data, type, selected }: any) => {
  const config = NODE_CONFIG[type as NodeType] || NODE_CONFIG.trigger;
  const Icon = config.icon;
  const { setNodes, setEdges } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this step?')) {
      setNodes((nodes: any) => nodes.filter((n: any) => n.id !== id));
      setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
    }
  };

  return (
    <div data-tour="automation-builder-node" className={`w-[300px] md:w-[320px] bg-white rounded-[20px] transition-all duration-200 group relative
      ${selected
        ? 'border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10'
        : 'border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5'
      }
    `}>
      {/* Input Handle (Top) */}
      {type !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-4 !h-4 !bg-white !border-[3px] !border-black !-top-2.5 transition-colors z-20"
        />
      )}

      {/* Main Content */}
      <div className="p-4 md:p-5 flex items-center gap-3 md:gap-4">
        <div className={`w-12 h-12 rounded-xl border-2 border-black ${config.color} flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0`}>
          <Icon className="w-6 h-6 stroke-[2.5px]" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-[17px] md:text-base font-black text-[#1A1A1A] truncate leading-tight mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>{data.label || config.title}</h3>
          <p className="text-[11px] md:text-[10px] text-gray-500 font-bold tracking-wider uppercase">{config.title}</p>
        </div>

        <button
          onClick={onDelete}
          className="text-black bg-[#E94E77] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-110"
        >
          <Trash2 className="w-4 h-4 text-white stroke-[3px]" />
        </button>
      </div>

      {/* Divider */}
      <div className="h-0.5 bg-black mx-4" />

      {/* Node Details / Preview */}
      <div className="p-3 px-4 text-sm md:text-xs font-bold text-gray-600 min-h-[56px] flex items-center bg-gray-50 rounded-b-[16px]">
        {type === 'trigger' && (
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-600 fill-current" />
            <span>Event: <span className="font-black text-black">{data.eventType || 'Select event...'}</span></span>
          </div>
        )}
        {type === 'action' && (
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <span className="font-black text-black truncate">{data.subject || 'No subject'}</span>
            <span className="truncate opacity-75">{data.content || 'No content...'}</span>
          </div>
        )}
        {type === 'condition' && (
          <div className="flex items-center gap-1.5 overflow-hidden">
            <GitBranch className="w-3.5 h-3.5 text-orange-600" />
            <span className="truncate italic">
              {data.conditionKey ? `${data.conditionKey} ${data.conditionOperator} ${data.conditionValue}` : 'Configure branching...'}
            </span>
          </div>
        )}
        {type === 'wait' && (
          <div className="flex items-center gap-2">
            <Timer className="w-3.5 h-3.5 text-blue-600" />
            <span>Delay: <span className="font-black text-black">{data.waitDuration || 1} {data.waitUnit || 'minutes'}</span></span>
          </div>
        )}
        {type === 'webhook' && (
          <div className="flex items-center gap-2 overflow-hidden">
            <Globe className="w-3.5 h-3.5 text-violet-600" />
            <span className="truncate font-mono">{data.webhookUrl || 'Enter URL...'}</span>
          </div>
        )}
        {type === 'discord' && (
          <div className="flex items-center gap-2 overflow-hidden">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            <span className="truncate italic">{data.discordMessage || 'Alert message...'}</span>
          </div>
        )}
        {type === 'math_operation' && (
          <div className="flex items-center gap-1.5 font-mono">
            <Calculator className="w-3.5 h-3.5 text-indigo-600" />
            <span>{data.operand1 || '?'} {data.mathOperator || '+'} {data.operand2 || '?'} = {'{{'}{data.resultVarName || 'res'}{'}}'}</span>
          </div>
        )}
        {type === 'stripe_discount' && (
          <div className="flex items-center gap-2">
            <BadgePercent className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate">
              {data.discountType === 'amount'
                ? `${data.amountOff || 0} ${data.currency || ''}`
                : `${data.percentOff || 0}%`} {data.durationType || 'once'}
            </span>
          </div>
        )}
        {!['trigger', 'action', 'condition', 'wait', 'webhook', 'discord', 'math_operation', 'stripe_discount'].includes(type) && (
          <span className="italic opacity-60">Ready to configure...</span>
        )}
      </div>

      {/* Output Handles (Bottom) */}
      {type === 'condition' ? (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            style={{ left: '30%' }}
            className="!w-4 !h-4 !bg-[#C6F035] !border-[3px] !border-black !-bottom-2.5 z-20"
          />
          <div className="absolute -bottom-7 left-1/4 -translate-x-1/2 text-[10px] font-black text-black bg-[#C6F035] px-2 py-0.5 rounded-md border-2 border-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <CheckCircle className="w-2.5 h-2.5" /> TRUE
          </div>

          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            style={{ left: '70%' }}
            className="!w-4 !h-4 !bg-[#E94E77] !border-[3px] !border-black !-bottom-2.5 z-20"
          />
          <div className="absolute -bottom-7 left-3/4 -translate-x-1/2 text-[10px] font-black text-white bg-[#E94E77] px-2 py-0.5 rounded-md border-2 border-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <X className="w-2.5 h-2.5" /> FALSE
          </div>
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-4 !h-4 !bg-white !border-[3px] !border-black !-bottom-2.5 z-20 hover:!bg-black transition-colors"
        />
      )}
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
  math_operation: CustomNode,
  wait: CustomNode,
  discord: CustomNode,
  stripe_discount: CustomNode,
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
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
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
  const [automationName, setAutomationName] = useState(t("dashboard.automationBuilder.defaultName"));
  const [templates, setTemplates] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
  const isMobile = useIsMobile();
  const { startTour } = useDriverTour({ primaryColor: tourPrimaryColor, storageKey: "portyo:automation-builder-tour-done" });
  const [isFirstAutomation, setIsFirstAutomation] = useState(false);

  useEffect(() => {
    // Only load templates if user is PRO
    if (bio?.id && user?.plan === 'pro') {
      api.get(`/templates/${bio.id}`).then(res => setTemplates(res.data)).catch(() => { });
    }

    // Load available forms
    if (bio?.id) {
      api.get(`/form/bios/${bio.id}/forms`).then(res => setForms(res?.data || [])).catch(() => { });
    }
  }, [bio?.id, user?.plan]);

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

    if (node.type === 'stripe_discount') {
      if (!data.discountType) data.discountType = 'percent';
      if (!data.percentOff) data.percentOff = 10;
      if (!data.durationType) data.durationType = 'once';
      if (!data.promotionCodePrefix) data.promotionCodePrefix = 'PORTYO';
      if (!data.expiresInUnit) data.expiresInUnit = 'days';
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
        setStatusMessage({ type: 'error', message: t("dashboard.automationBuilder.errors.notFound") });
      }
    };
    loadAutomation();
  }, [params.id]);

  // Validate first automation via API
  useEffect(() => {
    const validateFirstAutomation = async () => {
      if (!bio?.id || !currentAutomation?.id) return;
      try {
        const data = await getAutomationsByBio(bio.id);
        setIsFirstAutomation(data.length === 1 && data[0]?.id === currentAutomation.id);
      } catch (error) {
        console.error("Failed to validate first automation:", error);
      }
    };

    validateFirstAutomation();
  }, [bio?.id, currentAutomation?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isMobile) return;

    const rootStyles = getComputedStyle(document.documentElement);
    const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
    if (primaryFromTheme) {
      setTourPrimaryColor(primaryFromTheme);
    }
  }, [isMobile]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isMobile) return;
    if (!isFirstAutomation) return;

    const hasSeenTour = window.localStorage.getItem("portyo:automation-builder-tour-done");
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        startTour(automationBuilderSteps);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFirstAutomation, isMobile, startTour]);

  const automationBuilderSteps: DriveStep[] = useMemo(() => [
    {
      element: '[data-tour="automation-builder-header"]',
      popover: { title: t("dashboard.tours.automationBuilder.steps.header"), description: t("dashboard.tours.automationBuilder.steps.header"), side: "bottom", align: "start" },
    },
    {
      element: '[data-tour="automation-builder-canvas"]',
      popover: { title: t("dashboard.tours.automationBuilder.steps.canvas"), description: t("dashboard.tours.automationBuilder.steps.canvas"), side: "top", align: "start" },
    },
    {
      element: '[data-tour="automation-builder-palette"]',
      popover: { title: t("dashboard.tours.automationBuilder.steps.palette"), description: t("dashboard.tours.automationBuilder.steps.palette"), side: "right", align: "start" },
    },
    {
      element: '[data-tour="automation-builder-node"]',
      popover: { title: t("dashboard.tours.automationBuilder.steps.node"), description: t("dashboard.tours.automationBuilder.steps.node"), side: "right", align: "start" },
    },
    {
      element: '[data-tour="automation-builder-actions"]',
      popover: { title: t("dashboard.tours.automationBuilder.steps.actions"), description: t("dashboard.tours.automationBuilder.steps.actions"), side: "bottom", align: "start" },
    },
  ], [t]);


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
      setStatusMessage({ type: 'error', message: t("dashboard.automationBuilder.errors.noBio") });
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
      setStatusMessage({ type: 'success', message: t("dashboard.automationBuilder.messages.saved") });
    } catch (error: any) {
      console.error("Failed to save automation:", error);
      setStatusMessage({ type: 'error', message: error.response?.data?.message || t("dashboard.automationBuilder.errors.save") });
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
        setStatusMessage({ type: 'success', message: t("dashboard.automationBuilder.messages.deactivated") });
      } else {
        updatedAutomation = await activateAutomation(currentAutomation.id);
        setStatusMessage({ type: 'success', message: t("dashboard.automationBuilder.messages.activated") });
      }

      setCurrentAutomation(updatedAutomation);
    } catch (error: any) {
      console.error("Failed to toggle automation:", error);
      setStatusMessage({ type: 'error', message: error.response?.data?.message || t("dashboard.automationBuilder.errors.toggle") });
    } finally {
      setIsActivating(false);
    }
  };

  // Check if a node is connected to a Form Submit trigger
  const isConnectedToFormSubmitTrigger = useCallback((nodeId: string): boolean => {
    const findConnectedTrigger = (currentNodeId: string, visited: Set<string> = new Set()): boolean => {
      if (visited.has(currentNodeId)) return false;
      visited.add(currentNodeId);

      const currentNode = nodes.find(n => n.id === currentNodeId);
      if (!currentNode) return false;

      if (currentNode.type === 'trigger' && currentNode.data.eventType === 'form_submit') {
        return true;
      }

      const incomingEdges = edges.filter(e => e.target === currentNodeId);
      for (const edge of incomingEdges) {
        if (findConnectedTrigger(edge.source, visited)) {
          return true;
        }
      }

      return false;
    };

    return findConnectedTrigger(nodeId);
  }, [nodes, edges]);

  const onConnect = useCallback((params: Connection) => {
    // 1. Validation for Form Submit Trigger (Direct Connection)
    const sourceNode = nodes.find(n => n.id === params.source);
    if (sourceNode?.type === 'trigger' && sourceNode.data.eventType === 'form_submit') {
      const formId = sourceNode.data.elementId;

      if (!formId) {
        setStatusMessage({ type: 'error', message: t("dashboard.automationBuilder.errors.selectFormBeforeConnect") });
        return;
      }

      const selectedForm = forms.find(f => f.id === formId);
      if (!selectedForm) {
        setStatusMessage({ type: 'error', message: "Selected form not found or invalid." });
        return;
      }

      const hasRequiredEmail = selectedForm.fields.some((f: any) =>
        (f.type === 'email' || f.label.toLowerCase().includes('email')) && f.required
      );

      if (!hasRequiredEmail) {
        setStatusMessage({ type: 'error', message: "Selected form must have a REQUIRED email field." });
        return;
      }

      // Validate Target Node Type (Must be 'action' i.e., Email)
      const targetNode = nodes.find(n => n.id === params.target);
      if (targetNode?.type !== 'action') {
        setStatusMessage({ type: 'error', message: "Form Submit triggers can ONLY connect to Email actions." });
        return;
      }

      // Ensure only ONE connection allowed from the trigger
      const existingConnections = edges.filter(e => e.source === sourceNode.id);
      if (existingConnections.length > 0) {
        setStatusMessage({ type: 'error', message: "Form Submit triggers can only have ONE email action." });
        return;
      }
    }

    // 2. Prevent chaining after Email action for Form Submit workflows
    // If the source is an Action (Email) node, check if it's connected to a Form Submit trigger
    if (sourceNode?.type === 'action') {
      if (isConnectedToFormSubmitTrigger(sourceNode.id)) {
        setStatusMessage({ type: 'error', message: "Form Submit automations end after the Email action. No further steps allowed." });
        return;
      }
    }

    setEdges((eds: any) => addEdge(params, eds));
  }, [setEdges, nodes, forms, isConnectedToFormSubmitTrigger, edges]);

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

  // Helper function to check if an action node is connected to a blog_post_published trigger
  const isConnectedToBlogPostTrigger = useCallback((nodeId: string): boolean => {
    // Find the trigger node that this action is connected to (traverse up the edges)
    const findConnectedTrigger = (currentNodeId: string, visited: Set<string> = new Set()): boolean => {
      if (visited.has(currentNodeId)) return false;
      visited.add(currentNodeId);

      const currentNode = nodes.find(n => n.id === currentNodeId);
      if (!currentNode) return false;

      // If this is a trigger node, check if it's a blog_post_published trigger
      if (currentNode.type === 'trigger') {
        return currentNode.data.eventType === 'blog_post_published';
      }

      // Find edges that point to this node (upstream connections)
      const incomingEdges = edges.filter(e => e.target === currentNodeId);
      for (const edge of incomingEdges) {
        if (findConnectedTrigger(edge.source, visited)) {
          return true;
        }
      }

      return false;
    };

    return findConnectedTrigger(nodeId);
  }, [nodes, edges]);

  const showLeadSelectionOptions = selectedNode?.type === 'action' && selectedNode?.id && isConnectedToBlogPostTrigger(selectedNode.id);

  const isConnectedToStripeDiscountNode = useCallback((nodeId: string): boolean => {
    const findConnectedDiscount = (currentNodeId: string, visited: Set<string> = new Set()): boolean => {
      if (visited.has(currentNodeId)) return false;
      visited.add(currentNodeId);

      const currentNode = nodes.find(n => n.id === currentNodeId);
      if (!currentNode) return false;

      if (currentNode.type === 'stripe_discount') {
        return true;
      }

      const incomingEdges = edges.filter(e => e.target === currentNodeId);
      for (const edge of incomingEdges) {
        if (findConnectedDiscount(edge.source, visited)) {
          return true;
        }
      }

      return false;
    };

    return findConnectedDiscount(nodeId);
  }, [nodes, edges]);

  const showLeadSelectionOptionsForAction = selectedNode?.type === 'action' && selectedNode?.id && (showLeadSelectionOptions || isConnectedToStripeDiscountNode(selectedNode.id));

  const applyQuickTemplate = (template: 'welcome' | 'discord' | 'webhook' | 'instagram_auto_reply') => {
    const templates = {
      welcome: {
        name: 'Welcome Subscriber',
        nodes: [
          normalizeNodeData({ id: 't1', type: 'trigger', position: { x: 220, y: 80 }, data: { label: 'New Subscriber', eventType: 'newsletter_subscribe' } }),
          normalizeNodeData({ id: 't2', type: 'action', position: { x: 220, y: 280 }, data: { label: 'Welcome Email', subject: 'Welcome!', content: 'Thanks for subscribing!' } }),
        ],
        edges: [{ id: 'te1-2', source: 't1', target: 't2' }],
      },
      discord: {
        name: 'Discord Alert Flow',
        nodes: [
          normalizeNodeData({ id: 't1', type: 'trigger', position: { x: 220, y: 80 }, data: { label: 'New Subscriber', eventType: 'newsletter_subscribe' } }),
          normalizeNodeData({ id: 't2', type: 'discord', position: { x: 220, y: 280 }, data: { label: 'Discord Alert', discordMessage: 'Novo inscrito: {{email}}' } }),
        ],
        edges: [{ id: 'te1-2', source: 't1', target: 't2' }],
      },
      webhook: {
        name: 'Webhook Bridge',
        nodes: [
          normalizeNodeData({ id: 't1', type: 'trigger', position: { x: 220, y: 80 }, data: { label: 'Link Clicked', eventType: 'link_click' } }),
          normalizeNodeData({ id: 't2', type: 'webhook', position: { x: 220, y: 280 }, data: { label: 'Send Webhook', webhookMethod: 'POST' } }),
        ],
        edges: [{ id: 'te1-2', source: 't1', target: 't2' }],
      },
      instagram_auto_reply: {
        name: 'Instagram Auto Reply',
        nodes: [
          normalizeNodeData({ id: 't1', type: 'trigger', position: { x: 220, y: 80 }, data: { label: 'Webhook Trigger', eventType: 'webhook_received' } }),
          normalizeNodeData({ id: 't2', type: 'instagram', position: { x: 220, y: 280 }, data: { label: 'Reply Comment', actionType: 'reply_comment', message: 'Thanks for your comment! 💜', commentId: '{{commentId}}' } }),
        ],
        edges: [{ id: 'te1-2', source: 't1', target: 't2' }],
      },
    } as const;

    const selectedTemplate = templates[template];
    setAutomationName(selectedTemplate.name);
    setNodes(selectedTemplate.nodes as any);
    setEdges(selectedTemplate.edges as any);
    setSelectedNodeId(null);
    setStatusMessage({ type: 'success', message: 'Template applied. Customize and save.' });
  };

  return (
    <AuthorizationGuard minPlan="standard">
      <div className="h-[calc(100vh-65px)] md:h-screen flex flex-col bg-[#F3F3F1] flex-1 overflow-hidden font-sans">

        {/* Status Message Toast */}
        {statusMessage && (
          <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300 ${statusMessage.type === 'success' ? 'bg-green-500/100 text-white' : 'bg-destructive/100 text-white'
            }`}>
            {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm font-medium">{statusMessage.message}</span>
          </div>
        )}

        {/* Header Bar */}
        <div data-tour="automation-builder-header" className="h-auto md:h-20 bg-white border-b-4 border-black flex flex-col md:flex-row items-stretch md:items-center justify-between px-6 py-4 md:py-0 z-40 relative gap-4 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard/automation")}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border-2 border-black text-black hover:bg-[#C6F035] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all shrink-0"
            >
              <ArrowLeft className="w-5 h-5 stroke-[3px]" />
            </button>
            <div className="w-0.5 h-8 bg-gray-200 hidden md:block"></div>
            <input
              type="text"
              value={automationName}
              onChange={(e) => setAutomationName(e.target.value)}
              className="bg-transparent border-2 border-transparent hover:border-black/20 focus:border-black border-dashed outline-none text-xl font-black text-[#1A1A1A] placeholder:text-gray-300 w-full md:w-80 px-2 py-1 rounded-lg transition-all"
              placeholder={t("dashboard.automationBuilder.namePlaceholder")}
            />
          </div>

          <div data-tour="automation-builder-actions" className="flex items-center justify-end gap-3 px-2 md:px-0">
            {/* Status Indicator */}
            {currentAutomation && (
              <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${currentAutomation.isActive
                ? 'bg-[#C6F035] text-black'
                : 'bg-gray-200 text-gray-500'
                }`}>
                <span className={`w-2 h-2 rounded-full border border-black ${currentAutomation.isActive ? 'bg-black animate-pulse' : 'bg-gray-400'}`}></span>
                {currentAutomation.isActive ? t("dashboard.automationBuilder.status.active") : t("dashboard.automationBuilder.status.draft")}
              </div>
            )}

            <div className="w-0.5 h-8 bg-gray-200 mx-2 hidden md:block"></div>

            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-6 py-2.5 bg-white text-black border-2 border-black rounded-xl text-sm font-black transition-all flex items-center gap-2 disabled:opacity-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 stroke-[3px]" />}
              <span className="hidden sm:inline">{isSaving ? t("dashboard.automationBuilder.saving") : t("dashboard.automationBuilder.saveDraft")}</span>
            </button>

            <button
              onClick={handleActivate}
              disabled={isActivating}
              className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 border-2 border-black hover:-translate-y-0.5 active:translate-y-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 ${currentAutomation?.isActive
                ? 'bg-[#E94E77] text-white hover:bg-[#D43D64]'
                : 'bg-black text-white hover:bg-gray-900'
                }`}
            >
              {isActivating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : currentAutomation?.isActive ? (
                <Pause className="w-4 h-4 stroke-[3px]" />
              ) : (
                <Play className="w-4 h-4 stroke-[3px]" />
              )}
              <span>{isActivating ? t("dashboard.automationBuilder.processing") : currentAutomation?.isActive ? t("dashboard.automationBuilder.deactivate") : t("dashboard.automationBuilder.activate")}</span>
            </button>
          </div>
        </div>

        <div className="px-4 md:px-6 py-3 border-b-2 border-black/10 bg-white/90 flex items-center gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
          <span className="text-[11px] font-black uppercase tracking-wide text-gray-500">Quick start</span>
          <button onClick={() => applyQuickTemplate('welcome')} className="px-3 py-1.5 text-xs font-bold border-2 border-black rounded-lg bg-white hover:bg-[#C6F035] transition-all">Welcome Email</button>
          <button onClick={() => applyQuickTemplate('discord')} className="px-3 py-1.5 text-xs font-bold border-2 border-black rounded-lg bg-white hover:bg-[#C6F035] transition-all">Discord Alert</button>
          <button onClick={() => applyQuickTemplate('webhook')} className="px-3 py-1.5 text-xs font-bold border-2 border-black rounded-lg bg-white hover:bg-[#C6F035] transition-all">Webhook Bridge</button>
          <button onClick={() => applyQuickTemplate('instagram_auto_reply')} className="px-3 py-1.5 text-xs font-bold border-2 border-black rounded-lg bg-white hover:bg-[#C6F035] transition-all">Instagram Auto Reply</button>
          <span className="text-[11px] text-gray-500 ml-1 md:ml-auto">No mobile, toque no ícone para adicionar bloco.</span>
        </div>

        <div data-tour="automation-builder-canvas" className="flex-1 flex overflow-hidden relative" ref={reactFlowWrapper}>
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
              fitViewOptions={{ maxZoom: 0.95, padding: 0.28 }}
              minZoom={0.35}
              maxZoom={1.2}
              className="bg-[#F3F3F1]"
            >
              <Background color="#000000" gap={30} size={1.2} className="opacity-10" />
              <Controls className="!bg-white !border-2 !border-black !shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] !rounded-xl !m-4 !bottom-24 md:!bottom-4" />

              <Panel position="top-right" className="!m-4 z-20 hidden md:block">
                <button
                  onClick={() => reactFlowInstance?.fitView({ padding: 0.28, duration: 300, maxZoom: 0.95 })}
                  className="px-3 py-2 text-xs font-black bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#C6F035] transition-all"
                >
                  Centralizar blocos
                </button>
              </Panel>

              <Panel position="top-left" className="!m-0 !top-auto !bottom-0 !left-0 !right-0 md:!top-4 md:!bottom-auto md:!left-0 md:!right-auto md:!m-4 w-full md:w-auto z-10">
                <div data-tour="automation-builder-palette" className="relative overflow-hidden bg-white border-t-4 md:border-2 border-black md:rounded-[20px] shadow-[0_-2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 md:p-2.5 flex flex-row md:flex-col gap-3 md:gap-1.5 w-full md:w-14 items-center overflow-x-auto md:overflow-x-hidden md:overflow-y-auto md:max-h-[calc(100vh-210px)] no-scrollbar md:[scrollbar-width:none] md:[-ms-overflow-style:none] md:[&::-webkit-scrollbar]:hidden">
                  {[
                    { type: 'trigger', label: t("dashboard.automationBuilder.palette.trigger"), icon: Zap, color: 'text-amber-600 bg-amber-50' },
                    { type: 'action', label: t("dashboard.automationBuilder.palette.email"), icon: Mail, color: 'text-blue-500 bg-blue-50' },
                    { type: 'instagram', label: t("dashboard.automationBuilder.palette.instagram"), icon: Instagram, color: 'text-pink-600 bg-pink-50' },
                    { type: 'youtube', label: t("dashboard.automationBuilder.palette.youtube"), icon: Youtube, color: 'text-red-600 bg-red-50' },
                    { type: 'delay', label: t("dashboard.automationBuilder.palette.delay"), icon: Clock, color: 'text-purple-600 bg-purple-50' },
                    { type: 'condition', label: t("dashboard.automationBuilder.palette.condition"), icon: Settings, color: 'text-gray-600 bg-gray-100' },
                    { type: 'integration', label: t("dashboard.automationBuilder.palette.integration"), icon: Share2, color: 'text-indigo-500 bg-indigo-50' },
                    { type: 'page_event', label: t("dashboard.automationBuilder.palette.pageEvent"), icon: Layout, color: 'text-teal-600 bg-teal-50' },
                    { type: 'update_element', label: t("dashboard.automationBuilder.palette.updateElement"), icon: Edit, color: 'text-orange-600 bg-orange-50' },
                    { type: 'math_operation', label: t("dashboard.automationBuilder.palette.math"), icon: Calculator, color: 'text-indigo-600 bg-indigo-50' },
                    { type: 'webhook', label: 'Webhook', icon: Globe, color: 'text-violet-600 bg-violet-50' },
                    { type: 'discord', label: 'Discord', icon: MessageSquare, color: 'text-indigo-600 bg-indigo-50' },
                    { type: 'stripe_discount', label: t("dashboard.automationBuilder.palette.stripeDiscount"), icon: BadgePercent, color: 'text-emerald-600 bg-emerald-50' },
                  ].map((item) => (
                    <div
                      key={item.type}
                      className={`w-12 h-12 md:w-9 md:h-9 rounded-xl border-2 border-transparent hover:border-black hover:bg-[#d2e823]/20 flex items-center justify-center transition-all cursor-grab active:cursor-grabbing relative group shrink-0 ${item.color}`}
                      onDragStart={(event) => {
                        event.dataTransfer.setData('application/reactflow', item.type);
                        event.dataTransfer.setData('application/label', item.label);
                        event.dataTransfer.effectAllowed = 'move';
                      }}
                      draggable
                      title={t("dashboard.automationBuilder.addStep", { label: item.label })}
                      onClick={() => {
                        // For touch devices where drag might be tricky, add to center of view
                        if (window.innerWidth < 768) {
                          const center = reactFlowInstance.project({
                            x: window.innerWidth / 2,
                            y: window.innerHeight / 2
                          });
                          const newNode: Node = {
                            id: Math.random().toString(36).substr(2, 9),
                            type: item.type,
                            position: center,
                            data: { label: item.label },
                          };
                          setNodes((nds: any) => nds.concat(newNode));
                        }
                      }}
                    >
                      <item.icon className="w-6 h-6 md:w-5 md:h-5 stroke-[2px]" />
                      <span className="hidden md:block absolute left-full ml-3 px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
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
            <div className="absolute inset-0 md:inset-auto md:right-0 md:top-0 md:bottom-0 w-full md:w-[360px] bg-white border-l-4 border-black shadow-[-4px_0px_20px_0px_rgba(0,0,0,0.1)] flex flex-col z-50 animate-in slide-in-from-right duration-300">
              {/* Header */}
              <div className="p-6 border-b-4 border-black flex items-center justify-between bg-gray-50">
                <h2 className="font-black text-xl text-[#1A1A1A] uppercase tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>{t("dashboard.automationBuilder.config.title")}</h2>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-all"
                >
                  <X className="w-5 h-5 stroke-[3px]" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar pb-24 md:pb-6">

                {/* Common: Label */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("dashboard.automationBuilder.config.stepName")}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    value={selectedNode.data.label}
                    onChange={(e) => updateNodeData('label', e.target.value)}
                  />
                </div>

                {/* Trigger Configuration */}
                {(selectedNode as any).type === 'trigger' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("dashboard.automationBuilder.trigger.eventType")}</label>
                      <div className="relative">
                        <select
                          className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer"
                          value={selectedNode.data.eventType || 'newsletter_subscribe'}
                          onChange={(e) => updateNodeData('eventType', e.target.value)}
                        >
                          <optgroup label={t("dashboard.automationBuilder.trigger.groups.appointments")}>
                            <option value="booking_created">{t("dashboard.automationBuilder.trigger.events.bookingCreated")}</option>
                          </optgroup>
                          <optgroup label={t("dashboard.automationBuilder.trigger.groups.pageEvents")}>
                            <option value="bio_visit">{t("dashboard.automationBuilder.trigger.events.bioVisit")}</option>
                            <option value="qr_scanned">{t("dashboard.automationBuilder.trigger.events.qrScanned")}</option>
                            <option value="visit_milestone">{t("dashboard.automationBuilder.trigger.events.visitMilestone")}</option>
                            <option value="view_milestone">{t("dashboard.automationBuilder.trigger.events.viewMilestone")}</option>
                            <option value="click_milestone">{t("dashboard.automationBuilder.trigger.events.clickMilestone")}</option>
                            <option value="link_click">{t("dashboard.automationBuilder.trigger.events.linkClick")}</option>
                          </optgroup>
                          <optgroup label={t("dashboard.automationBuilder.trigger.groups.subscriberEvents")}>
                            <option value="newsletter_subscribe">{t("dashboard.automationBuilder.trigger.events.newsletterSubscribe")}</option>
                            <option value="subscriber_unsubscribe">{t("dashboard.automationBuilder.trigger.events.subscriberUnsubscribe")}</option>
                            <option value="lead_milestone">{t("dashboard.automationBuilder.trigger.events.leadMilestone")}</option>
                          </optgroup>
                          <optgroup label={t("dashboard.automationBuilder.trigger.groups.content")}>
                            <option value="form_submit">{t("dashboard.automationBuilder.trigger.events.formSubmit")}</option>
                            <option value="form_submit_milestone">{t("dashboard.automationBuilder.trigger.events.formSubmitMilestone")}</option>
                            <option value="blog_post_published">{t("dashboard.automationBuilder.trigger.events.blogPostPublished")}</option>
                          </optgroup>
                          <optgroup label={t("dashboard.automationBuilder.trigger.groups.other")}>
                            <option value="webhook_received">{t("dashboard.automationBuilder.trigger.events.webhookReceived")}</option>
                            <option value="custom_event">{t("dashboard.automationBuilder.trigger.events.customEvent")}</option>
                          </optgroup>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                          <Settings className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Trigger Configuration Extras */}
                    {/* Milestone Selector */}
                    {['visit_milestone', 'view_milestone', 'click_milestone', 'form_submit_milestone', 'lead_milestone'].includes(selectedNode.data.eventType) && (
                      <div className="space-y-2 p-4 bg-amber-50 rounded-xl border border-amber-500/30/50">
                        <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                          {selectedNode.data.eventType === 'click_milestone'
                            ? t("dashboard.automationBuilder.trigger.milestone.clicks")
                            : selectedNode.data.eventType === 'form_submit_milestone'
                              ? t("dashboard.automationBuilder.trigger.milestone.formSubmissions")
                              : selectedNode.data.eventType === 'lead_milestone'
                                ? t("dashboard.automationBuilder.trigger.milestone.leads")
                                : t("dashboard.automationBuilder.trigger.milestone.views")}
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-4 py-2 bg-surface-card border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                          value={selectedNode.data.milestoneCount || 100}
                          onChange={(e) => updateNodeData('milestoneCount', parseInt(e.target.value) || 1)}
                          placeholder={t("dashboard.automationBuilder.trigger.milestone.placeholder")}
                        />
                        <p className="text-[11px] text-amber-700/80">{t("dashboard.automationBuilder.trigger.milestone.hint")}</p>
                      </div>
                    )}

                    {/* Form Selector (Existing) */}
                    {selectedNode.data.eventType === 'form_submit' && (
                      <div className="space-y-2 p-4 bg-orange-50 rounded-xl border border-orange-500/30/50">
                        <label className="block text-xs font-bold text-orange-400 uppercase tracking-wider">{t("dashboard.automationBuilder.trigger.selectForm")}</label>
                        <select
                          className="w-full px-4 py-2 bg-surface-card border border-orange-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                          value={selectedNode.data.elementId || ''}
                          onChange={(e) => updateNodeData('elementId', e.target.value)}
                        >
                          <option value="">{t("dashboard.automationBuilder.trigger.selectFormPlaceholder")}</option>
                          {forms
                            .filter(f => f.fields.some((field: any) => (field.type === 'email' || field.label.toLowerCase().includes('email')) && field.required))
                            .map(f => (
                              <option key={f.id} value={f.id}>{f.title}</option>
                            ))}
                        </select>
                        <p className="text-xs text-orange-600">
                          {t("dashboard.automationBuilder.trigger.selectFormHint")}
                        </p>

                        {/* Warnings for problematic forms */}
                        {forms.length > 0 && (
                          <>
                            {forms.filter(f => f.fields.some((field: any) => (field.type === 'email' || field.label.toLowerCase().includes('email')) && field.required)).length === 0 && (
                              <p className="text-xs text-red-500 font-bold mt-1">
                                {t("dashboard.automationBuilder.trigger.noCompatibleForms")}
                              </p>
                            )}

                            {forms.filter(f => f.fields.some((field: any) => (field.type === 'email' || field.label.toLowerCase().includes('email')) && !field.required)).length > 0 && (
                              <div className="mt-2 p-2 bg-destructive/10 rounded border border-red-100">
                                <p className="text-xs text-destructive font-semibold mb-1">
                                  {t("dashboard.automationBuilder.trigger.formsMissingRequired")}
                                </p>
                                <ul className="list-disc list-inside text-[10px] text-red-500">
                                  {forms
                                    .filter(f => f.fields.some((field: any) => (field.type === 'email' || field.label.toLowerCase().includes('email')) && !field.required))
                                    .map(f => (
                                      <li key={f.id}>{t("dashboard.automationBuilder.trigger.missingRequiredItem", { title: f.title })}</li>
                                    ))}
                                </ul>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {/* Action Configuration */}
                {(selectedNode as any).type === 'action' && (
                  <div className="space-y-4">
                    {/* Only show template selector for PRO users */}
                    {user?.plan === 'pro' && templates.length > 0 && (
                      <div className="space-y-4 mb-6 p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30/50">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                            <Mail className="w-3 h-3 text-white" />
                          </div>
                          <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider">{t("dashboard.automationBuilder.action.loadTemplate")}</label>
                        </div>
                        <select
                          className="w-full px-4 py-2 bg-surface-card border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
                          onChange={(e) => {
                            const template = templates.find(t => t.id === e.target.value);
                            if (template && template.html) {
                              if (confirm(t("dashboard.automationBuilder.action.confirmOverwrite"))) {
                                updateNodeData('content', template.html);
                              }
                            }
                          }}
                          value=""
                        >
                          <option value="">{t("dashboard.automationBuilder.action.selectTemplate")}</option>
                          {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("dashboard.automationBuilder.action.emailSubject")}</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        placeholder={t("dashboard.automationBuilder.action.subjectPlaceholder")}
                        value={selectedNode.data.subject || ''}
                        onChange={(e) => updateNodeData('subject', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("dashboard.automationBuilder.action.emailContent")}</label>
                      <textarea
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] min-h-[120px] resize-y"
                        placeholder={t("dashboard.automationBuilder.action.contentPlaceholder")}
                        value={selectedNode.data.content || ''}
                        onChange={(e) => updateNodeData('content', e.target.value)}
                      ></textarea>
                    </div>

                    {/* Lead Selection Options - Only for Blog Post Trigger */}
                    {showLeadSelectionOptionsForAction && (
                      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-200/50 rounded-xl p-4 space-y-4">
                        <div className="flex items-center gap-2 text-green-700">
                          <Mail className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">{t("dashboard.automationBuilder.action.leadRecipients.title")}</span>
                        </div>
                        <p className="text-xs text-green-400">
                          {t("dashboard.automationBuilder.action.leadRecipients.subtitle")}
                        </p>

                        <div className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="radio"
                              name="leadSelection"
                              checked={selectedNode.data.sendToAllLeads !== false}
                              onChange={() => {
                                updateNodeData('sendToAllLeads', true);
                                updateNodeData('leadCount', null);
                              }}
                              className="w-4 h-4 text-green-400 focus:ring-green-500"
                            />
                            <span className="text-sm font-medium text-foreground group-hover:text-green-700 transition-colors">
                              {t("dashboard.automationBuilder.action.leadRecipients.sendAll")}
                            </span>
                          </label>

                          <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                              type="radio"
                              name="leadSelection"
                              checked={selectedNode.data.sendToAllLeads === false}
                              onChange={() => {
                                updateNodeData('sendToAllLeads', false);
                                if (!selectedNode.data.leadCount) {
                                  updateNodeData('leadCount', 10);
                                }
                              }}
                              className="w-4 h-4 text-green-400 focus:ring-green-500 mt-0.5"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-foreground group-hover:text-green-700 transition-colors">
                                {t("dashboard.automationBuilder.action.leadRecipients.sendSpecific")}
                              </span>
                              {selectedNode.data.sendToAllLeads === false && (
                                <div className="mt-2 flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="1"
                                    max="10000"
                                    className="w-24 px-3 py-2 bg-surface-card border border-green-200 rounded-lg text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400"
                                    value={selectedNode.data.leadCount || 10}
                                    onChange={(e) => updateNodeData('leadCount', parseInt(e.target.value) || 10)}
                                  />
                                  <span className="text-xs text-muted-foreground">{t("dashboard.automationBuilder.action.leadRecipients.leads")}</span>
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Template Variables Documentation */}
                    <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30/50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-blue-400">
                        <Code className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">{t("dashboard.automationBuilder.action.variables.title")}</span>
                      </div>
                      <p className="text-xs text-blue-400">{t("dashboard.automationBuilder.action.variables.subtitle")}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1">
                          <p className="font-semibold text-white/70">{t("dashboard.automationBuilder.action.variables.subscriber")}</p>
                          <code className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{email}}"}</code>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-white/70">{t("dashboard.automationBuilder.action.variables.bio")}</p>
                          <code className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{bioName}}"}</code>
                          <code className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{bioUrl}}"}</code>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-white/70">{t("dashboard.automationBuilder.action.variables.owner")}</p>
                          <code className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{ownerName}}"}</code>
                          <code className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{ownerFirstName}}"}</code>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-white/70">{t("dashboard.automationBuilder.action.variables.dateTime")}</p>
                          <code className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{currentDate}}"}</code>
                          <code className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{currentYear}}"}</code>
                        </div>
                        {showLeadSelectionOptions && (
                          <div className="space-y-1">
                            <p className="font-semibold text-white/70">{t("dashboard.automationBuilder.action.variables.blogPost")}</p>
                            <code className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{postTitle}}"}</code>
                            <code className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{postUrl}}"}</code>
                          </div>
                        )}

                        <div className="space-y-1">
                          <p className="font-semibold text-white/70">{t("dashboard.automationBuilder.action.variables.analytics")}</p>
                          <code className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{milestoneCount}}"}</code>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-white/70">{t("dashboard.automationBuilder.action.variables.stripe")}</p>
                          <code className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{stripePromotionCode}}"}</code>
                          <code className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{stripeDiscountPercent}}"}</code>
                          <code className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{stripeDiscountAmount}}"}</code>
                          <code className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{stripeDiscountCurrency}}"}</code>
                          <code className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{stripeDiscountExpiresAt}}"}</code>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-white/70">{t("dashboard.automationBuilder.action.variables.appointments")}</p>
                          <code className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{bookingDate}}"}</code>
                          <code className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{customerName}}"}</code>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-white/70">{t("dashboard.automationBuilder.action.variables.qrCode")}</p>
                          <code className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{qrValue}}"}</code>
                          <code className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{country}}"}</code>
                        </div>

                        {/* Form Variables - Show when connected to Form Trigger */}
                        {(() => {
                          const triggerNode = nodes.find(n => n.type === 'trigger' && n.data.eventType === 'form_submit');
                          const formId = triggerNode?.data.elementId;
                          const form = forms.find(f => f.id === formId);

                          if (form) {
                            return (
                              <div className="space-y-1 col-span-2 mt-2 pt-2 border-t border-blue-200">
                                <p className="font-semibold text-white/70">{t("dashboard.automationBuilder.action.variables.form", { title: form.title })}</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {form.fields.map((field: any) => {
                                    const safeLabel = field.label.replace(/[^a-zA-Z0-9]/g, '_');
                                    return (
                                      <code key={field.id} className="block text-blue-400 bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{" + safeLabel + "}}"}</code>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}

                      </div>
                      <details className="text-xs">
                        <summary className="text-blue-400 cursor-pointer hover:text-blue-800 font-medium">{t("dashboard.automationBuilder.action.variables.more")}</summary>
                        <div className="mt-2 grid grid-cols-2 gap-1 text-blue-400">
                          <code className="bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{bioDescription}}"}</code>
                          <code className="bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{bioViews}}"}</code>
                          <code className="bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{bioClicks}}"}</code>
                          <code className="bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{instagram}}"}</code>
                          <code className="bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{twitter}}"}</code>
                          <code className="bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{youtube}}"}</code>
                          <code className="bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{linkedin}}"}</code>
                          <code className="bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{website}}"}</code>
                          <code className="bg-surface-card/60 px-1.5 py-0.5 rounded">{"{{currentTime}}"}</code>
                        </div>
                      </details>
                    </div>
                  </div>
                )}

                {/* Stripe Discount Configuration */}
                {(selectedNode as any).type === 'stripe_discount' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Discount Type</label>
                      <select
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer"
                        value={selectedNode.data.discountType || 'percent'}
                        onChange={(e) => updateNodeData('discountType', e.target.value)}
                      >
                        <option value="percent">Percent (%)</option>
                        <option value="amount">Fixed Amount</option>
                      </select>
                    </div>

                    {selectedNode.data.discountType !== 'amount' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Percent Off</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all shadow-sm"
                          value={selectedNode.data.percentOff || 10}
                          onChange={(e) => updateNodeData('percentOff', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    )}

                    {selectedNode.data.discountType === 'amount' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount Off</label>
                          <input
                            type="number"
                            min="1"
                            className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all shadow-sm"
                            value={selectedNode.data.amountOff || 10}
                            onChange={(e) => updateNodeData('amountOff', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Currency</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all shadow-sm uppercase"
                            value={selectedNode.data.currency || 'usd'}
                            onChange={(e) => updateNodeData('currency', e.target.value.toLowerCase())}
                            placeholder="usd"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Duration</label>
                        <select
                          className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer"
                          value={selectedNode.data.durationType || 'once'}
                          onChange={(e) => updateNodeData('durationType', e.target.value)}
                        >
                          <option value="once">Once</option>
                          <option value="repeating">Repeating</option>
                          <option value="forever">Forever</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Repeat (Months)</label>
                        <input
                          type="number"
                          min="1"
                          disabled={(selectedNode.data.durationType || 'once') !== 'repeating'}
                          className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all shadow-sm disabled:opacity-60"
                          value={selectedNode.data.durationInMonths || 3}
                          onChange={(e) => updateNodeData('durationInMonths', parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Max Redemptions</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all shadow-sm"
                          value={selectedNode.data.maxRedemptions || ''}
                          onChange={(e) => updateNodeData('maxRedemptions', e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Code Prefix</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all shadow-sm uppercase"
                          value={selectedNode.data.promotionCodePrefix || 'PORTYO'}
                          onChange={(e) => updateNodeData('promotionCodePrefix', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Expires In</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all shadow-sm"
                          value={selectedNode.data.expiresInValue || ''}
                          onChange={(e) => updateNodeData('expiresInValue', e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Unit</label>
                        <select
                          className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer"
                          value={selectedNode.data.expiresInUnit || 'days'}
                          onChange={(e) => updateNodeData('expiresInUnit', e.target.value)}
                        >
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-500/30/60 rounded-xl p-4 text-xs text-emerald-400">
                      Use <strong>{"{{stripePromotionCode}}"}</strong> in Email content to send the discount code automatically.
                    </div>
                  </div>
                )}

                {/* Delay Configuration */}
                {(selectedNode as any).type === 'delay' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Duration</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all shadow-sm"
                        defaultValue="1"
                        value={selectedNode.data.duration || '1'}
                        onChange={(e) => updateNodeData('duration', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Unit</label>
                      <select
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer"
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
                {(selectedNode as any).type === 'condition' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Condition Type</label>
                      <select
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer"
                        value={selectedNode.data.conditionType || 'tag'}
                        onChange={(e) => updateNodeData('conditionType', e.target.value)}
                      >
                        <option value="tag">Has Tag</option>
                        <option value="element_property">Element Property</option>
                      </select>
                    </div>

                    {selectedNode.data.conditionType === 'element_property' && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Element</label>
                          <select
                            className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer"
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
                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Property</label>
                          <select
                            className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer"
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
                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Operator</label>
                          <select
                            className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer"
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
                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Value</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            placeholder="Value to check..."
                            value={selectedNode.data.value || ''}
                            onChange={(e) => updateNodeData('value', e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {(!selectedNode.data.conditionType || selectedNode.data.conditionType === 'tag') && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Tag Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          placeholder="e.g. VIP"
                          value={selectedNode.data.tagName || ''}
                          onChange={(e) => updateNodeData('tagName', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Instagram Configuration */}
                {(selectedNode as any).type === 'instagram' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Action Type</label>
                      <select
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer"
                        value={selectedNode.data.actionType || 'send_dm'}
                        onChange={(e) => updateNodeData('actionType', e.target.value)}
                      >
                        <option value="send_dm">Send DM</option>
                        <option value="reply_comment">Reply to Comment</option>
                        <option value="post_story">Post Story</option>
                      </select>
                    </div>

                    {selectedNode.data.actionType === 'reply_comment' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Comment ID</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          placeholder="{{commentId}}"
                          value={selectedNode.data.commentId || ''}
                          onChange={(e) => updateNodeData('commentId', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Use <strong>{'{{commentId}}'}</strong> quando vier do webhook.</p>
                      </div>
                    )}

                    {selectedNode.data.actionType === 'send_dm' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Recipient ID</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          placeholder="{{recipientId}}"
                          value={selectedNode.data.recipientId || ''}
                          onChange={(e) => updateNodeData('recipientId', e.target.value)}
                        />
                      </div>
                    )}

                    {selectedNode.data.actionType === 'post_story' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Image URL</label>
                        <input
                          type="url"
                          className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          placeholder="https://..."
                          value={selectedNode.data.imageUrl || ''}
                          onChange={(e) => updateNodeData('imageUrl', e.target.value)}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Message</label>
                      <textarea
                        className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all shadow-sm min-h-[100px] resize-y"
                        placeholder="Enter message..."
                        value={selectedNode.data.message || ''}
                        onChange={(e) => updateNodeData('message', e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* YouTube Configuration */}
                {(selectedNode as any).type === 'youtube' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Action Type</label>
                      <select
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer"
                        value={selectedNode.data.actionType || 'reply_comment'}
                        onChange={(e) => updateNodeData('actionType', e.target.value)}
                      >
                        <option value="reply_comment">Reply to Comment</option>
                        <option value="pin_comment">Pin Comment</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Comment Text</label>
                      <textarea
                        className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all shadow-sm min-h-[100px] resize-y"
                        placeholder="Enter comment..."
                        value={selectedNode.data.comment || ''}
                        onChange={(e) => updateNodeData('comment', e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* Integration Configuration */}
                {(selectedNode as any).type === 'integration' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Platform</label>
                      <select
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer"
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
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Connection</label>
                      <div className="p-3 bg-muted border border-border rounded-xl text-sm text-muted-foreground flex items-center justify-between">
                        <span>No account connected</span>
                        <button className="text-primary font-bold text-xs hover:underline">Connect</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Page Event Configuration */}
                {(selectedNode as any).type === 'page_event' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Event Type</label>
                      <select
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer"
                        value={selectedNode.data.eventType || 'page_load'}
                        onChange={(e) => updateNodeData('eventType', e.target.value)}
                      >
                        <option value="page_load">Page Load</option>
                        <option value="scroll_percentage">Scroll Percentage</option>
                        <option value="exit_intent">Exit Intent</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Update Element Configuration */}
                {(selectedNode as any).type === 'update_element' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Element</label>
                      <select
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer"
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
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Property to Update</label>
                      <select
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer"
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
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">New Value</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="Enter new value..."
                        value={selectedNode.data.value || ''}
                        onChange={(e) => updateNodeData('value', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* SMS Configuration */}
                {(selectedNode as any).type === 'sms' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="+55 11 99999-9999 or {{phone}}"
                        value={selectedNode.data.phone || ''}
                        onChange={(e) => updateNodeData('phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Message</label>
                      <textarea
                        className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all shadow-sm min-h-[100px] resize-y"
                        placeholder="Hi {{ownerFirstName}}! Thanks for subscribing..."
                        value={selectedNode.data.message || ''}
                        onChange={(e) => updateNodeData('message', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Max 160 characters for SMS. Use template variables.</p>
                    </div>
                  </div>
                )}

                {/* Webhook Configuration */}
                {(selectedNode as any).type === 'webhook' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Method</label>
                      <select
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer"
                        value={selectedNode.data.webhookMethod || selectedNode.data.method || 'POST'}
                        onChange={(e) => updateNodeData('webhookMethod', e.target.value)}
                      >
                        <option value="POST">POST</option>
                        <option value="GET">GET</option>
                        <option value="PUT">PUT</option>
                        <option value="PATCH">PATCH</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">URL</label>
                      <input
                        type="url"
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="https://api.example.com/webhook"
                        value={selectedNode.data.webhookUrl || ''}
                        onChange={(e) => updateNodeData('webhookUrl', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Headers (JSON)</label>
                      <textarea
                        className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all shadow-sm min-h-[60px] resize-y font-mono text-xs"
                        placeholder='{"Authorization": "Bearer token"}'
                        value={selectedNode.data.webhookHeaders || selectedNode.data.headers || ''}
                        onChange={(e) => updateNodeData('webhookHeaders', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Body (JSON or text)</label>
                      <textarea
                        className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all shadow-sm min-h-[80px] resize-y font-mono text-xs"
                        placeholder='{"email":"{{email}}","event":"{{triggerType}}"}'
                        value={selectedNode.data.webhookBody || ''}
                        onChange={(e) => updateNodeData('webhookBody', e.target.value)}
                      />
                    </div>
                    <div className="bg-primary/20 border border-primary/30 rounded-xl p-3">
                      <p className="text-xs text-violet-400">📤 All context data will be sent in the request body as JSON.</p>
                    </div>
                  </div>
                )}

                {(selectedNode as any).type === 'discord' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Discord Webhook URL</label>
                      <input
                        type="url"
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="https://discord.com/api/webhooks/..."
                        value={selectedNode.data.discordWebhookUrl || ''}
                        onChange={(e) => updateNodeData('discordWebhookUrl', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Message</label>
                      <textarea
                        className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all shadow-sm min-h-[90px] resize-y"
                        placeholder="Novo lead: {{email}}"
                        value={selectedNode.data.discordMessage || ''}
                        onChange={(e) => updateNodeData('discordMessage', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Você pode usar variáveis como {'{{email}}'}, {'{{bioName}}'} e {'{{triggerType}}'}.</p>
                    </div>
                  </div>
                )}

                {/* Tag Configuration */}
                {(selectedNode as any).type === 'tag' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Action</label>
                      <select
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer"
                        value={selectedNode.data.tagAction || 'add'}
                        onChange={(e) => updateNodeData('tagAction', e.target.value)}
                      >
                        <option value="add">Add Tag</option>
                        <option value="remove">Remove Tag</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Tag Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="e.g. VIP, Newsletter, Engaged"
                        value={selectedNode.data.tagName || ''}
                        onChange={(e) => updateNodeData('tagName', e.target.value)}
                      />
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200/50 rounded-xl p-3">
                      <p className="text-xs text-emerald-700">🏷️ Tags help segment your subscribers for targeted automations.</p>
                    </div>
                  </div>
                )}

                {/* Split Test Configuration */}
                {(selectedNode as any).type === 'split_test' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Split Ratio</label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground mb-1 block">Path A</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all shadow-sm"
                            value={selectedNode.data.splitA || '50'}
                            onChange={(e) => updateNodeData('splitA', e.target.value)}
                          />
                        </div>
                        <span className="text-muted-foreground font-bold mt-6">:</span>
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground mb-1 block">Path B</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all shadow-sm"
                            value={selectedNode.data.splitB || '50'}
                            onChange={(e) => updateNodeData('splitB', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="bg-cyan-50 border border-cyan-500/30/50 rounded-xl p-3">
                      <p className="text-xs text-cyan-400">🔀 Connect two different paths from this node. Traffic will be randomly split.</p>
                    </div>
                  </div>
                )}

                {/* Notification Configuration */}
                {(selectedNode as any).type === 'notification' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Notification Type</label>
                      <select
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer"
                        value={selectedNode.data.notifyType || 'owner'}
                        onChange={(e) => updateNodeData('notifyType', e.target.value)}
                      >
                        <option value="owner">Notify Me (Owner)</option>
                        <option value="email">Email Alert</option>
                        <option value="slack">Slack Message</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Title</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="New subscriber!"
                        value={selectedNode.data.notifyTitle || ''}
                        onChange={(e) => updateNodeData('notifyTitle', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Message</label>
                      <textarea
                        className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all shadow-sm min-h-[80px] resize-y"
                        placeholder="{{email}} subscribed to your newsletter!"
                        value={selectedNode.data.notifyMessage || ''}
                        onChange={(e) => updateNodeData('notifyMessage', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Math Configuration */}
                {(selectedNode as any).type === 'math_operation' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Operator</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { op: '+', label: 'Add' },
                          { op: '-', label: 'Sub' },
                          { op: '*', label: 'Mult' },
                          { op: '/', label: 'Div' }
                        ].map(({ op, label }) => (
                          <button
                            key={op}
                            onClick={() => updateNodeData('mathOperator', op)}
                            className={`py-3 rounded-xl border text-sm font-bold transition-all ${selectedNode.data.mathOperator === op
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                              : 'bg-surface-card border-border text-muted-foreground hover:border-indigo-500/30 hover:bg-indigo-500/20'
                              }`}
                          >
                            {op}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 p-4 bg-muted rounded-xl border border-border">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Value 1</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-500/50"
                          placeholder="Number or {{Var}}"
                          value={selectedNode.data.operand1 || ''}
                          onChange={(e) => updateNodeData('operand1', e.target.value)}
                        />
                      </div>

                      <div className="flex justify-center">
                        <div className="w-8 h-8 rounded-full bg-surface-card border border-border flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                          {selectedNode.data.mathOperator || '+'}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Value 2</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"
                          placeholder="Number or {{Var}}"
                          value={selectedNode.data.operand2 || ''}
                          onChange={(e) => updateNodeData('operand2', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Save Result As</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs">{"{{"}</div>
                        <input
                          type="text"
                          className="w-full pl-8 pr-8 py-3 bg-surface-card border border-border rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"
                          placeholder="result_name"
                          value={selectedNode.data.resultVarName || ''}
                          onChange={(e) => updateNodeData('resultVarName', e.target.value)}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs">{"}}"}</div>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">You can use this name in following steps like {"{{result_name}}"}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t-4 border-black bg-gray-50 flex gap-4">
                <button
                  onClick={() => {
                    if (selectedNodeId) {
                      setNodes((nds: any) => nds.filter((n: any) => n.id !== selectedNodeId));
                      setEdges((eds: any) => eds.filter((edge: any) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
                      setSelectedNodeId(null);
                    }
                  }}
                  className="px-4 py-3.5 bg-white border-2 border-black text-[#E94E77] hover:bg-red-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl font-bold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  title="Delete Step"
                >
                  <Trash2 className="w-5 h-5 stroke-[2.5px]" />
                </button>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="flex-1 py-3.5 bg-[#C6F035] border-2 border-black text-black hover:bg-[#d0f550] rounded-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:-translate-y-0.5"
                >
                  APPLY CHANGES
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthorizationGuard >
  );
}
