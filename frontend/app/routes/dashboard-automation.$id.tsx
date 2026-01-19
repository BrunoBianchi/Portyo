import { useState, useCallback, useRef, useEffect, useContext } from 'react';
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
import Joyride, { ACTIONS, EVENTS, STATUS, type CallBackProps, type Step } from "react-joyride";
import { useJoyrideSettings } from "~/utils/joyride";

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
  trigger: { title: "Trigger", icon: Zap, color: "bg-amber-500" },
  action: { title: "Email", icon: Mail, color: "bg-blue-500" },
  condition: { title: "Condition", icon: GitBranch, color: "bg-orange-500" },
  delay: { title: "Delay", icon: Clock, color: "bg-purple-500" },
  instagram: { title: "Instagram", icon: Instagram, color: "bg-pink-600" },
  youtube: { title: "YouTube", icon: Youtube, color: "bg-red-600" },
  integration: { title: "Integration", icon: Share2, color: "bg-indigo-500" },
  page_event: { title: "Page Event", icon: Layout, color: "bg-teal-500" },
  update_element: { title: "Update Element", icon: Edit, color: "bg-amber-500" },
  sms: { title: "SMS", icon: Mail, color: "bg-green-500" },
  webhook: { title: "Webhook", icon: Globe, color: "bg-violet-600" },
  tag: { title: "Add Tag", icon: CheckCircle, color: "bg-emerald-500" },
  split_test: { title: "A/B Split", icon: Settings, color: "bg-cyan-500" },
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
    <div data-tour="automation-builder-node" className={`w-[280px] bg-white rounded-2xl shadow-sm border transition-all duration-200 group relative
      ${selected
        ? 'border-primary ring-2 ring-primary/20 shadow-lg'
        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }
    `}>
      {/* Input Handle (Top) */}
      {type !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-4 !h-4 !bg-white !border-[3px] !border-gray-300 !-top-2 hover:!border-primary transition-colors"
        />
      )}

      {/* Main Content */}
      <div className="p-4 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 truncate leading-tight mb-0.5">{data.label || config.title}</h3>
          <p className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">{config.title}</p>
        </div>

        <button
          onClick={onDelete}
          className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-50 rounded-lg"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mx-4" />

      {/* Node Details / Preview */}
      <div className="p-3 px-4 text-[11px] text-gray-500 min-h-[44px] flex items-center">
        {type === 'trigger' && (
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Event: <span className="font-semibold text-gray-700">{data.eventType || 'Select event...'}</span></span>
          </div>
        )}
        {type === 'action' && (
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <span className="font-semibold text-gray-700 truncate">{data.subject || 'No subject'}</span>
            <span className="truncate opacity-75">{data.content || 'No content...'}</span>
          </div>
        )}
        {type === 'condition' && (
          <div className="flex items-center gap-1.5 overflow-hidden">
            <GitBranch className="w-3.5 h-3.5 text-orange-400" />
            <span className="truncate italic">
              {data.conditionKey ? `${data.conditionKey} ${data.conditionOperator} ${data.conditionValue}` : 'Configure branching...'}
            </span>
          </div>
        )}
        {type === 'wait' && (
          <div className="flex items-center gap-2">
            <Timer className="w-3.5 h-3.5 text-blue-400" />
            <span>Delay: <span className="font-semibold text-gray-700">{data.waitDuration || 1} {data.waitUnit || 'minutes'}</span></span>
          </div>
        )}
        {type === 'webhook' && (
          <div className="flex items-center gap-2 overflow-hidden">
            <Globe className="w-3.5 h-3.5 text-violet-400" />
            <span className="truncate font-mono">{data.webhookUrl || 'Enter URL...'}</span>
          </div>
        )}
        {type === 'discord' && (
          <div className="flex items-center gap-2 overflow-hidden">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate italic">{data.discordMessage || 'Alert message...'}</span>
          </div>
        )}
        {type === 'math_operation' && (
          <div className="flex items-center gap-1.5 font-mono">
            <Calculator className="w-3.5 h-3.5 text-indigo-400" />
            <span>{data.operand1 || '?'} {data.mathOperator || '+'} {data.operand2 || '?'} = {'{{'}{data.resultVarName || 'res'}{'}}'}</span>
          </div>
        )}
        {type === 'stripe_discount' && (
          <div className="flex items-center gap-2">
            <BadgePercent className="w-3.5 h-3.5 text-emerald-500" />
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
            className="!w-4 !h-4 !bg-white !border-[3px] !border-green-500 !-bottom-2 hover:!border-green-600 transition-colors"
          />
          <div className="absolute -bottom-6 left-1/4 -translate-x-1/2 text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 flex items-center gap-1">
            <CheckCircle className="w-2.5 h-2.5" /> TRUE
          </div>

          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            style={{ left: '70%' }}
            className="!w-4 !h-4 !bg-white !border-[3px] !border-red-500 !-bottom-2 hover:!border-red-600 transition-colors"
          />
          <div className="absolute -bottom-6 left-3/4 -translate-x-1/2 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 flex items-center gap-1">
            <X className="w-2.5 h-2.5" /> FALSE
          </div>
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-4 !h-4 !bg-white !border-[3px] !border-gray-300 !-bottom-2 hover:!border-primary transition-colors"
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
  const [tourRun, setTourRun] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [tourPrimaryColor, setTourPrimaryColor] = useState("#d2e823");
  const { styles: joyrideStyles, joyrideProps } = useJoyrideSettings(tourPrimaryColor);
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

    const rootStyles = getComputedStyle(document.documentElement);
    const primaryFromTheme = rootStyles.getPropertyValue("--color-primary").trim();
    if (primaryFromTheme) {
      setTourPrimaryColor(primaryFromTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isFirstAutomation) return;

    const hasSeenTour = window.localStorage.getItem("portyo:automation-builder-tour-done");
    if (!hasSeenTour) {
      setTourRun(true);
    }
  }, [isFirstAutomation]);

  const automationBuilderSteps: Step[] = [
    {
      target: '[data-tour="automation-builder-header"]',
      content: t("dashboard.tours.automationBuilder.steps.header"),
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: '[data-tour="automation-builder-canvas"]',
      content: t("dashboard.tours.automationBuilder.steps.canvas"),
      placement: "top",
    },
    {
      target: '[data-tour="automation-builder-palette"]',
      content: t("dashboard.tours.automationBuilder.steps.palette"),
      placement: "right",
    },
    {
      target: '[data-tour="automation-builder-node"]',
      content: t("dashboard.tours.automationBuilder.steps.node"),
      placement: "right",
    },
    {
      target: '[data-tour="automation-builder-actions"]',
      content: t("dashboard.tours.automationBuilder.steps.actions"),
      placement: "bottom",
    },
  ];

  const handleAutomationBuilderTourCallback = (data: CallBackProps) => {
    const { status, type, index, action } = data;

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type as any)) {
      const delta = action === ACTIONS.PREV ? -1 : 1;
      setTourStepIndex(index + delta);
      return;
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setTourRun(false);
      setTourStepIndex(0);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("portyo:automation-builder-tour-done", "true");
      }
    }
  };

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

  return (
    <AuthorizationGuard minPlan="standard">
      <div className="h-[calc(100vh-65px)] md:h-screen flex flex-col bg-gray-50 flex-1 overflow-hidden">
        <Joyride
          steps={automationBuilderSteps}
          run={tourRun}
          stepIndex={tourStepIndex}
          continuous
          showSkipButton
          spotlightClicks
          scrollToFirstStep
          callback={handleAutomationBuilderTourCallback}
          styles={joyrideStyles}
          scrollOffset={joyrideProps.scrollOffset}
          spotlightPadding={joyrideProps.spotlightPadding}
          disableScrollParentFix={joyrideProps.disableScrollParentFix}
        />
        {/* Status Message Toast */}
        {statusMessage && (
          <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300 ${statusMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
            {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm font-medium">{statusMessage.message}</span>
          </div>
        )}

        {/* Header Bar */}
        <div data-tour="automation-builder-header" className="h-auto md:h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex flex-col md:flex-row items-stretch md:items-center justify-between px-4 py-4 md:py-0 z-40 relative gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard/automation")}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-200 hidden md:block"></div>
            <input
              type="text"
              value={automationName}
              onChange={(e) => setAutomationName(e.target.value)}
              className="bg-transparent border-none outline-none text-base font-bold text-gray-900 placeholder:text-gray-400 w-full md:w-64 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors focus:bg-white focus:ring-2 focus:ring-primary/20"
              placeholder={t("dashboard.automationBuilder.namePlaceholder")}
            />
          </div>

          <div data-tour="automation-builder-actions" className="flex items-center justify-end gap-3 px-2 md:px-0">
            {/* Status Indicator */}
            {currentAutomation && (
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${currentAutomation.isActive
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}>
                <span className={`w-2 h-2 rounded-full ${currentAutomation.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                {currentAutomation.isActive ? t("dashboard.automationBuilder.status.active") : t("dashboard.automationBuilder.status.draft")}
              </div>
            )}

            <div className="w-px h-6 bg-gray-200 mx-2 hidden md:block"></div>

            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-4 py-2 hover:bg-white hover:shadow-sm text-gray-600 rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 border border-transparent hover:border-gray-200"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span className="hidden sm:inline">{isSaving ? t("dashboard.automationBuilder.saving") : t("dashboard.automationBuilder.saveDraft")}</span>
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
              <span>{isActivating ? t("dashboard.automationBuilder.processing") : currentAutomation?.isActive ? t("dashboard.automationBuilder.deactivate") : t("dashboard.automationBuilder.activate")}</span>
            </button>
          </div>
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
              fitViewOptions={{ maxZoom: 1 }}
              minZoom={0.1}
              maxZoom={1}
              className="bg-gray-50"
            >
              <Background color="#94a3b8" gap={20} size={1} />
              <Controls className="!bg-white !border-gray-200 !shadow-lg !rounded-xl !m-4 !bottom-24 md:!bottom-4" />

              <Panel position="top-left" className="!m-0 !top-auto !bottom-0 !left-0 !right-0 md:!top-4 md:!bottom-auto md:!left-0 md:!right-auto md:!m-4 w-full md:w-auto z-10">
                <div data-tour="automation-builder-palette" className="bg-white/90 backdrop-blur-md shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-xl border-t md:border border-gray-200/50 p-4 md:p-2 flex flex-row md:flex-col gap-3 md:gap-1 w-full md:w-14 items-center overflow-x-auto md:overflow-visible md:rounded-2xl no-scrollbar">
                  {[
                    { type: 'trigger', label: t("dashboard.automationBuilder.palette.trigger"), icon: Zap, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
                    { type: 'action', label: t("dashboard.automationBuilder.palette.email"), icon: Mail, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
                    { type: 'instagram', label: t("dashboard.automationBuilder.palette.instagram"), icon: Instagram, color: 'text-pink-600 bg-pink-50 hover:bg-pink-100' },
                    { type: 'youtube', label: t("dashboard.automationBuilder.palette.youtube"), icon: Youtube, color: 'text-red-600 bg-red-50 hover:bg-red-100' },
                    { type: 'delay', label: t("dashboard.automationBuilder.palette.delay"), icon: Clock, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
                    { type: 'condition', label: t("dashboard.automationBuilder.palette.condition"), icon: Settings, color: 'text-gray-600 bg-gray-50 hover:bg-gray-100' },
                    { type: 'integration', label: t("dashboard.automationBuilder.palette.integration"), icon: Share2, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' },
                    { type: 'page_event', label: t("dashboard.automationBuilder.palette.pageEvent"), icon: Layout, color: 'text-teal-600 bg-teal-50 hover:bg-teal-100' },
                    { type: 'update_element', label: t("dashboard.automationBuilder.palette.updateElement"), icon: Edit, color: 'text-orange-600 bg-orange-50 hover:bg-orange-100' },
                    { type: 'math_operation', label: t("dashboard.automationBuilder.palette.math"), icon: Calculator, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' },
                    { type: 'stripe_discount', label: t("dashboard.automationBuilder.palette.stripeDiscount"), icon: BadgePercent, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
                  ].map((item) => (
                    <div
                      key={item.type}
                      className={`w-12 h-12 md:w-10 md:h-10 rounded-xl ${item.color} flex items-center justify-center transition-colors cursor-grab active:cursor-grabbing relative group shrink-0`}
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
                      <item.icon className="w-6 h-6 md:w-5 md:h-5" />
                      <span className="hidden md:block absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
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
            <div className="absolute inset-0 md:inset-auto md:right-6 md:top-6 md:bottom-6 w-full md:w-[340px] bg-white/95 backdrop-blur-xl border-l md:border border-gray-200/60 md:rounded-2xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white/50 md:rounded-t-2xl">
                <h2 className="font-bold text-lg text-gray-900">{t("dashboard.automationBuilder.config.title")}</h2>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar pb-24 md:pb-6">

                {/* Common: Label */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{t("dashboard.automationBuilder.config.stepName")}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    value={selectedNode.data.label}
                    onChange={(e) => updateNodeData('label', e.target.value)}
                  />
                </div>

                {/* Trigger Configuration */}
                {(selectedNode as any).type === 'trigger' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{t("dashboard.automationBuilder.trigger.eventType")}</label>
                      <div className="relative">
                        <select
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
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
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                          <Settings className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Trigger Configuration Extras */}
                    {/* Milestone Selector */}
                    {['visit_milestone', 'view_milestone', 'click_milestone', 'form_submit_milestone', 'lead_milestone'].includes(selectedNode.data.eventType) && (
                      <div className="space-y-2 p-4 bg-amber-50 rounded-xl border border-amber-200/50">
                        <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider">
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
                          className="w-full px-4 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                          value={selectedNode.data.milestoneCount || 100}
                          onChange={(e) => updateNodeData('milestoneCount', parseInt(e.target.value) || 1)}
                          placeholder={t("dashboard.automationBuilder.trigger.milestone.placeholder")}
                        />
                        <p className="text-[11px] text-amber-700/80">{t("dashboard.automationBuilder.trigger.milestone.hint")}</p>
                      </div>
                    )}

                    {/* Form Selector (Existing) */}
                    {selectedNode.data.eventType === 'form_submit' && (
                      <div className="space-y-2 p-4 bg-orange-50 rounded-xl border border-orange-200/50">
                        <label className="block text-xs font-bold text-orange-700 uppercase tracking-wider">{t("dashboard.automationBuilder.trigger.selectForm")}</label>
                        <select
                          className="w-full px-4 py-2 bg-white border border-orange-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
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
                              <div className="mt-2 p-2 bg-red-50 rounded border border-red-100">
                                <p className="text-xs text-red-600 font-semibold mb-1">
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
                      <div className="space-y-4 mb-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200/50">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                            <Mail className="w-3 h-3 text-white" />
                          </div>
                          <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider">{t("dashboard.automationBuilder.action.loadTemplate")}</label>
                        </div>
                        <select
                          className="w-full px-4 py-2 bg-white border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
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
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{t("dashboard.automationBuilder.action.emailSubject")}</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        placeholder={t("dashboard.automationBuilder.action.subjectPlaceholder")}
                        value={selectedNode.data.subject || ''}
                        onChange={(e) => updateNodeData('subject', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{t("dashboard.automationBuilder.action.emailContent")}</label>
                      <textarea
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm min-h-[120px] resize-y"
                        placeholder={t("dashboard.automationBuilder.action.contentPlaceholder")}
                        value={selectedNode.data.content || ''}
                        onChange={(e) => updateNodeData('content', e.target.value)}
                      ></textarea>
                    </div>

                    {/* Lead Selection Options - Only for Blog Post Trigger */}
                    {showLeadSelectionOptionsForAction && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 rounded-xl p-4 space-y-4">
                        <div className="flex items-center gap-2 text-green-700">
                          <Mail className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">{t("dashboard.automationBuilder.action.leadRecipients.title")}</span>
                        </div>
                        <p className="text-xs text-green-600">
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
                              className="w-4 h-4 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors">
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
                              className="w-4 h-4 text-green-600 focus:ring-green-500 mt-0.5"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors">
                                {t("dashboard.automationBuilder.action.leadRecipients.sendSpecific")}
                              </span>
                              {selectedNode.data.sendToAllLeads === false && (
                                <div className="mt-2 flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="1"
                                    max="10000"
                                    className="w-24 px-3 py-2 bg-white border border-green-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400"
                                    value={selectedNode.data.leadCount || 10}
                                    onChange={(e) => updateNodeData('leadCount', parseInt(e.target.value) || 10)}
                                  />
                                  <span className="text-xs text-gray-500">{t("dashboard.automationBuilder.action.leadRecipients.leads")}</span>
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Template Variables Documentation */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Code className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">{t("dashboard.automationBuilder.action.variables.title")}</span>
                      </div>
                      <p className="text-xs text-blue-600">{t("dashboard.automationBuilder.action.variables.subtitle")}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-700">{t("dashboard.automationBuilder.action.variables.subscriber")}</p>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{email}}"}</code>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-700">{t("dashboard.automationBuilder.action.variables.bio")}</p>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{bioName}}"}</code>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{bioUrl}}"}</code>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-700">{t("dashboard.automationBuilder.action.variables.owner")}</p>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{ownerName}}"}</code>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{ownerFirstName}}"}</code>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-700">{t("dashboard.automationBuilder.action.variables.dateTime")}</p>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{currentDate}}"}</code>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{currentYear}}"}</code>
                        </div>
                        {showLeadSelectionOptions && (
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-700">{t("dashboard.automationBuilder.action.variables.blogPost")}</p>
                            <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{postTitle}}"}</code>
                            <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{postUrl}}"}</code>
                          </div>
                        )}

                        <div className="space-y-1">
                          <p className="font-semibold text-gray-700">{t("dashboard.automationBuilder.action.variables.analytics")}</p>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{milestoneCount}}"}</code>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-700">{t("dashboard.automationBuilder.action.variables.stripe")}</p>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{stripePromotionCode}}"}</code>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{stripeDiscountPercent}}"}</code>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{stripeDiscountAmount}}"}</code>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{stripeDiscountCurrency}}"}</code>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{stripeDiscountExpiresAt}}"}</code>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-700">{t("dashboard.automationBuilder.action.variables.appointments")}</p>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{bookingDate}}"}</code>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{customerName}}"}</code>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-700">{t("dashboard.automationBuilder.action.variables.qrCode")}</p>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{qrValue}}"}</code>
                          <code className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{country}}"}</code>
                        </div>

                        {/* Form Variables - Show when connected to Form Trigger */}
                        {(() => {
                          const triggerNode = nodes.find(n => n.type === 'trigger' && n.data.eventType === 'form_submit');
                          const formId = triggerNode?.data.elementId;
                          const form = forms.find(f => f.id === formId);

                          if (form) {
                            return (
                              <div className="space-y-1 col-span-2 mt-2 pt-2 border-t border-blue-200">
                                <p className="font-semibold text-gray-700">{t("dashboard.automationBuilder.action.variables.form", { title: form.title })}</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {form.fields.map((field: any) => {
                                    const safeLabel = field.label.replace(/[^a-zA-Z0-9]/g, '_');
                                    return (
                                      <code key={field.id} className="block text-blue-600 bg-white/60 px-1.5 py-0.5 rounded">{"{{" + safeLabel + "}}"}</code>
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
                        <summary className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium">{t("dashboard.automationBuilder.action.variables.more")}</summary>
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
                  </div>
                )}

                {/* Stripe Discount Configuration */}
                {(selectedNode as any).type === 'stripe_discount' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Discount Type</label>
                      <select
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                        value={selectedNode.data.discountType || 'percent'}
                        onChange={(e) => updateNodeData('discountType', e.target.value)}
                      >
                        <option value="percent">Percent (%)</option>
                        <option value="amount">Fixed Amount</option>
                      </select>
                    </div>

                    {selectedNode.data.discountType !== 'amount' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Percent Off</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                          value={selectedNode.data.percentOff || 10}
                          onChange={(e) => updateNodeData('percentOff', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    )}

                    {selectedNode.data.discountType === 'amount' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Amount Off</label>
                          <input
                            type="number"
                            min="1"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            value={selectedNode.data.amountOff || 10}
                            onChange={(e) => updateNodeData('amountOff', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Currency</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm uppercase"
                            value={selectedNode.data.currency || 'usd'}
                            onChange={(e) => updateNodeData('currency', e.target.value.toLowerCase())}
                            placeholder="usd"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</label>
                        <select
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                          value={selectedNode.data.durationType || 'once'}
                          onChange={(e) => updateNodeData('durationType', e.target.value)}
                        >
                          <option value="once">Once</option>
                          <option value="repeating">Repeating</option>
                          <option value="forever">Forever</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Repeat (Months)</label>
                        <input
                          type="number"
                          min="1"
                          disabled={(selectedNode.data.durationType || 'once') !== 'repeating'}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm disabled:opacity-60"
                          value={selectedNode.data.durationInMonths || 3}
                          onChange={(e) => updateNodeData('durationInMonths', parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Max Redemptions</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                          value={selectedNode.data.maxRedemptions || ''}
                          onChange={(e) => updateNodeData('maxRedemptions', e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Code Prefix</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm uppercase"
                          value={selectedNode.data.promotionCodePrefix || 'PORTYO'}
                          onChange={(e) => updateNodeData('promotionCodePrefix', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Expires In</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                          value={selectedNode.data.expiresInValue || ''}
                          onChange={(e) => updateNodeData('expiresInValue', e.target.value ? parseInt(e.target.value) : undefined)}
                          placeholder="Optional"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Unit</label>
                        <select
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none cursor-pointer"
                          value={selectedNode.data.expiresInUnit || 'days'}
                          onChange={(e) => updateNodeData('expiresInUnit', e.target.value)}
                        >
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-4 text-xs text-emerald-700">
                      Use <strong>{"{{stripePromotionCode}}"}</strong> in Email content to send the discount code automatically.
                    </div>
                  </div>
                )}

                {/* Delay Configuration */}
                {(selectedNode as any).type === 'delay' && (
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
                {(selectedNode as any).type === 'condition' && (
                  <div className="space-y-6">
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
                      <div className="space-y-4">
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
                      </div>
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
                  </div>
                )}

                {/* Instagram Configuration */}
                {(selectedNode as any).type === 'instagram' && (
                  <div className="space-y-4">
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
                  </div>
                )}

                {/* YouTube Configuration */}
                {(selectedNode as any).type === 'youtube' && (
                  <div className="space-y-4">
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
                  </div>
                )}

                {/* Integration Configuration */}
                {(selectedNode as any).type === 'integration' && (
                  <div className="space-y-4">
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
                  </div>
                )}

                {/* Page Event Configuration */}
                {(selectedNode as any).type === 'page_event' && (
                  <div className="space-y-4">
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
                  </div>
                )}

                {/* Update Element Configuration */}
                {(selectedNode as any).type === 'update_element' && (
                  <div className="space-y-4">
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
                  </div>
                )}

                {/* SMS Configuration */}
                {(selectedNode as any).type === 'sms' && (
                  <div className="space-y-4">
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
                  </div>
                )}

                {/* Webhook Configuration */}
                {(selectedNode as any).type === 'webhook' && (
                  <div className="space-y-4">
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
                  </div>
                )}

                {/* Tag Configuration */}
                {(selectedNode as any).type === 'tag' && (
                  <div className="space-y-4">
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
                  </div>
                )}

                {/* Split Test Configuration */}
                {(selectedNode as any).type === 'split_test' && (
                  <div className="space-y-4">
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
                  </div>
                )}

                {/* Notification Configuration */}
                {(selectedNode as any).type === 'notification' && (
                  <div className="space-y-4">
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
                  </div>
                )}

                {/* Math Configuration */}
                {(selectedNode as any).type === 'math_operation' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Operator</label>
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
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-200 hover:bg-indigo-50'
                              }`}
                          >
                            {op}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Value 1</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"
                          placeholder="Number or {{Var}}"
                          value={selectedNode.data.operand1 || ''}
                          onChange={(e) => updateNodeData('operand1', e.target.value)}
                        />
                      </div>

                      <div className="flex justify-center">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                          {selectedNode.data.mathOperator || '+'}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Value 2</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"
                          placeholder="Number or {{Var}}"
                          value={selectedNode.data.operand2 || ''}
                          onChange={(e) => updateNodeData('operand2', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Save Result As</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">{"{{"}</div>
                        <input
                          type="text"
                          className="w-full pl-8 pr-8 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400"
                          placeholder="result_name"
                          value={selectedNode.data.resultVarName || ''}
                          onChange={(e) => updateNodeData('resultVarName', e.target.value)}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">{"}}"}</div>
                      </div>
                      <p className="text-[10px] text-gray-500 italic">You can use this name in following steps like {"{{result_name}}"}</p>
                    </div>
                  </div>
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
    </AuthorizationGuard >
  );
}
