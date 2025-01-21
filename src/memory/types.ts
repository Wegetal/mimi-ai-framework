export interface EmbeddingResponse {
  embedding: number[];
  usage?: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface MemoryEntry {
  id: string;
  text: string;
  embedding: number[];
  metadata?: Record<string, any>;
  createdAt: Date;
}
