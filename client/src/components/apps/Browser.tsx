import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Window } from "@shared/schema";

interface BrowserProps {
  window: Window;
}

const defaultPages = {
  "fluxoos://home": {
    title: "FluxoOS Home",
    content: (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Welcome to FluxoOS Browser</h1>
        <p className="text-lg text-muted-foreground mb-8">
          A simulated web browser for your desktop OS experience.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-card border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
            <p className="text-sm text-muted-foreground">
              Navigate to predefined pages or create your own content.
            </p>
          </div>
          
          <div className="p-6 bg-card border border-border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">About FluxoOS</h2>
            <p className="text-sm text-muted-foreground">
              A fully-featured desktop simulator with Fluxo scripting support.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  "fluxoos://about": {
    title: "About FluxoOS",
    content: (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">About FluxoOS</h1>
        <p className="text-muted-foreground mb-4">
          FluxoOS is a browser-based desktop operating system simulator featuring:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Draggable, resizable windows</li>
          <li>Fluxo scripting language with terminal support</li>
          <li>VS.Studio code editor with Monaco</li>
          <li>File system simulation</li>
          <li>Web browser and app store</li>
          <li>Full desktop experience in your browser</li>
        </ul>
      </div>
    ),
  },
};

export function Browser({ window }: BrowserProps) {
  const [url, setUrl] = useState("fluxoos://home");
  const [inputUrl, setInputUrl] = useState("fluxoos://home");
  const [history, setHistory] = useState<string[]>(["fluxoos://home"]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const currentPage = defaultPages[url as keyof typeof defaultPages];

  const navigate = (newUrl: string) => {
    setUrl(newUrl);
    setInputUrl(newUrl);
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), newUrl]);
    setHistoryIndex((prev) => prev + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(inputUrl);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setUrl(history[newIndex]);
      setInputUrl(history[newIndex]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setUrl(history[newIndex]);
      setInputUrl(history[newIndex]);
    }
  };

  const refresh = () => {
    navigate(url);
  };

  const goHome = () => {
    navigate("fluxoos://home");
  };

  return (
    <div className="h-full flex flex-col bg-card" data-testid="browser-app">
      {/* Navigation Bar */}
      <div className="h-12 px-3 flex items-center gap-2 border-b border-border bg-secondary">
        <Button
          size="icon"
          variant="ghost"
          onClick={goBack}
          disabled={historyIndex === 0}
          className="h-9 w-9"
          data-testid="button-back"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={goForward}
          disabled={historyIndex === history.length - 1}
          className="h-9 w-9"
          data-testid="button-forward"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={refresh}
          className="h-9 w-9"
          data-testid="button-refresh"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={goHome}
          className="h-9 w-9"
          data-testid="button-home"
        >
          <Home className="h-4 w-4" />
        </Button>

        {/* Address Bar */}
        <form onSubmit={handleSubmit} className="flex-1">
          <Input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter URL..."
            className="h-9 bg-input rounded-full"
            data-testid="input-url"
          />
        </form>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-background">
        {currentPage ? (
          currentPage.content
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
              <p className="text-muted-foreground mb-4">
                The page "{url}" could not be found.
              </p>
              <Button onClick={goHome} data-testid="button-go-home">
                Go Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
