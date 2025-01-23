export interface DatabaseConfig {
  url: string;
  name: string;
  options?: Record<string, any>;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sort?: Record<string, 1 | -1>;
  select?: string[];
  populate?: string[];
}

export interface UpdateOptions {
  upsert?: boolean;
  multiple?: boolean;
}
// Collection interface for generic operations
export interface CollectionInterface<T> {
  create(data: Partial<T>): Promise<T>;
  findOne(query: Partial<T>): Promise<T | null>;
  find(query: Partial<T>, options?: QueryOptions): Promise<T[]>;
  update(
    query: Partial<T>,
    data: Partial<T>,
    options?: UpdateOptions
  ): Promise<T>;
  delete(query: Partial<T>): Promise<boolean>;
  count(query: Partial<T>): Promise<number>;
}

// Query Builder interface (optional)
export interface QueryBuilder<T> {
  where(condition: Partial<T>): this;
  select(fields: (keyof T)[]): this;
  sort(field: keyof T, direction: "asc" | "desc"): this;
  limit(count: number): this;
  offset(count: number): this;
  populate(field: keyof T): this;
  execute(): Promise<T[]>;
}

// Events interface (optional)
export interface DatabaseEvents {
  onConnect?(): void;
  onDisconnect?(): void;
  onError?(error: Error): void;
  beforeCreate?(data: any): Promise<void>;
  afterCreate?(data: any): Promise<void>;
  beforeUpdate?(data: any): Promise<void>;
  afterUpdate?(data: any): Promise<void>;
  beforeDelete?(query: any): Promise<void>;
  afterDelete?(query: any): Promise<void>;
}

// Migration interface (optional)
export interface Migration {
  up(): Promise<void>;
  down(): Promise<void>;
  version: string;
  description: string;
}
