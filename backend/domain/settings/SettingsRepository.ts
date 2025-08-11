// backend/domain/settings/SettingsRepository.ts
import type { KeyValueStore } from "../../api/schema"
import { type Settings, SettingsSchema, defaultSettings } from "./schema"
import { migrateSettings } from "./migrate"

const KEY = ".settings.dat"

export class SettingsRepository {
    constructor(private readonly store: KeyValueStore) {}

    async load(): Promise<Settings> {
        const raw = await this.store.get(KEY)
        if (raw === undefined) {
            await this.store.set(KEY, defaultSettings)
            await this.store.save()
            return defaultSettings
        }
        const migrated = migrateSettings(raw)
        const parsed = SettingsSchema.parse(migrated) // validate
        if (JSON.stringify(parsed) === JSON.stringify(defaultSettings)) {
            await this.store.set(KEY, parsed)
            await this.store.save()
        }
        return parsed
    }

    async update(patch: Partial<Omit<Settings, "version">>): Promise<Settings> {
        const current = await this.load()
        console.log(`Updating settings: `, current, patch)
        const updated = { ...current, ...patch }
        await this.store.set(KEY, updated)
        await this.store.save()
        return updated
    }

    async reset(): Promise<Settings> {
        await this.store.set(KEY, defaultSettings)
        await this.store.save()
        return defaultSettings
    }

    watch?(handler: (next: Settings) => void): () => void {
        if (!this.store.onChange) {
            return () => {}
        }
        return this.store.onChange(async (changedKey) => {
            if (changedKey === KEY) {
                const next = await this.load()
                handler(next)
            }
        })
    }
}