import { useState } from "react";
import { useDesktop } from "@/lib/desktop-context";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { Window } from "@shared/schema";

interface WebStoreProps {
  window: Window;
}

interface StoreApp {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  type: any;
}

const availableApps: StoreApp[] = [
  {
    id: "calculator",
    name: "Calculator",
    icon: "🔢",
    description: "Perform basic arithmetic calculations",
    category: "Utilities",
    type: "custom",
  },
  {
    id: "notepad",
    name: "Notepad",
    icon: "📝",
    description: "Simple text editor for quick notes",
    category: "Productivity",
    type: "custom",
  },
  {
    id: "music-player",
    name: "Music Player",
    icon: "🎵",
    description: "Play and manage your music library",
    category: "Entertainment",
    type: "custom",
  },
  {
    id: "image-viewer",
    name: "Image Viewer",
    icon: "🖼️",
    description: "View and browse images",
    category: "Graphics",
    type: "custom",
  },
  {
    id: "settings",
    name: "Settings",
    icon: "⚙️",
    description: "Configure system preferences",
    category: "System",
    type: "custom",
  },
  {
    id: "clock",
    name: "Clock",
    icon: "⏰",
    description: "View time and set alarms",
    category: "Utilities",
    type: "custom",
  },
];

export function WebStore({ window }: WebStoreProps) {
  const { apps, installApp } = useDesktop();
  const [searchQuery, setSearchQuery] = useState("");

  const installedAppIds = new Set(apps.map((app) => app.id));

  const filteredApps = availableApps.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInstall = (storeApp: StoreApp) => {
    installApp({
      name: storeApp.name,
      type: storeApp.type,
      icon: storeApp.icon,
      description: storeApp.description,
      executable: `${storeApp.id}.fxo`,
      canMultiInstance: true,
    });
  };

  return (
    <div className="h-full flex flex-col bg-card" data-testid="web-store-app">
      {/* Header */}
      <div className="p-4 border-b border-border bg-secondary">
        <h1 className="text-xl font-bold mb-3">Web Store</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-apps"
          />
        </div>
      </div>

      {/* App Grid */}
      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredApps.map((storeApp) => {
            const isInstalled = installedAppIds.has(storeApp.id);

            return (
              <div
                key={storeApp.id}
                className="p-4 bg-secondary border border-border rounded-lg hover:bg-accent/50 transition-colors"
                data-testid={`store-app-${storeApp.id}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-4xl flex-shrink-0">{storeApp.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">{storeApp.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {storeApp.category}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {storeApp.description}
                </p>

                {isInstalled ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    disabled
                    data-testid={`button-installed-${storeApp.id}`}
                  >
                    Installed
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleInstall(storeApp)}
                    data-testid={`button-install-${storeApp.id}`}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Install
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">No applications found</p>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-secondary">
        <p className="text-xs text-muted-foreground text-center">
          {availableApps.length} applications available
        </p>
      </div>
    </div>
  );
}
