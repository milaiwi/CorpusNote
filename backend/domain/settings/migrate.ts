// backend/domain/settings/migrate.ts
import type { Settings } from "./schema"

// Stub for future migrations
// Allows us to add new fields to the settings schema without breaking existing code
export const migrateSettings = (raw: unknown): Settings => {
    const current = (raw as Partial<Settings>) ?? {}
    console.log(`Current vaultPath: `, current.vaultPath)
    current.vaultPath = current.vaultPath ?? "/Users/milaiwi/documents/notes"
    return {
        version: 1,
        theme: current.theme ?? "dark",
        vaultPath: current.vaultPath == '' ? "/Users/milaiwi/documents/notes" : current.vaultPath,
        configuredModels: current.configuredModels ?? [],
        selectedLocalModel: current.selectedLocalModel ?? undefined,
        selectedRemoteModel: current.selectedRemoteModel ?? undefined,
    }
}