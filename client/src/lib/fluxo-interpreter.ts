import type { Window } from "@shared/schema";

interface DesktopContext {
  windows: Window[];
  apps: any[];
  fileSystem: any[];
  focusedWindowId: string | null;
  openWindow: (appId: string, data?: Record<string, any>) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  updateWindowPosition: (windowId: string, x: number, y: number) => void;
  updateWindowSize: (windowId: string, width: number, height: number) => void;
  createFile: (parentId: string | null, name: string, content?: string) => any;
  createFolder: (parentId: string | null, name: string) => any;
  getNodeByPath: (path: string) => any;
  getNodeChildren: (nodeId: string | null) => any[];
}

// Fluxo module storage
const fluxoModules: Record<string, any> = {};

export function executeFluxoCommand(
  command: string,
  desktop: DesktopContext,
  currentWindow: Window
): string {
  const trimmed = command.trim();

  // Handle built-in commands
  if (trimmed === "help") {
    return `Available commands:
  help - Show this help message
  clear - Clear the terminal
  ls [path] - List files and folders
  cd <path> - Change directory (not implemented)
  cat <file> - Display file contents
  window <id> - Get window object
  windows - List all open windows
  apps - List all installed apps
  console.log:(<message>) - Print a message
  
Window methods (on window object):
  .move:(<x>, <y>) - Move window to position
  .resize:(<width>, <height>) - Resize window
  .close:() - Close window
  .focus:() - Focus window
  
File system commands:
  mkdir <name> - Create a folder
  touch <name> - Create a file
  
Module system:
  require("<path>") - Import a module
  module <name> { ... } - Define a module
  export function <name>(...) { ... } - Export a function`;
  }

  if (trimmed === "clear") {
    // This will be handled by the Terminal component
    return "";
  }

  if (trimmed === "windows") {
    return desktop.windows
      .filter((w) => w.status !== "closed")
      .map(
        (w) =>
          `${w.id}: ${w.title} (${w.x},${w.y}) ${w.width}x${w.height} [${w.status}]`
      )
      .join("\n");
  }

  if (trimmed === "apps") {
    return desktop.apps
      .filter((a) => a.installed)
      .map((a) => `${a.id}: ${a.name} - ${a.description}`)
      .join("\n");
  }

  if (trimmed.startsWith("ls")) {
    const parts = trimmed.split(" ");
    const path = parts[1] || "/";
    const node = desktop.getNodeByPath(path);
    
    if (!node) {
      return `ls: ${path}: No such file or directory`;
    }

    if (node.type === "file") {
      return node.name;
    }

    const children = desktop.getNodeChildren(node.id);
    if (children.length === 0) {
      return "(empty directory)";
    }

    return children
      .map((child) => `${child.type === "folder" ? "📁" : "📄"} ${child.name}`)
      .join("\n");
  }

  if (trimmed.startsWith("cat ")) {
    const filename = trimmed.substring(4).trim();
    const node = desktop.getNodeByPath(filename);
    
    if (!node) {
      return `cat: ${filename}: No such file or directory`;
    }

    if (node.type === "folder") {
      return `cat: ${filename}: Is a directory`;
    }

    return node.content || "(empty file)";
  }

  if (trimmed.startsWith("mkdir ")) {
    const name = trimmed.substring(6).trim();
    desktop.createFolder(null, name);
    return `Created folder: ${name}`;
  }

  if (trimmed.startsWith("touch ")) {
    const name = trimmed.substring(6).trim();
    desktop.createFile(null, name, "");
    return `Created file: ${name}`;
  }

  // Fluxo script execution
  try {
    return executeFluxoScript(trimmed, desktop, currentWindow);
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

function executeFluxoScript(
  script: string,
  desktop: DesktopContext,
  currentWindow: Window
): string {
  let output = "";

  // Handle console.log:() FIRST before window method matching
  const consoleLogRegex = /console\.log:\((.*?)\)/g;
  let match;
  
  while ((match = consoleLogRegex.exec(script)) !== null) {
    const arg = match[1].trim();
    const value = evaluateFluxoExpression(arg, desktop, currentWindow);
    output += value + "\n";
  }

  // If console.log was found, return early (don't process as window methods)
  if (output) {
    return output.trim();
  }

  // Handle window() calls
  const windowRegex = /(?:local|var)\s+(\w+)\s*=\s*window\("([^"]+)"\)/g;
  const windowVars: Record<string, Window | undefined> = {};
  
  while ((match = windowRegex.exec(script)) !== null) {
    const varName = match[1];
    const windowId = match[2];
    const win = desktop.windows.find((w) => w.id === windowId);
    windowVars[varName] = win;
  }

  // Handle window methods (but NOT console.log)
  const methodRegex = /(?!console\.)(\w+)\.(\w+):\((.*?)\)/g;
  
  while ((match = methodRegex.exec(script)) !== null) {
    const varName = match[1];
    const method = match[2];
    const args = match[3]
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a);

    const win = windowVars[varName];
    
    if (!win) {
      output += `Error: Window variable '${varName}' not found\n`;
      continue;
    }

    switch (method) {
      case "move": {
        const [x, y] = args.map(Number);
        if (!isNaN(x) && !isNaN(y)) {
          desktop.updateWindowPosition(win.id, x, y);
          output += `Moved window ${win.id} to (${x}, ${y})\n`;
        }
        break;
      }
      case "resize": {
        const [width, height] = args.map(Number);
        if (!isNaN(width) && !isNaN(height)) {
          desktop.updateWindowSize(win.id, width, height);
          output += `Resized window ${win.id} to ${width}x${height}\n`;
        }
        break;
      }
      case "close":
        desktop.closeWindow(win.id);
        output += `Closed window ${win.id}\n`;
        break;
      case "focus":
        desktop.focusWindow(win.id);
        output += `Focused window ${win.id}\n`;
        break;
      default:
        output += `Unknown method: ${method}\n`;
    }
  }

  return output.trim() || "(command executed)";
}

function evaluateFluxoExpression(
  expr: string,
  desktop: DesktopContext,
  currentWindow: Window
): string {
  // Remove quotes if it's a string literal
  if (expr.startsWith('"') && expr.endsWith('"')) {
    return expr.slice(1, -1);
  }

  if (expr.startsWith("'") && expr.endsWith("'")) {
    return expr.slice(1, -1);
  }

  // Try to evaluate as number
  const num = Number(expr);
  if (!isNaN(num)) {
    return String(num);
  }

  // Otherwise return as-is
  return expr;
}
