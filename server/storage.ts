import type {
  Window,
  InsertWindow,
  App,
  InsertApp,
  FileSystemNode,
  InsertFileSystemNode,
  DesktopIcon,
  InsertDesktopIcon,
  SystemState,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // File System
  getFileSystem(): Promise<FileSystemNode[]>;
  getNodeById(id: string): Promise<FileSystemNode | undefined>;
  getNodeByPath(path: string): Promise<FileSystemNode | undefined>;
  getNodeChildren(parentId: string | null): Promise<FileSystemNode[]>;
  createNode(node: InsertFileSystemNode): Promise<FileSystemNode>;
  updateNodeContent(id: string, content: string): Promise<FileSystemNode | undefined>;
  deleteNode(id: string): Promise<void>;

  // Apps
  getApps(): Promise<App[]>;
  getAppById(id: string): Promise<App | undefined>;
  createApp(app: InsertApp): Promise<App>;
  updateApp(id: string, app: Partial<App>): Promise<App | undefined>;
  deleteApp(id: string): Promise<void>;

  // Desktop State
  getSystemState(): Promise<SystemState | undefined>;
  saveSystemState(state: SystemState): Promise<void>;

  // Desktop Icons
  getDesktopIcons(): Promise<DesktopIcon[]>;
  createDesktopIcon(icon: InsertDesktopIcon): Promise<DesktopIcon>;
  updateDesktopIcon(id: string, icon: Partial<DesktopIcon>): Promise<DesktopIcon | undefined>;
  deleteDesktopIcon(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private fileSystem: Map<string, FileSystemNode>;
  private apps: Map<string, App>;
  private desktopIcons: Map<string, DesktopIcon>;
  private systemState: SystemState | undefined;

  constructor() {
    this.fileSystem = new Map();
    this.apps = new Map();
    this.desktopIcons = new Map();
    this.systemState = undefined;

    // Initialize default file system
    this.initializeDefaultFileSystem();
  }

  private initializeDefaultFileSystem() {
    const defaultNodes: FileSystemNode[] = [
      {
        id: "root",
        name: "/",
        type: "folder",
        path: "/",
        parentId: null,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
      {
        id: "system",
        name: "System",
        type: "folder",
        path: "/System",
        parentId: "root",
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
      {
        id: "library",
        name: "Library",
        type: "folder",
        path: "/System/Library",
        parentId: "system",
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
      {
        id: "ui",
        name: "UI",
        type: "folder",
        path: "/System/Library/UI",
        parentId: "library",
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
      {
        id: "components",
        name: "Components",
        type: "folder",
        path: "/System/Library/UI/Components",
        parentId: "ui",
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
      {
        id: "documents",
        name: "Documents",
        type: "folder",
        path: "/Documents",
        parentId: "root",
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
      {
        id: "scripts",
        name: "Scripts",
        type: "folder",
        path: "/Documents/Scripts",
        parentId: "documents",
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
      {
        id: "sample-script",
        name: "hello.fxo",
        type: "file",
        path: "/Documents/Scripts/hello.fxo",
        parentId: "scripts",
        extension: "fxo",
        content: `// Sample Fluxo Script
console.log:("Hello from Fluxo!")

// Window manipulation example
local win = window("win-1")
win.move:(100, 100)
win.resize:(800, 600)`,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      },
    ];

    defaultNodes.forEach((node) => {
      this.fileSystem.set(node.id, node);
    });
  }

  // File System Methods
  async getFileSystem(): Promise<FileSystemNode[]> {
    return Array.from(this.fileSystem.values());
  }

  async getNodeById(id: string): Promise<FileSystemNode | undefined> {
    return this.fileSystem.get(id);
  }

  async getNodeByPath(path: string): Promise<FileSystemNode | undefined> {
    return Array.from(this.fileSystem.values()).find((node) => node.path === path);
  }

  async getNodeChildren(parentId: string | null): Promise<FileSystemNode[]> {
    return Array.from(this.fileSystem.values()).filter((node) => node.parentId === parentId);
  }

  async createNode(insertNode: InsertFileSystemNode): Promise<FileSystemNode> {
    const id = randomUUID();
    const node: FileSystemNode = {
      ...insertNode,
      id,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
    this.fileSystem.set(id, node);
    return node;
  }

  async updateNodeContent(id: string, content: string): Promise<FileSystemNode | undefined> {
    const node = this.fileSystem.get(id);
    if (!node) return undefined;

    const updatedNode = {
      ...node,
      content,
      modifiedAt: Date.now(),
    };
    this.fileSystem.set(id, updatedNode);
    return updatedNode;
  }

  async deleteNode(id: string): Promise<void> {
    // Recursively delete children
    const children = await this.getNodeChildren(id);
    for (const child of children) {
      await this.deleteNode(child.id);
    }
    this.fileSystem.delete(id);
  }

  // App Methods
  async getApps(): Promise<App[]> {
    return Array.from(this.apps.values());
  }

  async getAppById(id: string): Promise<App | undefined> {
    return this.apps.get(id);
  }

  async createApp(insertApp: InsertApp): Promise<App> {
    const id = randomUUID();
    const app: App = {
      ...insertApp,
      id,
      installed: true,
    };
    this.apps.set(id, app);
    return app;
  }

  async updateApp(id: string, updates: Partial<App>): Promise<App | undefined> {
    const app = this.apps.get(id);
    if (!app) return undefined;

    const updatedApp = { ...app, ...updates };
    this.apps.set(id, updatedApp);
    return updatedApp;
  }

  async deleteApp(id: string): Promise<void> {
    this.apps.delete(id);
  }

  // System State Methods
  async getSystemState(): Promise<SystemState | undefined> {
    return this.systemState;
  }

  async saveSystemState(state: SystemState): Promise<void> {
    this.systemState = state;
  }

  // Desktop Icon Methods
  async getDesktopIcons(): Promise<DesktopIcon[]> {
    return Array.from(this.desktopIcons.values());
  }

  async createDesktopIcon(insertIcon: InsertDesktopIcon): Promise<DesktopIcon> {
    const id = randomUUID();
    const icon: DesktopIcon = {
      ...insertIcon,
      id,
    };
    this.desktopIcons.set(id, icon);
    return icon;
  }

  async updateDesktopIcon(id: string, updates: Partial<DesktopIcon>): Promise<DesktopIcon | undefined> {
    const icon = this.desktopIcons.get(id);
    if (!icon) return undefined;

    const updatedIcon = { ...icon, ...updates };
    this.desktopIcons.set(id, updatedIcon);
    return updatedIcon;
  }

  async deleteDesktopIcon(id: string): Promise<void> {
    this.desktopIcons.delete(id);
  }
}

export const storage = new MemStorage();
