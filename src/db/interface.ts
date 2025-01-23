import { VectorQueryOptions } from "@google-cloud/firestore";
import { QueryOptions, VectorData } from "../shared/types/db/types";
import {
  VectorFilter,
  VectorInput,
  VectorOperation,
  VectorSearchResult,
  VectorStats,
} from "../shared/types/db/vector";

export interface VectorDatabase {
  storeVector(data: VectorInput): Promise<void>;

  getVector(
    id: string,
    options?: { includeVector?: boolean }
  ): Promise<VectorData | null>;

  updateVector(
    id: string,
    data: Partial<Omit<VectorData, "id" | "createdAt" | "updatedAt">>,
    options?: VectorOperation
  ): Promise<VectorData>;

  searchSimilarVectors(
    queryVector: number[],
    options?: VectorQueryOptions,
    filter?: VectorFilter
  ): Promise<VectorSearchResult[]>;

  listVectors(
    filter?: VectorFilter,
    options?: QueryOptions
  ): Promise<VectorData[]>;

  deleteVector?(id: string): Promise<boolean>;

  countVectors(filter?: VectorFilter): Promise<number>;

  getStats?(): Promise<VectorStats>;

  // Batch operations
  storeVectors?(
    vectors: Array<Omit<VectorData, "id" | "createdAt" | "updatedAt">>
  ): Promise<VectorData[]>;

  deleteVectors?(ids: string[]): Promise<boolean>;
}
