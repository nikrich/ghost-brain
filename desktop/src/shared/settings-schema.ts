import { z } from 'zod';

export const settingsSchema = z.object({
  theme: z.enum(['dark', 'light']),
  density: z.enum(['comfortable', 'compact']),
  vaultPath: z.string().min(1),

  dailyNoteEnabled: z.boolean(),
  markdownFrontmatter: z.boolean(),
  autoLinkMentions: z.boolean(),

  cloudSync: z.boolean(),
  e2eEncryption: z.boolean(),
  telemetry: z.boolean(),
  llmProvider: z.enum(['local', 'anthropic', 'openai']),

  autoRecordFromCalendar: z.boolean(),
  diarizeSpeakers: z.boolean(),
  extractActionItems: z.boolean(),
  audioRetention: z.enum(['30d', '7d', 'immediate', 'forever']),
  transcriptModel: z.enum(['whisper-large-v3', 'whisper-medium']),

  folderStructure: z.enum(['by-source', 'by-date', 'by-person']),
});

export type SettingsKey = keyof z.infer<typeof settingsSchema>;
