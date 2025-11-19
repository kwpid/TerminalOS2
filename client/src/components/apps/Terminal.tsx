import { useState, useRef, useEffect } from "react";
import { useDesktop } from "@/lib/desktop-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { executeFluxoCommand } from "@/lib/fluxo-interpreter";
import type { Window } from "@shared/schema";

interface TerminalProps {
  window: Window;
}

interface TerminalLine {
  type: "command" | "output" | "error";
  content: string;
}

export function Terminal({ window }: TerminalProps) {
  const desktop = useDesktop();
  const [history, setHistory] = useState<TerminalLine[]>([
    {
      type: "output",
      content: "FluxoOS Terminal v1.0.0",
    },
    {
      type: "output",
      content: "Type 'help' for available commands.",
    },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-focus input when terminal opens
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (command: string) => {
    if (!command.trim()) return;

    // Handle clear command specially
    if (command.trim() === "clear") {
      setHistory([]);
      setCurrentInput("");
      return;
    }

    // Add command to history
    setHistory((prev) => [
      ...prev,
      {
        type: "command",
        content: `$ ${command}`,
      },
    ]);

    // Execute command
    try {
      const result = executeFluxoCommand(command, desktop, window);
      
      if (result) {
        setHistory((prev) => [
          ...prev,
          {
            type: "output",
            content: result,
          },
        ]);
      }
    } catch (error) {
      setHistory((prev) => [
        ...prev,
        {
          type: "error",
          content: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ]);
    }

    setCurrentInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(currentInput);
    }
  };

  return (
    <div
      className="h-full bg-black text-green-400 font-mono text-sm p-4 flex flex-col"
      onClick={() => inputRef.current?.focus()}
      data-testid="terminal-app"
    >
      <ScrollArea className="flex-1 mb-2">
        <div ref={scrollRef} className="space-y-1">
          {history.map((line, index) => (
            <div
              key={index}
              className={
                line.type === "command"
                  ? "text-blue-400"
                  : line.type === "error"
                  ? "text-red-400"
                  : "text-green-400"
              }
              data-testid={`terminal-line-${index}`}
            >
              {line.content}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Line */}
      <div className="flex items-center gap-2">
        <span className="text-blue-400">$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-green-400 font-mono caret-green-400"
          data-testid="input-terminal-command"
          autoFocus
        />
      </div>
    </div>
  );
}
