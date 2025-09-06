// backend/domain/settings/schema.ts

import { z } from "zod"

export const SettingsSchema = z.object({
    version: z.literal(1),
    theme: z.enum(["light", "dark"]).default("dark"),
    vaultPath: z.string().default(""),
    selectedLocalModelId: z.string().optional(), // e.g., llama3.2, qwen2.5, etc.
    selectedRemoteModel: z.string().optional(),
    configuredModels: z.array(z.string()).default([]),
    embeddingModel: z.object({
        embeddingModelType: z.enum(["openai", "huggingface"]),
        embeddingModelName: z.string().optional(),
    }).optional(),
})

export type Settings = z.infer<typeof SettingsSchema>

export const defaultSettings: Settings = {
    version: 1,
    theme: "dark",
    vaultPath: "/Users/milaiwi/documents/notes",
    configuredModels: [],
    selectedLocalModelId: undefined,
    selectedRemoteModel: undefined,
    embeddingModel: {
        embeddingModelType: "huggingface",
        embeddingModelName: "Xenova/all-MiniLM-L6-v2"
    },
}