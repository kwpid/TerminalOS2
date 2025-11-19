import { useState, useEffect } from "react";
import { Grid3X3, Clock } from "lucide-react";
import { useDesktop } from "@/lib/desktop-context";
import { Button } from "@/components/ui/button";
import { StartMenu } from "./StartMenu";
import { formatTime } from "@/lib/utils";

export function Taskbar() {
  const { windows, apps, openWindow, focusWindow, minimizeWindow, closeWindow, showContextMenu } = useDesktop();
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const openWindows = windows.filter((w) => w.status !== "closed");

  const handleWindowClick = (windowId: string) => {
    const window = windows.find((w) => w.id === windowId);
    if (window?.status === "minimized") {
      focusWindow(windowId);
    } else if (window?.focused) {
      // If already focused, minimize it
      minimizeWindow(windowId);
    } else {
      focusWindow(windowId);
    }
  };

  const handleWindowRightClick = (e: React.MouseEvent, windowId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const window = windows.find((w) => w.id === windowId);
    if (!window) return;

    showContextMenu(
      e.clientX,
      e.clientY,
      [
        {
          label: "Restore",
          action: "restore",
          icon: "↗",
        },
        {
          label: "Properties",
          action: "properties",
          icon: "ℹ",
        },
        {
          label: "Close",
          action: "close",
          icon: "✕",
        },
      ],
      { windowId, window }
    );
  };

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 h-12 bg-card/95 backdrop-blur-md border-t border-border z-50 flex items-center px-2 gap-1"
        data-testid="taskbar"
      >
        {/* Start Menu Button */}
        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-12 hover-elevate active-elevate-2"
          onClick={() => setStartMenuOpen(!startMenuOpen)}
          data-testid="button-start-menu"
        >
          <Grid3X3 className="h-5 w-5" />
        </Button>

        {/* Running Apps */}
        <div className="flex items-center gap-1 flex-1">
          {openWindows.map((window) => {
            const app = apps.find((a) => a.id === window.appId);
            if (!app) return null;

            return (
              <Button
                key={window.id}
                variant="ghost"
                size="sm"
                className={`h-10 px-3 gap-2 hover-elevate active-elevate-2 ${
                  window.focused ? "bg-accent" : ""
                }`}
                onClick={() => handleWindowClick(window.id)}
                onContextMenu={(e) => handleWindowRightClick(e, window.id)}
                data-testid={`taskbar-window-${window.id}`}
              >
                <span className="text-base">{app.icon}</span>
                <span className="text-xs max-w-[120px] truncate">{window.title}</span>
              </Button>
            );
          })}
        </div>

        {/* System Tray */}
        <div className="flex items-center gap-3 px-3">
          <div className="flex items-center gap-2 text-xs font-medium" data-testid="text-time">
            <Clock className="h-4 w-4" />
            <span>{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* Start Menu */}
      {startMenuOpen && (
        <StartMenu
          onClose={() => setStartMenuOpen(false)}
          onOpenApp={(appId) => {
            openWindow(appId);
            setStartMenuOpen(false);
          }}
        />
      )}
    </>
  );
}
