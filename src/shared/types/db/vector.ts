export interface VectorData {
  id: string;
  vector: number[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface VectorMetadata {
  // Add any metadata fields you need
  title?: string;
  description?: string;
  source?: string;
  category?: string;
  tags?: string[];
  [key: string]: any;
}

// types/db/types.ts
export interface QueryOptions {
  limit?: number;
  offset?: number;
  sort?: {
    [key: string]: "asc" | "desc";
  };
}

export interface VectorQueryOptions {
  limit?: number;
  threshold?: number;
  includeVector?: boolean;
  includeMetadata?: boolean;
}
export interface VectorSearchResult {
  id: string;
  score: number;
  vector?: number[];
  metadata?: Record<string, unknown>;
}

export interface VectorFilter {
  metadata?: Partial<VectorMetadata>;
  createdAt?: {
    $gt?: Date;
    $lt?: Date;
  };
  updatedAt?: {
    $gt?: Date;
    $lt?: Date;
  };
}

export type VectorInput = Omit<VectorData, "id" | "createdAt" | "updatedAt">;

export interface VectorOperation {
  upsert?: boolean;
  namespace?: string;
}

export interface VectorStats {
  totalVectors: number;
  dimensions: number;
  databaseSize: number;
}

export interface VectorStoreIndex {
  topN(prompt: string, n: number): Promise<[number, string, string][]>;
  topNIds(prompt: string, n: number): Promise<[number, string][]>;
}
