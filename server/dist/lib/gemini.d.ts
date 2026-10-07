import { GoogleGenAI, Schema } from '@google/genai';
import { AITriageAnalysis } from '@urbanshield/shared';
export declare const ai: GoogleGenAI;
export declare const GEMINI_MODEL = "gemini-3.8-flash";
export declare const triageOutputSchema: Schema;
export interface MultimodalPayload {
    description: string;
    categoryHint?: string;
    hasTrappedIndividuals?: boolean;
    hasVisibleFlames?: boolean;
    hasChemicalOdor?: boolean;
    imageBuffer?: Buffer;
    imageMimeType?: string;
    audioBuffer?: Buffer;
    audioMimeType?: string;
    audioTranscript?: string;
}
export declare function analyzeIncidentMultimodal(payload: MultimodalPayload): Promise<AITriageAnalysis>;
//# sourceMappingURL=gemini.d.ts.map