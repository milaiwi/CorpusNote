// frontend/src/components/Settings/TauriStore
import { Store } from '@tauri-apps/plugin-store'

class TauriStore {
    private storeName: string
    private store: any = null
    private isInitialized: boolean = false

    constructor (storeName: string = '.corpus-settings.dat') {
        this.storeName = storeName
    }

    async init() {
        console.log(`Inside init(): are we initialized? ${this.isInitialized}`)
        if (!this.isInitialized) {
            try {
                console.log(`Loading store at: ${this.storeName}`)
                this.store = await Store.load(this.storeName)
                console.log(`Loading in: ${this.store}`)
            } catch (error) {
                console.error(`Failed to initialize TauriStore`)
            }
            this.isInitialized = true
        }
    }

    async get<T>(key: string, defaultValue?: T): Promise<T | undefined> {
        console.log(`Inside get, calling init.`)
        await this.init()

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
        await this.init()

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