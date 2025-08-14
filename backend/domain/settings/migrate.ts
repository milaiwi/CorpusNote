// backend/domain/settings/migrate.ts
import type { Settings } from "./schema"
import { defaultSettings } from "./schema"

// Stub for future migrations
// Allows us to add new fields to the settings schema without breaking existing code
export const migrateSettings = (raw: unknown): Settings => {
    const current = (raw as Partial<Settings>) ?? {}
    current.vaultPath = current.vaultPath ?? "/Users/milaiwi/documents/notes"
    return {
        version: 1,
        theme: current.theme ?? defaultSettings.theme,
        vaultPath: current.vaultPath == '' ? defaultSettings.vaultPath : current.vaultPath,
        configuredModels: current.configuredModels ?? defaultSettings.configuredModels,
        selectedLocalModel: current.selectedLocalModel ?? defaultSettings.selectedLocalModel,
        selectedRemoteModel: current.selectedRemoteModel ?? defaultSettings.selectedRemoteModel,
        embeddingModel: current.embeddingModel ?? defaultSettings.embeddingModel,
    }
}