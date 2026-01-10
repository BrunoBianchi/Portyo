import { AppDataSource } from "../../database/datasource";
import { AutomationEntity, AutomationExecutionEntity, AutomationNode, AutomationEdge } from "../../database/entity/automation-entity";
import { BioEntity } from "../../database/entity/bio-entity";
import { ApiError, APIErrors } from "../errors/api-error";
import { logger } from "../utils/logger";
import { env } from "../../config/env";
import { PLAN_LIMITS, PlanType } from "../constants/plan-limits";
import { BillingService } from "../../services/billing.service";
import FormData from "form-data";
import Mailgun from "mailgun.js";

const automationRepository = AppDataSource.getRepository(AutomationEntity);
const executionRepository = AppDataSource.getRepository(AutomationExecutionEntity);
const bioRepository = AppDataSource.getRepository(BioEntity);

// Mailgun client for sending emails
const mailgun = new Mailgun(FormData);
const mg = env.MAILGUN_API_SECRET ? mailgun.client({
    username: "api",
    key: env.MAILGUN_API_SECRET,
}) : null;

// ==================== CRUD Operations ====================

export const createAutomation = async (
    bioId: string,
    name: string,
    nodes: AutomationNode[],
    edges: AutomationEdge[]
): Promise<AutomationEntity> => {
    const bio = await bioRepository.findOne({ 
        where: { id: bioId },
        relations: ["user"]
    });
    
    if (!bio) {
        throw new ApiError(APIErrors.notFoundError, "Bio not found", 404);
    }

    // Validate Trigger Count (Max 1)
    const triggerCount = nodes.filter(n => n.type === 'trigger').length;
    if (triggerCount > 1) {
        throw new ApiError(APIErrors.badRequestError, "An automation can only have one trigger.", 400);
    }
    if (triggerCount === 0) {
         throw new ApiError(APIErrors.badRequestError, "An automation must have at least one trigger.", 400);
    }

    // Check Automation Limits based on Active Plan
    const activePlan = await BillingService.getActivePlan(bio.user.id);
    const limit = PLAN_LIMITS[activePlan as PlanType].automationsPerBio;
    
    const count = await automationRepository.count({ where: { bioId } });
    if (count >= limit) {
        throw new ApiError(APIErrors.forbiddenError, `You have reached the limit of ${limit} automation(s) for your ${activePlan} plan. Upgrade to create more.`, 403);
    }

    const automation = automationRepository.create({
        name,
        nodes,
        edges,
        bioId,
        isActive: false,
    });

    return await automationRepository.save(automation);
};

export const getAutomationsByBio = async (bioId: string): Promise<AutomationEntity[]> => {
    return await automationRepository.createQueryBuilder("automation")
        .where("automation.bioId = :bioId", { bioId })
        .loadRelationCountAndMap("automation.executionCount", "automation.executions", "execution")
        .orderBy("automation.createdAt", "DESC")
        .getMany();
};

export const getAutomationById = async (id: string): Promise<AutomationEntity | null> => {
    return await automationRepository.findOne({
        where: { id },
        relations: ["bio"],
    });
};

export const updateAutomation = async (
    id: string,
    data: Partial<{ name: string; nodes: AutomationNode[]; edges: AutomationEdge[]; isActive: boolean }>
): Promise<AutomationEntity> => {
    const automation = await automationRepository.findOne({ where: { id } });
    if (!automation) {
        throw new ApiError(APIErrors.notFoundError, "Automation not found", 404);
    }

    // Validate Trigger Count if nodes are being updated
    if (data.nodes) {
        const triggerCount = data.nodes.filter(n => n.type === 'trigger').length;
        if (triggerCount > 1) {
            throw new ApiError(APIErrors.badRequestError, "An automation can only have one trigger.", 400);
        }
        if (triggerCount === 0) {
             throw new ApiError(APIErrors.badRequestError, "An automation must have at least one trigger.", 400);
        }
    }

    Object.assign(automation, data);
    return await automationRepository.save(automation);
};

export const deleteAutomation = async (id: string): Promise<void> => {
    const automation = await automationRepository.findOne({ where: { id } });
    if (!automation) {
        throw new ApiError(APIErrors.notFoundError, "Automation not found", 404);
    }
    await automationRepository.remove(automation);
};

