export type FormalQuestion = { property?: string; entity: string; }

export type Parameters = {
    readonly prompt: string;
    readonly promptID?: string;
    readonly maxDepth: number;
    readonly questionsPerPrompt: number;
    readonly review: boolean;
    readonly seed: number;
    readonly propertyOptions: string[];
};

export type UserId = string;