// backend/api/TauriStoreAdapter.ts

import { KeyValueStore } from "./schema"
import { Store } from "tauri-plugin-store-api"

class TauriStoreAdapter implements KeyValueStore {
    private store: Store

    constructor(storeName: string = ".settings.dat") {
        this.store = new Store(storeName)
    }

    async get<T = unknown>(key: string): Promise<T | undefined> {
        const val = await this.store.get(key)
        if (val === null)
            return undefined
        return val as T
    }

    async set<T = unknown>(key: string, value: T): Promise<void> {
        await this.store.set(key, value)
    }

    async delete(key: string): Promise<void> {
        await this.store.delete(key)
    }

    async clear(): Promise<void> {
        await this.store.clear()
    }

    async save(): Promise<void> {
        await this.store.save()
    }

    onChange?(handler: (key: string) => void): () => void {
        let unlisten: (() => void) | undefined;
        this.store.onChange(handler).then(fn => {
            unlisten = fn;
        });
        return () => {
            if (unlisten) {
                unlisten();
            }
        };
    }
}

export default TauriStoreAdapter