export const activateAutomation = async (id: string): Promise<AutomationEntity> => {
    return await updateAutomation(id, { isActive: true });
};

export const deactivateAutomation = async (id: string): Promise<AutomationEntity> => {
    return await updateAutomation(id, { isActive: false });
};

// ==================== Execution Engine ====================

export const triggerAutomation = async (
    bioId: string,
    eventType: string,
    eventData: any
): Promise<AutomationExecutionEntity[]> => {
    logger.info(`[Automation] Trigger called for bio ${bioId} with event: ${eventType}`);
    
    // Find all active automations for this bio with matching trigger
    const automations = await automationRepository.find({
        where: { bioId, isActive: true },
    });

    logger.info(`[Automation] Found ${automations.length} active automation(s) for bio ${bioId}`);

    const executions: AutomationExecutionEntity[] = [];

    for (const automation of automations) {
        logger.info(`[Automation] Checking automation "${automation.name}" (${automation.id})`);
        
        // Find trigger nodes that match the event
        const triggerNodes = automation.nodes.filter(
            (node) => node.type === "trigger" && node.data.eventType === eventType
        );

        logger.info(`[Automation] Found ${triggerNodes.length} matching trigger node(s) for event "${eventType}"`);
        
        // Log all trigger nodes for debugging
        automation.nodes
            .filter((node) => node.type === "trigger")
            .forEach((node) => {
                logger.info(`[Automation]   - Trigger node "${node.data.label}" has eventType: "${node.data.eventType}"`);
            });

        if (triggerNodes.length > 0) {
            logger.info(`[Automation] Executing automation "${automation.name}"`);
            const execution = await executeAutomation(automation, eventData);
            executions.push(execution);
        }
    }

    logger.info(`[Automation] Completed ${executions.length} execution(s)`);
    return executions;
};

export const executeAutomation = async (
    automation: AutomationEntity,
    triggerData: any
): Promise<AutomationExecutionEntity> => {
    // Create execution record
    const execution = executionRepository.create({
        automationId: automation.id,
        status: "running",
        context: {},
        triggerData,
    });
    await executionRepository.save(execution);

    try {
        // Fetch bio and user data to enrich context
        const bio = await bioRepository.findOne({ 
            where: { id: automation.bioId },
            relations: ["user"]
        });

        // Build enriched context with all available variables
        const enrichedContext = {
            ...triggerData,
            // Subscriber/Contact info
            subscriberEmail: triggerData.email,
            
            // Bio info
            bioName: bio?.sufix || "",
            bioDescription: bio?.description || "",
            bioUrl: bio?.sufix ? `https://portyo.me/${bio.sufix}` : "",
            bioViews: bio?.views || 0,
            bioClicks: bio?.clicks || 0,
            
            // User (owner) info - available but be careful with privacy
            ownerName: bio?.user?.fullName || "",
            ownerFirstName: bio?.user?.fullName?.split(" ")[0] || "",
            ownerEmail: bio?.user?.email || "",
            
            // Social links
            instagram: bio?.socials?.instagram || "",
            tiktok: bio?.socials?.tiktok || "",
            twitter: bio?.socials?.twitter || "",
            youtube: bio?.socials?.youtube || "",
            linkedin: bio?.socials?.linkedin || "",
            website: bio?.socials?.website || "",
            
            // Date/Time
            currentDate: new Date().toLocaleDateString("pt-BR"),
            currentTime: new Date().toLocaleTimeString("pt-BR"),
            currentYear: new Date().getFullYear().toString(),
        };

        logger.info(`[Automation] Context enriched with bio/user data`);

        // Find the trigger node(s) - these are the starting points
        const triggerNodes = automation.nodes.filter((node) => node.type === "trigger");

        // Process workflow starting from each trigger
        for (const triggerNode of triggerNodes) {
            await processNodeAndContinue(
                automation,
                triggerNode,
                execution,
                { ...enrichedContext }
            );
        }

        execution.status = "completed";
        execution.completedAt = new Date();
        await executionRepository.save(execution);
    } catch (error: any) {
        logger.error(`Automation execution failed: ${error.message}`);
        execution.status = "failed";
        execution.error = error.message;
        await executionRepository.save(execution);
    }

    return execution;
};

