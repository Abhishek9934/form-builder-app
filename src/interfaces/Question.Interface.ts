export interface Question {
    id: string;
    type: 'text' | 'number' | 'select';
    label: string;
    helperText?: string;
    numberType?: string;
    min?: number;
    max?: number;
    options?: string[];
    required: boolean;
    hidden?: boolean; 
    saveStatus?: "saving" | "saved" | "error" | "initial";
    error?: string;
}