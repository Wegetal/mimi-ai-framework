export class VectorOperations {
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error("Vectors must have the same length");
    }
    const dotProduct = vecA.reduce((sum, v, i) => sum + v * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, v) => sum + v * v, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, v) => sum + v * v, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}
