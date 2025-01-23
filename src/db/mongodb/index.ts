import {
  MongoClient,
  Collection,
  Db,
  ObjectId,
  UpdateOptions,
  OptionalId,
} from "mongodb";
import { z } from "zod";
import { VectorDatabase } from "../interface";

import { QueryOptions } from "../../shared/types/db/types";
import {
  VectorData,
  VectorFilter,
  VectorInput,
  VectorOperation,
  VectorQueryOptions,
  VectorSearchResult,
} from "../../shared/types/db/vector";
import { VectorSchema } from "../../shared/schemas/db/schema";

export class MongoVectorDatabase implements VectorDatabase {
  private client: MongoClient;
  private db: Db;
  private vectors: Collection<VectorData>;

  constructor(private readonly url: string, private readonly dbName: string) {
    this.client = new MongoClient(url);
    this.db = this.client.db(this.dbName);
    this.vectors = this.db.collection("vectors");
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      // Create indexes for vector search
      await this.setupIndexes();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  private async setupIndexes(): Promise<void> {
    // Create a 2d index on the vector field for similarity search
    await this.vectors.createIndex({ vector: "2d" });
    // Create indexes on metadata fields that you frequently query
    await this.vectors.createIndex({ "metadata.category": 1 });
    await this.vectors.createIndex({ createdAt: 1 });
    await this.vectors.createIndex({ updatedAt: 1 });
  }

  async storeVector(data: VectorInput): Promise<void> {
    try {
      const now = new Date();
      const vectorData: VectorData = {
        id: new ObjectId().toString(),
        vector: data.vector,
        metadata: data.metadata,
        createdAt: now,
        updatedAt: now,
      };

      // Validate with Zod
      const validated = VectorSchema.parse(vectorData);

      //FIX
      // const { id, ...insertData } = validated;
      // await this.vectors.insertOne(insertData as Omit<VectorData, "id">);

      // return validated;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getVector(
    id: string,
    options?: { includeVector?: boolean }
  ): Promise<VectorData | null> {
    try {
      const projection = options?.includeVector ? {} : { vector: 0 };
      const vector = await this.vectors.findOne({ id }, { projection });
      return vector;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateVector(
    id: string,
    data: Partial<Omit<VectorData, "id" | "createdAt" | "updatedAt">>,
    options?: VectorOperation
  ): Promise<VectorData> {
    try {
      const now = new Date();
      const updateData = {
        $set: {
          ...data,
          updatedAt: now,
        },
      };

      const result = await this.vectors.findOneAndUpdate({ id }, updateData, {
        upsert: options?.upsert,
        returnDocument: "after",
      });

      if (!result) {
        throw new Error("Vector not found");
      }

      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchSimilarVectors(
    queryVector: number[],
    options?: VectorQueryOptions,
    filter?: VectorFilter
  ): Promise<VectorSearchResult[]> {
    try {
      const query: any = {
        $and: [
          { vector: { $near: queryVector } },
          filter ? this.buildFilter(filter) : {},
        ],
      };

      let cursor = this.vectors.find(query);

      if (options?.limit) {
        cursor = cursor.limit(options.limit);
      }

      const results = await cursor.toArray();

      return results.map(
        (doc): VectorSearchResult => ({
          id: doc.id,
          score: this.calculateSimilarity(queryVector, doc.vector),
          vector: options?.includeVector ? doc.vector : undefined,
          metadata: options?.includeMetadata ? doc.metadata : undefined,
        })
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async listVectors(
    filter?: VectorFilter,
    options?: QueryOptions
  ): Promise<VectorData[]> {
    try {
      let cursor = this.vectors.find(filter ? this.buildFilter(filter) : {});

      if (options?.sort) {
        cursor = cursor.sort(options.sort);
      }

      if (options?.limit) {
        cursor = cursor.limit(options.limit);
      }

      if (options?.offset) {
        cursor = cursor.skip(options.offset);
      }

      return await cursor.toArray();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteVector(id: string): Promise<boolean> {
    try {
      const result = await this.vectors.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async countVectors(filter?: VectorFilter): Promise<number> {
    try {
      return await this.vectors.countDocuments(
        filter ? this.buildFilter(filter) : {}
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private buildFilter(filter: VectorFilter): any {
    const mongoFilter: any = {};

    if (filter.metadata) {
      Object.entries(filter.metadata).forEach(([key, value]) => {
        mongoFilter[`metadata.${key}`] = value;
      });
    }

    if (filter.createdAt) {
      mongoFilter.createdAt = {};
      if (filter.createdAt.$gt)
        mongoFilter.createdAt.$gt = filter.createdAt.$gt;
      if (filter.createdAt.$lt)
        mongoFilter.createdAt.$lt = filter.createdAt.$lt;
    }

    if (filter.updatedAt) {
      mongoFilter.updatedAt = {};
      if (filter.updatedAt.$gt)
        mongoFilter.updatedAt.$gt = filter.updatedAt.$gt;
      if (filter.updatedAt.$lt)
        mongoFilter.updatedAt.$lt = filter.updatedAt.$lt;
    }

    return mongoFilter;
  }

  private calculateSimilarity(a: number[], b: number[]): number {
    // Implement your similarity measure here (e.g., cosine similarity)
    // This is a placeholder implementation
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
  }

  private handleError(error: any): Error {
    if (error instanceof z.ZodError) {
      return new Error(`Validation Error: ${error.message}`);
    }

    if (error.code === 11000) {
      return new Error("Duplicate key error");
    }

    return new Error(`Database Error: ${error.message}`);
  }
}
