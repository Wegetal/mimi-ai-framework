import { Embedding, OneOrMany } from "../../shared/types/db/inMemory";
import { VectorOperations } from "./vector";

export class InMemoryVectorStore<D> {
  private embeddings: Map<string, [D, OneOrMany<Embedding>]>;
  private idGenerator: () => string;

  constructor(
    idGenerator: () => string = () =>
      `doc${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  ) {
    this.embeddings = new Map();
    this.idGenerator = idGenerator;
  }

  static fromDocuments<D>(
    documents: [D, OneOrMany<Embedding>][],
    idGenerator?: () => string
  ): InMemoryVectorStore<D> {
    const store = new InMemoryVectorStore<D>(idGenerator);
    store.addDocuments(documents);
    return store;
  }

  addDocuments(documents: [D, OneOrMany<Embedding>][]): void {
    documents.forEach(([doc, embeddings]) => {
      const id = this.idGenerator();
      this.embeddings.set(id, [doc, embeddings]);
    });
  }

  updateDocument(
    id: string,
    newDoc: D,
    newEmbeddings: OneOrMany<Embedding>
  ): boolean {
    if (this.embeddings.has(id)) {
      this.embeddings.set(id, [newDoc, newEmbeddings]);
      return true;
    }
    return false;
  }

  deleteDocument(id: string): boolean {
    return this.embeddings.delete(id);
  }

  vectorSearch(promptEmbedding: Embedding, n: number): [string, number, D][] {
    const results: { id: string; distance: number; doc: D }[] = [];

    this.embeddings.forEach(([doc, embeddings], id) => {
      const bestEmbedding = Array.isArray(embeddings)
        ? embeddings[0]
        : embeddings;
      try {
        const distance = VectorOperations.cosineSimilarity(
          promptEmbedding.vec,
          bestEmbedding.vec
        );
        results.push({ id, distance, doc });
      } catch (error) {
        console.error(
          `Error calculating similarity for document ${id}:`,
          error
        );
      }
    });

    results.sort((a, b) => b.distance - a.distance);
    return results
      .slice(0, n)
      .map((result) => [result.id, result.distance, result.doc]);
  }

  getDocument(id: string): D | null {
    const entry = this.embeddings.get(id);
    return entry ? entry[0] : null;
  }

  get size(): number {
    return this.embeddings.size;
  }
}
