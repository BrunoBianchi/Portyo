
export interface BaseBlockData {
    [key: string]: any;
}

export interface BlockDefinition<T = any> {
    type: string;
    version: number;
    defaultData: T;
    schema: Record<string, any>; // For V2 AutoForm
    component?: React.ComponentType<{ data: T }>; // For V2 Unified Rendering
    render?: (data: T, context?: any) => { html: string }; // Legacy V1
    migrations?: Record<number, (data: any) => any>;
}

export interface BlockRegistry {
    register<T>(definition: BlockDefinition<T>): void;
    get(type: string): BlockDefinition | undefined;
    getTypes(): string[];
}

export interface LegacyBioBlock {
    id: string;
    type: string;
    [key: string]: any;
}

export interface NewBlock {
    id: string;
    type: string;
    version: number;
    data: any;
}
