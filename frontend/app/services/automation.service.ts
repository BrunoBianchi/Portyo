import { api } from "./api";

export interface AutomationNode {
    id: string;
    type: 'trigger' | 'action' | 'condition' | 'delay' | 'instagram' | 'youtube' | 'integration' | 'page_event' | 'update_element';
    position: { x: number; y: number };
    data: {
        label: string;
        eventType?: string;
        subject?: string;
        content?: string;
        duration?: string;
        unit?: string;
        conditionType?: string;
        tagName?: string;
        elementId?: string;
        property?: string;
        operator?: string;
        value?: string;
        actionType?: string;
        message?: string;
        comment?: string;
        platform?: string;
    };
}

export interface AutomationEdge {
    id: string;
    source: string;
    target: string;
}

export interface Automation {
    id: string;
    name: string;
    isActive: boolean;
    nodes: AutomationNode[];
    edges: AutomationEdge[];
    bioId: string;
    createdAt: string;
    updatedAt: string;
    executionCount?: number;
}

export interface AutomationExecution {
    id: string;
    automationId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    context: any;
    currentNodeId: string | null;
    error: string | null;
    completedAt: string | null;
    triggerData: any;
    createdAt: string;
}

// Get all automations for a bio
export const getAutomationsByBio = async (bioId: string): Promise<Automation[]> => {
    const response = await api.get(`/automation/bio/${bioId}`);
    return response.data;
};

// Get a single automation by ID
export const getAutomationById = async (automationId: string): Promise<Automation> => {
    const response = await api.get(`/automation/${automationId}`);
    return response.data;
};

// Create a new automation (Save Draft)
export const createAutomation = async (
    bioId: string,
    name: string,
    nodes: AutomationNode[],
    edges: AutomationEdge[]
): Promise<Automation> => {
    const response = await api.post(`/automation/${bioId}`, { name, nodes, edges });
    return response.data;
};

// Update an existing automation
export const updateAutomation = async (
    automationId: string,
    data: Partial<{ name: string; nodes: AutomationNode[]; edges: AutomationEdge[]; isActive: boolean }>
): Promise<Automation> => {
    const response = await api.put(`/automation/${automationId}`, data);
    return response.data;
};

// Delete an automation
export const deleteAutomation = async (automationId: string): Promise<void> => {
    await api.delete(`/automation/${automationId}`);
};

// Activate an automation
export const activateAutomation = async (automationId: string): Promise<Automation> => {
    const response = await api.post(`/automation/${automationId}/activate`);
    return response.data;
};

// Deactivate an automation
export const deactivateAutomation = async (automationId: string): Promise<Automation> => {
    const response = await api.post(`/automation/${automationId}/deactivate`);
    return response.data;
};

// Get execution history for an automation
export const getExecutionsByAutomation = async (automationId: string): Promise<AutomationExecution[]> => {
    const response = await api.get(`/automation/${automationId}/executions`);
    return response.data;
};

// Trigger an automation (public endpoint - for testing)
export const triggerAutomation = async (bioId: string, event: string, data?: any): Promise<any> => {
    const response = await api.post(`/public/automation/trigger/${bioId}`, { event, data });
    return response.data;
};