const processNodeAndContinue = async (
    automation: AutomationEntity,
    node: AutomationNode,
    execution: AutomationExecutionEntity,
    context: any
): Promise<void> => {
    execution.currentNodeId = node.id;
    await executionRepository.save(execution);

    logger.info(`Processing node: ${node.type} (${node.id})`);

    // Process the current node
    const result = await processNode(node, context, automation);

    // If condition returned false, don't continue down this path
    if (result === false) {
        logger.info(`Condition node ${node.id} returned false, stopping this branch`);
        return;
    }

    // Merge any new context from the node processing
    if (typeof result === "object") {
        Object.assign(context, result);
    }

    // Find next nodes
    const nextNodeIds = automation.edges
        .filter((edge) => edge.source === node.id)
        .map((edge) => edge.target);

    // Process each connected node
    for (const nextNodeId of nextNodeIds) {
        const nextNode = automation.nodes.find((n) => n.id === nextNodeId);
        if (nextNode) {
            await processNodeAndContinue(automation, nextNode, execution, { ...context });
        }
    }
};

const processNode = async (
    node: AutomationNode,
    context: any,
    automation: AutomationEntity
): Promise<any> => {
    switch (node.type) {
        case "trigger":
            // Trigger is just the starting point, pass through
            return context;

        case "action":
            return await processEmailAction(node, context);

        case "delay":
            return await processDelay(node);

        case "condition":
            return await processCondition(node, context, automation);

        case "update_element":
            return await processUpdateElement(node, automation);

        case "instagram":
            return await processInstagramAction(node, context);

        case "youtube":
            return await processYoutubeAction(node, context);

        case "integration":
            return await processIntegration(node, context);

        case "page_event":
            // Page events are typically triggers, pass through
            return context;

        default:
            logger.warn(`Unknown node type: ${node.type}`);
            return context;
    }
};

// ==================== Node Processors ====================

const processEmailAction = async (node: AutomationNode, context: any): Promise<any> => {
    const { subject, content } = node.data;
    const recipientEmail = context.email;

    logger.info(`[Automation] Processing email action - recipient: ${recipientEmail}`);

    if (!recipientEmail) {
        logger.warn("[Automation] No recipient email in context, skipping email action");
        return context;
    }

    // Check if Mailgun is configured
    if (!mg || !env.MAILGUN_API_SECRET) {
        logger.warn("[Automation] Mailgun not configured, email will not be sent. Set MAILGUN_API_SECRET in environment variables.");
        logger.info(`[Automation] Would have sent email to ${recipientEmail} with subject: "${subject || 'Welcome!'}"`);
        return { ...context, emailSent: false, emailSkipped: true };
    }

    try {
        // Replace placeholders in subject and content
        const processedSubject = replacePlaceholders(subject || "Welcome!", context);
        const processedContent = replacePlaceholders(content || "Thank you for subscribing!", context);

        logger.info(`[Automation] Sending email via Mailgun to ${recipientEmail}...`);

        const data = await mg.messages.create(env.MAILGUN_DOMAIN, {
            from: env.MAILGUN_FROM_EMAIL,
            to: [recipientEmail],
            subject: processedSubject,
            html: `<div style="font-family: sans-serif;">${processedContent}</div>`,
        });

        logger.info(`[Automation] Email sent successfully to ${recipientEmail}: ${processedSubject}`);
        logger.info(`[Automation] Mailgun response: ${JSON.stringify(data)}`);
        return { ...context, emailSent: true, mailgunResponse: data };
    } catch (error: any) {
        logger.error(`[Automation] Failed to send email via Mailgun: ${error.message}`);
        // Don't throw - just log and continue so the automation doesn't fail completely
        return { ...context, emailSent: false, emailError: error.message };
    }
};

