export type Embedding = {
  document: string;
  vec: number[];
};

export type OneOrMany<T> = T | T[];
