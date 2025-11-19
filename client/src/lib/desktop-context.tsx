import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { Window, App, DesktopIcon, FileSystemNode, ContextMenuItem } from "@shared/schema";
import { nanoid } from "nanoid";

interface DesktopContextType {
  windows: Window[];
  apps: App[];
  desktopIcons: DesktopIcon[];
  fileSystem: FileSystemNode[];
  focusedWindowId: string | null;
  nextZIndex: number;
  contextMenu: {
    x: number;
    y: number;
    items: ContextMenuItem[];
    data?: any;
  } | null;

  // Window operations
  openWindow: (appId: string, data?: Record<string, any>) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  updateWindowPosition: (windowId: string, x: number, y: number) => void;
  updateWindowSize: (windowId: string, width: number, height: number) => void;
  updateWindowData: (windowId: string, data: Record<string, any>) => void;

  // App operations
  installApp: (app: Omit<App, "id" | "installed">) => void;
  uninstallApp: (appId: string) => void;

  // File system operations
  createFile: (parentId: string | null, name: string, content?: string) => FileSystemNode;
  createFolder: (parentId: string | null, name: string) => FileSystemNode;
  deleteNode: (nodeId: string) => void;
  updateFileContent: (nodeId: string, content: string) => void;
  getNodeByPath: (path: string) => FileSystemNode | undefined;
  getNodeChildren: (nodeId: string | null) => FileSystemNode[];

  // Context menu operations
  showContextMenu: (x: number, y: number, items: ContextMenuItem[], data?: any) => void;
  hideContextMenu: () => void;
}

const DesktopContext = createContext<DesktopContextType | null>(null);

export function useDesktop() {
  const context = useContext(DesktopContext);
  if (!context) {
    throw new Error("useDesktop must be used within DesktopProvider");
  }
  return context;
}

const defaultApps: App[] = [
  {
    id: "terminal",
    name: "Terminal",
    type: "terminal",
    icon: "⌘",
    description: "Fluxo terminal with full scripting support",
    executable: "Terminal.fxo",
    installed: true,
    canMultiInstance: true,
  },
  {
    id: "vs-studio",
    name: "VS.Studio",
    type: "vs-studio",
    icon: "⚡",
    description: "Code editor with Fluxo syntax highlighting",
    executable: "VS.Studio.fxo",
    installed: true,
    canMultiInstance: false,
  },
  {
    id: "files",
    name: "Files",
    type: "files",
    icon: "📁",
    description: "File system explorer",
    executable: "Files.fxo",
    installed: true,
    canMultiInstance: false,
  },
  {
    id: "browser",
    name: "Browser",
    type: "browser",
    icon: "🌐",
    description: "Web browser simulation",
    executable: "Browser.fxo",
    installed: true,
    canMultiInstance: true,
  },
  {
    id: "web-store",
    name: "Web Store",
    type: "web-store",
    icon: "🛒",
    description: "Install additional applications",
    executable: "WebStore.fxo",
    installed: true,
    canMultiInstance: false,
  },
];

const defaultDesktopIcons: DesktopIcon[] = [
  { id: nanoid(), appId: "terminal", x: 20, y: 20, order: 0 },
  { id: nanoid(), appId: "vs-studio", x: 20, y: 140, order: 1 },
  { id: nanoid(), appId: "files", x: 20, y: 260, order: 2 },
  { id: nanoid(), appId: "browser", x: 20, y: 380, order: 3 },
  { id: nanoid(), appId: "web-store", x: 20, y: 500, order: 4 },
];