const processDelay = async (node: AutomationNode): Promise<void> => {
    const duration = parseInt(node.data.duration || "1");
    const unit = node.data.unit || "Hours";

    let delayMs = 0;
    switch (unit.toLowerCase()) {
        case "minutes":
            delayMs = duration * 60 * 1000;
            break;
        case "hours":
            delayMs = duration * 60 * 60 * 1000;
            break;
        case "days":
            delayMs = duration * 24 * 60 * 60 * 1000;
            break;
    }

    // For testing, cap the delay at 5 seconds
    const maxDelay = 5000;
    const actualDelay = Math.min(delayMs, maxDelay);

    logger.info(`Delay node: waiting ${actualDelay}ms (original: ${delayMs}ms)`);
    await new Promise((resolve) => setTimeout(resolve, actualDelay));
};

const processCondition = async (
    node: AutomationNode,
    context: any,
    automation: AutomationEntity
): Promise<boolean> => {
    const { conditionType, tagName, elementId, property, operator, value } = node.data;

    if (conditionType === "tag") {
        // Check if context has the tag
        const tags = context.tags || [];
        return tags.includes(tagName);
    } else if (conditionType === "element_property") {
        // Get the bio and check element property
        const bio = await bioRepository.findOne({ where: { id: automation.bioId } });
        if (!bio || !bio.blocks) return false;

        const block = bio.blocks.find((b: any) => b.id === elementId);
        if (!block) return false;

        const blockValue = block[property as keyof typeof block];
        return evaluateCondition(String(blockValue), operator || "equals", value || "");
    }

    return true; // Default to true if no condition type specified
};

const evaluateCondition = (actual: string, operator: string, expected: string): boolean => {
    switch (operator) {
        case "equals":
            return actual === expected;
        case "not_equals":
            return actual !== expected;
        case "contains":
            return actual.includes(expected);
        case "starts_with":
            return actual.startsWith(expected);
        default:
            return false;
    }
};

const processUpdateElement = async (
    node: AutomationNode,
    automation: AutomationEntity
): Promise<void> => {
    const { elementId, property, value } = node.data;

    if (!elementId || !property) {
        logger.warn("Update element node missing elementId or property");
        return;
    }

    const bio = await bioRepository.findOne({ where: { id: automation.bioId } });
    if (!bio || !bio.blocks) return;

    const blockIndex = bio.blocks.findIndex((b: any) => b.id === elementId);
    if (blockIndex === -1) return;

    bio.blocks[blockIndex][property] = value;
    await bioRepository.save(bio);

    logger.info(`Updated element ${elementId} property ${property} to ${value}`);
};

const processInstagramAction = async (node: AutomationNode, context: any): Promise<any> => {
    const { actionType, message } = node.data;

    // Placeholder - Instagram API integration would go here
    logger.info(`Instagram action: ${actionType} - "${message}" (placeholder)`);

    return { ...context, instagramAction: actionType };
};

const processYoutubeAction = async (node: AutomationNode, context: any): Promise<any> => {
    const { actionType, comment } = node.data;

    // Placeholder - YouTube API integration would go here
    logger.info(`YouTube action: ${actionType} - "${comment}" (placeholder)`);

    return { ...context, youtubeAction: actionType };
};

const processIntegration = async (node: AutomationNode, context: any): Promise<any> => {
    const { platform } = node.data;

    // Placeholder - Integration would send data to external service
    logger.info(`Integration: sending data to ${platform} (placeholder)`);

    // For webhook, we could actually make a request
    if (platform === "webhook" && node.data.value) {
        try {
            await fetch(node.data.value, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(context),
            });
            logger.info(`Webhook sent to ${node.data.value}`);
        } catch (error: any) {
            logger.error(`Webhook failed: ${error.message}`);
        }
    }

    return { ...context, integration: platform };
};

const replacePlaceholders = (text: string, context: any): string => {
    let result = text;
    for (const [key, value] of Object.entries(context)) {
        result = result.replace(new RegExp(`{{${key}}}`, "g"), String(value));
    }
    return result;
};

// ==================== Execution History ====================

export const getExecutionsByAutomation = async (automationId: string): Promise<AutomationExecutionEntity[]> => {
    return await executionRepository.find({
        where: { automationId },
        order: { createdAt: "DESC" },
        take: 50,
    });
};

export const getExecutionById = async (id: string): Promise<AutomationExecutionEntity | null> => {
    return await executionRepository.findOne({
        where: { id },
        relations: ["automation"],
    });
};
