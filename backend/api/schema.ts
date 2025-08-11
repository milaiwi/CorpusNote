// backend/api/schema.ts


/**
 * Key-Value Store Interface
 * 
 * This interface defines the methods for a key-value store.
 * It is used to store and retrieve data from the store.
 * 
 * @interface KeyValueStore
 */
export interface KeyValueStore {
    /**
     * Get a value from the store
     * 
     * @param key - The key to get the value for
     * @returns The value associated with the key, or undefined if the key does not exist
     */
    get<T = unknown>(key: string): Promise<T | undefined>

    /**
     * Set a value in the store
     * 
     * @param key - The key to set the value for
     * @param value - The value to set
     */
    set<T = unknown>(key: string, value: T): Promise<void>

    /**
     * Delete a value from the store
     * 
     * @param key - The key to delete the value for
     */
    delete(key: string): Promise<void>

    /**
     * Clear the store
     */
    clear(): Promise<void>

    /**
     * Save the store
     */
    save(): Promise<void>

    /**
     * Add a change listener to the store
     * 
     * @param handler - The handler to call when the store changes
     * @returns A function to remove the listener
     */
    onChange?(handler: (key: string) => void): () => void
}