const defaultFileSystem: FileSystemNode[] = [
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

export function DesktopProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<Window[]>([]);
  const [apps, setApps] = useState<App[]>(defaultApps);
  const [desktopIcons, setDesktopIcons] = useState<DesktopIcon[]>(defaultDesktopIcons);
  const [fileSystem, setFileSystem] = useState<FileSystemNode[]>(defaultFileSystem);
  const [focusedWindowId, setFocusedWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(100);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
    data?: any;
  } | null>(null);

  const openWindow = useCallback(
    (appId: string, data?: Record<string, any>) => {
      const app = apps.find((a) => a.id === appId);
      if (!app) return;

      // Check if app allows multiple instances
      if (!app.canMultiInstance) {
        const existingWindow = windows.find((w) => w.appId === appId && w.status !== "closed");
        if (existingWindow) {
          focusWindow(existingWindow.id);
          return;
        }
      }

      const newWindow: Window = {
        id: `win-${nanoid()}`,
        title: app.name,
        appId: app.id,
        appType: app.type,
        x: 100 + windows.length * 30,
        y: 50 + windows.length * 30,
        width: 800,
        height: 600,
        status: "open",
        zIndex: nextZIndex,
        startTime: Date.now(),
        focused: true,
        data: data || {},
      };

      setWindows((prev) => [...prev, newWindow]);
      setFocusedWindowId(newWindow.id);
      setNextZIndex((prev) => prev + 1);
    },
    [apps, windows, nextZIndex]
  );

  const closeWindow = useCallback((windowId: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== windowId));
    setFocusedWindowId(null);
  }, []);

  const minimizeWindow = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, status: "minimized" as const, focused: false } : w
      )
    );
    setFocusedWindowId(null);
  }, []);

  const focusWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) =>
        prev.map((w) => {
          if (w.id === windowId) {
            return {
              ...w,
              status: "open" as const,
              focused: true,
              zIndex: nextZIndex,
            };
          }
          return { ...w, focused: false };
        })
      );
      setFocusedWindowId(windowId);
      setNextZIndex((prev) => prev + 1);
    },
    [nextZIndex]
  );

  const updateWindowPosition = useCallback((windowId: string, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, x, y } : w))
    );
  }, []);

  const updateWindowSize = useCallback((windowId: string, width: number, height: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, width, height } : w))
    );
  }, []);

  const updateWindowData = useCallback((windowId: string, data: Record<string, any>) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, data: { ...w.data, ...data } } : w))
    );
  }, []);

  const installApp = useCallback((app: Omit<App, "id" | "installed">) => {
    const newApp: App = {
      ...app,
      id: nanoid(),
      installed: true,
    };
    setApps((prev) => [...prev, newApp]);

    // Add to desktop
    const maxY = Math.max(...desktopIcons.map((icon) => icon.y), 0);
    setDesktopIcons((prev) => [
      ...prev,
      {
        id: nanoid(),
        appId: newApp.id,
        x: 20,
        y: maxY + 120,
        order: prev.length,
      },
    ]);
  }, [desktopIcons]);

  const uninstallApp = useCallback((appId: string) => {
    setApps((prev) => prev.filter((a) => a.id !== appId));
    setDesktopIcons((prev) => prev.filter((icon) => icon.appId !== appId));
    setWindows((prev) => prev.filter((w) => w.appId !== appId));
  }, []);

  const createFile = useCallback(
    (parentId: string | null, name: string, content?: string) => {
      const parent = parentId ? fileSystem.find((n) => n.id === parentId) : fileSystem.find((n) => n.path === "/");
      const path = parent ? `${parent.path === "/" ? "" : parent.path}/${name}` : `/${name}`;
      const extension = name.includes(".") ? name.split(".").pop() : undefined;

      const newFile: FileSystemNode = {
        id: nanoid(),
        name,
        type: "file",
        path,
        parentId: parentId || "root",
        content: content || "",
        extension,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      };

      setFileSystem((prev) => [...prev, newFile]);
      return newFile;
    },
    [fileSystem]
  );

  const createFolder = useCallback(
    (parentId: string | null, name: string) => {
      const parent = parentId ? fileSystem.find((n) => n.id === parentId) : fileSystem.find((n) => n.path === "/");
      const path = parent ? `${parent.path === "/" ? "" : parent.path}/${name}` : `/${name}`;

      const newFolder: FileSystemNode = {
        id: nanoid(),
        name,
        type: "folder",
        path,
        parentId: parentId || "root",
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      };

      setFileSystem((prev) => [...prev, newFolder]);
      return newFolder;
    },
    [fileSystem]
  );

  const deleteNode = useCallback((nodeId: string) => {
    setFileSystem((prev) => {
      // Recursively delete children
      const toDelete = [nodeId];
      const findChildren = (id: string) => {
        const children = prev.filter((n) => n.parentId === id);
        children.forEach((child) => {
          toDelete.push(child.id);
          findChildren(child.id);
        });
      };
      findChildren(nodeId);
      return prev.filter((n) => !toDelete.includes(n.id));
    });
  }, []);

  const updateFileContent = useCallback((nodeId: string, content: string) => {
    setFileSystem((prev) =>
      prev.map((n) =>
        n.id === nodeId ? { ...n, content, modifiedAt: Date.now() } : n
      )
    );
  }, []);

  const getNodeByPath = useCallback(
    (path: string) => {
      return fileSystem.find((n) => n.path === path);
    },
    [fileSystem]
  );

  const getNodeChildren = useCallback(
    (nodeId: string | null) => {
      return fileSystem.filter((n) => n.parentId === nodeId);
    },
    [fileSystem]
  );

  const showContextMenu = useCallback(
    (x: number, y: number, items: ContextMenuItem[], data?: any) => {
      setContextMenu({ x, y, items, data });
    },
    []
  );

  const hideContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const value: DesktopContextType = {
    windows,
    apps,
    desktopIcons,
    fileSystem,
    focusedWindowId,
    nextZIndex,
    contextMenu,
    openWindow,
    closeWindow,
    minimizeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    updateWindowData,
    installApp,
    uninstallApp,
    createFile,
    createFolder,
    deleteNode,
    updateFileContent,
    getNodeByPath,
    getNodeChildren,
    showContextMenu,
    hideContextMenu,
  };

  return <DesktopContext.Provider value={value}>{children}</DesktopContext.Provider>;
}
