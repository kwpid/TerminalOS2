import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useDesktop } from "@/lib/desktop-context";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface StartMenuProps {
  onClose: () => void;
  onOpenApp: (appId: string) => void;
}

export function StartMenu({ onClose, onOpenApp }: StartMenuProps) {
  const { apps } = useDesktop();
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const installedApps = apps.filter((app) => app.installed);

  const filteredApps = installedApps.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed bottom-14 left-2 w-[500px] h-[600px] bg-card/95 backdrop-blur-xl border border-border rounded-t-lg shadow-2xl z-50 flex flex-col"
      data-testid="start-menu"
    >
      {/* Search Bar */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-apps"
          />
        </div>
      </div>

      {/* Apps Grid */}
      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-4 gap-3">
          {filteredApps.map((app) => (
            <button
              key={app.id}
              onClick={() => onOpenApp(app.id)}
              className="flex flex-col items-center gap-2 p-3 rounded-md hover-elevate active-elevate-2 transition-colors"
              data-testid={`start-menu-app-${app.id}`}
            >
              <div className="text-4xl">{app.icon}</div>
              <span className="text-xs text-center line-clamp-2">{app.name}</span>
            </button>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">No apps found</p>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          {installedApps.length} apps installed
        </p>
      </div>
    </div>
  );
}
