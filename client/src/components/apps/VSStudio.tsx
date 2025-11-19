import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useDesktop } from "@/lib/desktop-context";
import type { Window, FileSystemNode } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, File, ChevronRight, ChevronDown, Plus, FolderPlus, Save } from "lucide-react";
import { Input } from "@/components/ui/input";

interface VSStudioProps {
  window: Window;
}

interface OpenFile {
  node: FileSystemNode;
  content: string;
}

export function VSStudio({ window }: VSStudioProps) {
  const { fileSystem, getNodeChildren, updateFileContent, createFile, createFolder } = useDesktop();
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["root"]));
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    // Open sample script on mount
    const sampleScript = fileSystem.find((node) => node.name === "hello.fxo");
    if (sampleScript && sampleScript.type === "file") {
      setOpenFiles([{ node: sampleScript, content: sampleScript.content || "" }]);
      setActiveFileId(sampleScript.id);
    }
  }, []);

  const activeFile = openFiles.find((f) => f.node.id === activeFileId);

  const handleFileClick = (node: FileSystemNode) => {
    if (node.type === "folder") {
      setExpandedFolders((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(node.id)) {
          newSet.delete(node.id);
        } else {
          newSet.add(node.id);
        }
        return newSet;
      });
    } else {
      // Open file
      const existing = openFiles.find((f) => f.node.id === node.id);
      if (existing) {
        setActiveFileId(node.id);
      } else {
        setOpenFiles((prev) => [...prev, { node, content: node.content || "" }]);
        setActiveFileId(node.id);
      }
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!activeFileId || !value) return;

    setOpenFiles((prev) =>
      prev.map((f) =>
        f.node.id === activeFileId ? { ...f, content: value } : f
      )
    );
  };

  const handleSave = () => {
    if (!activeFile) return;
    updateFileContent(activeFile.node.id, activeFile.content);
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    createFile("scripts", newFileName, "");
    setNewFileName("");
    setShowNewFileDialog(false);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolder("documents", newFolderName);
    setNewFolderName("");
    setShowNewFolderDialog(false);
  };

  const renderFileTree = (parentId: string | null, level: number = 0) => {
    const children = getNodeChildren(parentId);
    
    return children.map((node) => {
      const isExpanded = expandedFolders.has(node.id);
      const isFolder = node.type === "folder";

      return (
        <div key={node.id}>
          <button
            onClick={() => handleFileClick(node)}
            className={`w-full flex items-center gap-1 px-2 py-1 text-xs hover-elevate ${
              activeFileId === node.id ? "bg-accent" : ""
            }`}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            data-testid={`file-tree-item-${node.id}`}
          >
            {isFolder && (
              <span className="text-muted-foreground">
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </span>
            )}
            {isFolder ? (
              <Folder className="h-3 w-3 text-yellow-500" />
            ) : (
              <File className="h-3 w-3 text-blue-400" />
            )}
            <span className="truncate">{node.name}</span>
          </button>
          {isFolder && isExpanded && renderFileTree(node.id, level + 1)}
        </div>
      );
    });
  };

  return (
    <div className="h-full flex" data-testid="vs-studio-app">
      {/* File Explorer Sidebar */}
      <div className="w-64 border-r border-border bg-secondary flex flex-col">
        <div className="p-2 border-b border-border flex items-center justify-between">
          <span className="text-xs font-medium">EXPLORER</span>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setShowNewFileDialog(true)}
              data-testid="button-new-file"
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setShowNewFolderDialog(true)}
              data-testid="button-new-folder"
            >
              <FolderPlus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {renderFileTree("root")}
        </ScrollArea>

        {/* New File/Folder Dialogs */}
        {showNewFileDialog && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="bg-card border border-border rounded-md p-4 w-64">
              <h3 className="text-sm font-medium mb-2">New File</h3>
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="filename.fxo"
                className="mb-2"
                data-testid="input-new-file-name"
                onKeyDown={(e) => e.key === "Enter" && handleCreateFile()}
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setShowNewFileDialog(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleCreateFile} data-testid="button-create-file">
                  Create
                </Button>
              </div>
            </div>
          </div>
        )}

        {showNewFolderDialog && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="bg-card border border-border rounded-md p-4 w-64">
              <h3 className="text-sm font-medium mb-2">New Folder</h3>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="folder-name"
                className="mb-2"
                data-testid="input-new-folder-name"
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setShowNewFolderDialog(false)}>
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

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        {openFiles.length > 0 && (
          <div className="flex items-center gap-px bg-secondary border-b border-border">
            {openFiles.map((file) => (
              <button
                key={file.node.id}
                onClick={() => setActiveFileId(file.node.id)}
                className={`px-3 py-2 text-xs flex items-center gap-2 hover-elevate ${
                  activeFileId === file.node.id
                    ? "bg-card border-t-2 border-t-primary"
                    : "bg-secondary"
                }`}
                data-testid={`tab-${file.node.id}`}
              >
                <span>{file.node.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 relative">
          {activeFile ? (
            <>
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={activeFile.content}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
              <Button
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleSave}
                data-testid="button-save-file"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No file open</p>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="h-6 bg-primary px-3 flex items-center justify-between text-xs text-primary-foreground">
          <span>FluxoOS VS.Studio</span>
          {activeFile && <span>{activeFile.node.path}</span>}
        </div>
      </div>
    </div>
  );
}
