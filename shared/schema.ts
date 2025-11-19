import { z } from "zod";

// Window status types
export const windowStatusSchema = z.enum(["open", "minimized", "closed"]);
export type WindowStatus = z.infer<typeof windowStatusSchema>;

// File system node types
export const fileSystemNodeTypeSchema = z.enum(["file", "folder"]);
export type FileSystemNodeType = z.infer<typeof fileSystemNodeTypeSchema>;

// App types
export const appTypeSchema = z.enum([
  "terminal",
  "vs-studio",
  "files",
  "browser",
  "web-store",
  "properties",
  "custom"
]);
export type AppType = z.infer<typeof appTypeSchema>;

// Window schema
export const windowSchema = z.object({
  id: z.string(),
  title: z.string(),
  appId: z.string(),
  appType: appTypeSchema,
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  status: windowStatusSchema,
  zIndex: z.number(),
  startTime: z.number(),
  focused: z.boolean(),
  data: z.record(z.any()).optional(), // App-specific data
});

export type Window = z.infer<typeof windowSchema>;

export const insertWindowSchema = windowSchema.omit({
  id: true,
  startTime: true,
});

export type InsertWindow = z.infer<typeof insertWindowSchema>;

// App schema
export const appSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: appTypeSchema,
  icon: z.string(), // Icon identifier or emoji
  description: z.string().optional(),
  executable: z.string(), // .fxo file path
  installed: z.boolean(),
  canMultiInstance: z.boolean().default(true),
});

export type App = z.infer<typeof appSchema>;

export const insertAppSchema = appSchema.omit({
  id: true,
});

export type InsertApp = z.infer<typeof insertAppSchema>;

// File system node schema
export const fileSystemNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: fileSystemNodeTypeSchema,
  path: z.string(),
  parentId: z.string().nullable(),
  content: z.string().optional(), // For files
  extension: z.string().optional(), // File extension
  createdAt: z.number(),
  modifiedAt: z.number(),
});

export type FileSystemNode = z.infer<typeof fileSystemNodeSchema>;

export const insertFileSystemNodeSchema = fileSystemNodeSchema.omit({
  id: true,
  createdAt: true,
  modifiedAt: true,
});

export type InsertFileSystemNode = z.infer<typeof insertFileSystemNodeSchema>;

// Desktop icon schema
export const desktopIconSchema = z.object({
  id: z.string(),
  appId: z.string(),
  x: z.number(),
  y: z.number(),
  order: z.number(),
});

export type DesktopIcon = z.infer<typeof desktopIconSchema>;

export const insertDesktopIconSchema = desktopIconSchema.omit({
  id: true,
});

export type InsertDesktopIcon = z.infer<typeof insertDesktopIconSchema>;

// Fluxo module schema
export const fluxoModuleSchema = z.object({
  name: z.string(),
  path: z.string(),
  exports: z.record(z.any()),
  code: z.string(),
});

export type FluxoModule = z.infer<typeof fluxoModuleSchema>;

// Context menu item schema
export const contextMenuItemSchema = z.object({
  label: z.string(),
  action: z.string(),
  icon: z.string().optional(),
  divider: z.boolean().optional(),
  disabled: z.boolean().optional(),
});

export type ContextMenuItem = z.infer<typeof contextMenuItemSchema>;

// System state schema (for persistence)
export const systemStateSchema = z.object({
  windows: z.array(windowSchema),
  desktopIcons: z.array(desktopIconSchema),
  nextZIndex: z.number(),
  background: z.string().optional(),
});

export type SystemState = z.infer<typeof systemStateSchema>;

// Keep existing user schema for compatibility
export const users = {
  id: "",
  username: "",
  password: "",
} as const;

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = {
  id: string;
  username: string;
  password: string;
};
