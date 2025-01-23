/**
 * A generic context manager that can store and fetch values using Maps.
 * @template T The type of values stored in the context.
 */
export class Context<T = any> {
  private store: Map<string, T>;
  private fetchers: Map<string, () => Promise<T>>;

  constructor() {
    this.store = new Map<string, T>();
    this.fetchers = new Map<string, () => Promise<T>>();
  }

  /**
   * Register a fetcher function for a specific key.
   * @param key The key to associate with the fetcher.
   * @param fetcherFunction An async function that returns a value of type T.
   */
  registerFetcher(key: string, fetcherFunction: () => Promise<T>): void {
    this.fetchers.set(key, fetcherFunction);
  }

  /**
   * Get a value for a key, fetching it if missing.
   * @param key The key to retrieve.
   * @returns A promise that resolves to the value of type T.
   * @throws Error if the key is missing and has no registered fetcher.
   */
  async get(key: string): Promise<T> {
    if (this.store.has(key)) {
      return this.store.get(key)!;
    }

    if (this.fetchers.has(key)) {
      console.log(`Fetching missing key: ${key}`);
      const value = await this.fetchers.get(key)!();
      this.store.set(key, value);
      return value;
    }

    throw new Error(`Key "${key}" is missing and has no registered fetcher.`);
  }

  /**
   * Manually set a value for a key.
   * @param key The key to set.
   * @param value The value to associate with the key.
   */
  set(key: string, value: T): void {
    this.store.set(key, value);
  }

  /**
   * Check if a key exists in the store or has a registered fetcher.
   * @param key The key to check.
   * @returns True if the key exists in the store or has a registered fetcher, false otherwise.
   */
  has(key: string): boolean {
    return this.store.has(key) || this.fetchers.has(key);
  }
}
