// frontend/src/components/Settings/TauriStore
import { Store } from "tauri-plugin-store-api"

class TauriStore {
    private store: any = null

    constructor (storeName: string = '.corpus-settings.dat') {
        this.store = new Store(storeName)
    }

    async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
        try {
            if (this.store) {
                const value = await this.store.get(key)
                return value !== null ? value : defaultValue
            } else {
                console.log(`this.store does not exist`)
            }
        } catch (error) {
            console.error(`Failed to get value.`)
        }
    }

    async set<T>(key: string, value: T): Promise<void> {
        try {
            if (this.store) {
                await this.store.set(key, value)
                await this.store.save()
            }   else {
                console.log(`this.store does not exist`)
            }
        } catch (error) {
            console.error(`Failed to get value.`)
        }
    }
}

export default TauriStore