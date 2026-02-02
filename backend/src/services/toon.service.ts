/**
 * TOON (Token-Oriented Object Notation) Service
 * 
 * Converts JSON data to TOON format to reduce token usage in LLM prompts.
 * TOON can reduce tokens by ~40% compared to JSON while maintaining structure.
 * 
 * @see https://github.com/toon-format/toon
 */

// Simple TOON encoder that converts JSON to TOON format
export class ToonService {
    
    /**
     * Encode JSON data to TOON format
     * @param data - Any JSON-serializable data
     * @returns TOON formatted string
     */
    static encode(data: any): string {
        if (data === null) return 'null';
        if (data === undefined) return '';
        
        const type = typeof data;
        
        if (type === 'string') return this.encodeString(data);
        if (type === 'number' || type === 'boolean') return String(data);
        if (Array.isArray(data)) return this.encodeArray(data);
        if (type === 'object') return this.encodeObject(data);
        
        return String(data);
    }
    
    /**
     * Encode a string value
     */
    private static encodeString(str: string): string {
        // Check if string needs quoting
        if (/^[a-zA-Z0-9_]+$/.test(str)) {
            return str;
        }
        // Quote strings with special characters
        return `"${str.replace(/"/g, '\\"')}"`;
    }
    
    /**
     * Encode an array to TOON format
     */
    private static encodeArray(arr: any[]): string {
        if (arr.length === 0) return '[]';
        
        // Check if array contains only primitives
        if (arr.every(item => typeof item !== 'object' || item === null)) {
            return arr.map(item => this.encode(item)).join(',');
        }
        
        // Check if array contains uniform objects (tabular format)
        if (arr.every(item => typeof item === 'object' && item !== null && !Array.isArray(item))) {
            return this.encodeUniformArray(arr);
        }
        
        // Mixed array - use indentation
        const items = arr.map(item => `  ${this.indent(this.encode(item))}`).join('\n');
        return `\n${items}`;
    }
    
    /**
     * Encode uniform array of objects in tabular format
     */
    private static encodeUniformArray(arr: any[]): string {
        if (arr.length === 0) return '[]';
        
        const firstItem = arr[0];
        const keys = Object.keys(firstItem);
        
        // Check if all items have the same structure
        const isUniform = arr.every(item => {
            const itemKeys = Object.keys(item);
            return itemKeys.length === keys.length && 
                   keys.every(k => itemKeys.includes(k));
        });
        
        if (!isUniform || keys.length === 0) {
            return arr.map(item => this.encodeObject(item, 0)).join('\n');
        }
        
        // Tabular format
        const fieldHeader = `{${keys.join(',')}}`;
        const rows = arr.map(item => {
            return '  ' + keys.map(k => {
                const val = item[k];
                if (val === null || val === undefined) return '';
                if (typeof val === 'boolean') return val ? 'true' : 'false';
                if (typeof val === 'number') return String(val);
                if (typeof val === 'string') {
                    if (/^[a-zA-Z0-9_\s\-./@]+$/.test(val) && !val.includes(',')) {
                        return val;
                    }
                    return `"${val.replace(/"/g, '\\"')}"`;
                }
                return this.encode(val).replace(/\n/g, ' ');
            }).join(',');
        }).join('\n');
        
        return `[${arr.length}]${fieldHeader}:\n${rows}`;
    }
    
    /**
     * Encode an object to TOON format
     */
    private static encodeObject(obj: Record<string, any>, indent: number = 0): string {
        const entries = Object.entries(obj);
        if (entries.length === 0) return '{}';
        
        const childIndentStr = '  '.repeat(indent + 1);
        
        const lines = entries.map(([key, value]) => {
            const encodedValue = this.encode(value);
            
            if (encodedValue.includes('\n') && !encodedValue.startsWith('\n')) {
                return `${childIndentStr}${key}:\n${this.indent(encodedValue, indent + 1)}`;
            }
            
            if (encodedValue.startsWith('\n')) {
                return `${childIndentStr}${key}:${encodedValue}`;
            }
            
            return `${childIndentStr}${key}: ${encodedValue}`;
        });
        
        return '\n' + lines.join('\n');
    }
    
    /**
     * Indent a multi-line string
     */
    private static indent(str: string, levels: number = 1): string {
        const indentStr = '  '.repeat(levels);
        return str.split('\n').map(line => line ? indentStr + line : line).join('\n');
    }
    
    /**
     * Calculate approximate token savings
     */
    static calculateSavings(jsonData: any): { json: number; toon: number; savings: number; percent: number } {
        const jsonStr = JSON.stringify(jsonData, null, 2);
        const toonStr = this.encode(jsonData);
        
        const jsonTokens = Math.ceil(jsonStr.length / 4);
        const toonTokens = Math.ceil(toonStr.length / 4);
        const savings = jsonTokens - toonTokens;
        const percent = Math.round((savings / jsonTokens) * 100);
        
        return {
            json: jsonTokens,
            toon: toonTokens,
            savings,
            percent
        };
    }
}

/**
 * Predefined TOON templates for common use cases
 */
export const ToonTemplates = {
    
    /**
     * Format bio entity data for AI prompts
     */
    bioEntity(bio: any): string {
        const data = {
            id: bio.id,
            username: bio.sufix,
            displayName: bio.seoTitle || bio.sufix,
            description: bio.description || '',
            seoDescription: bio.seoDescription || '',
            blocks: bio.blocks?.map((b: any) => ({
                type: b.type,
                title: b.title || '',
                content: b.body || b.content || ''
            })) || []
        };
        return ToonService.encode(data);
    },
    
    /**
     * Format auto-post schedule for AI prompts
     */
    autoPostSchedule(schedule: any): string {
        const data = {
            topics: schedule.topics || '',
            keywords: schedule.keywords || [],
            tone: schedule.tone || 'professional',
            length: schedule.postLength || 'medium',
            targetAudience: schedule.targetAudience || '',
            targetCountry: schedule.targetCountry || '',
            language: schedule.language || 'auto-detect'
        };
        return ToonService.encode(data);
    },
    
    /**
     * Format bio summary for AI prompts
     */
    bioSummary(summary: any): string {
        const data = {
            summary: summary.summary,
            industry: summary.industry,
            expertise: summary.expertise,
            tone: summary.tone,
            targetAudience: summary.targetAudience,
            uniqueSellingPoints: summary.uniqueSellingPoints,
            contentPillars: summary.contentPillars
        };
        return ToonService.encode(data);
    }
};

export default ToonService;
