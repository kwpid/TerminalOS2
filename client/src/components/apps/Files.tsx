import { useState } from "react";
import { useDesktop } from "@/lib/desktop-context";
import type { Window, FileSystemNode } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, File, ChevronRight, FolderPlus, FilePlus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FilesProps {
  window: Window;
}

export function Files({ window }: FilesProps) {
  const { fileSystem, getNodeChildren, createFile, createFolder, deleteNode } = useDesktop();
  const [currentPath, setCurrentPath] = useState("/");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const currentNode = fileSystem.find((node) => node.path === currentPath) || fileSystem[0];
  const children = getNodeChildren(currentNode?.id || "root");

  const handleNavigate = (node: FileSystemNode) => {
    if (node.type === "folder") {
      setCurrentPath(node.path);
    }
  };

  const handleCreateFile = () => {
    if (!newItemName.trim()) return;
    createFile(currentNode.id, newItemName, "");
    setNewItemName("");
    setShowNewFileDialog(false);
  };

  const handleCreateFolder = () => {
    if (!newItemName.trim()) return;
    createFolder(currentNode.id, newItemName);
    setNewItemName("");
    setShowNewFolderDialog(false);
  };

  const handleDelete = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this item?")) {
      deleteNode(nodeId);
    }
  };

  const pathParts = currentPath.split("/").filter(Boolean);

  return (
    <div className="h-full flex flex-col bg-card" data-testid="files-app">
      {/* Toolbar */}
      <div className="h-10 px-3 flex items-center gap-2 border-b border-border bg-secondary">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowNewFolderDialog(true)}
          data-testid="button-new-folder"
        >
          <FolderPlus className="h-4 w-4 mr-1" />
          New Folder
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowNewFileDialog(true)}
          data-testid="button-new-file"
        >
          <FilePlus className="h-4 w-4 mr-1" />
          New File
        </Button>
      </div>

      {/* Breadcrumb */}
      <div className="px-3 py-2 border-b border-border flex items-center gap-1 text-xs">
        <button
          onClick={() => setCurrentPath("/")}
          className="hover:text-primary hover-elevate px-2 py-1 rounded"
          data-testid="breadcrumb-root"
        >
          /
        </button>
        {pathParts.map((part, index) => {
          const path = "/" + pathParts.slice(0, index + 1).join("/");
          return (
            <div key={index} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <button
                onClick={() => setCurrentPath(path)}
                className="hover:text-primary hover-elevate px-2 py-1 rounded"
                data-testid={`breadcrumb-${part}`}
              >
                {part}
              </button>
            </div>
          );
        })}
      </div>

      {/* File List */}
      <ScrollArea className="flex-1 p-3">
        {children.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">This folder is empty</p>
          </div>
        ) : (
          <div className="space-y-1">
            {children.map((node) => (
              <div
                key={node.id}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent cursor-pointer group"
                onClick={() => handleNavigate(node)}
                data-testid={`file-item-${node.id}`}
              >
                {node.type === "folder" ? (
                  <Folder className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                ) : (
                  <File className="h-5 w-5 text-blue-400 flex-shrink-0" />
                )}
                <span className="flex-1 text-sm truncate">{node.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => handleDelete(node.id, e)}
                  data-testid={`button-delete-${node.id}`}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* New File Dialog */}
      {showNewFileDialog && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <div className="bg-card border border-border rounded-md p-4 w-80">
            <h3 className="text-sm font-medium mb-3">New File</h3>
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="filename.txt"
              className="mb-3"
              data-testid="input-new-file-name"
              onKeyDown={(e) => e.key === "Enter" && handleCreateFile()}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowNewFileDialog(false);
                  setNewItemName("");
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateFile} data-testid="button-create-file">
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <div className="bg-card border border-border rounded-md p-4 w-80">
            <h3 className="text-sm font-medium mb-3">New Folder</h3>
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="folder-name"
              className="mb-3"
              data-testid="input-new-folder-name"
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowNewFolderDialog(false);
                  setNewItemName("");
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateFolder} data-testid="button-create-folder">
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
