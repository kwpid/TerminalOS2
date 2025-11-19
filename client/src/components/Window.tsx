import { useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { Minus, Square, X } from "lucide-react";
import { useDesktop } from "@/lib/desktop-context";
import type { Window as WindowType } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface WindowProps {
  window: WindowType;
  children: React.ReactNode;
}

export function Window({ window, children }: WindowProps) {
  const { closeWindow, minimizeWindow, focusWindow, updateWindowPosition, updateWindowSize } =
    useDesktop();
  const rndRef = useRef<Rnd>(null);

  const handleClose = () => {
    closeWindow(window.id);
  };

  const handleMinimize = () => {
    minimizeWindow(window.id);
  };

  const handleFocus = () => {
    if (!window.focused) {
      focusWindow(window.id);
    }
  };

  if (window.status === "minimized" || window.status === "closed") {
    return null;
  }

  return (
    <Rnd
      ref={rndRef}
      position={{ x: window.x, y: window.y }}
      size={{ width: window.width, height: window.height }}
      onDragStop={(e, d) => {
        updateWindowPosition(window.id, d.x, d.y);
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        updateWindowSize(
          window.id,
          parseInt(ref.style.width),
          parseInt(ref.style.height)
        );
        updateWindowPosition(window.id, position.x, position.y);
      }}
      minWidth={400}
      minHeight={300}
      bounds="parent"
      dragHandleClassName="window-drag-handle"
      onMouseDown={handleFocus}
      style={{
        zIndex: window.zIndex,
      }}
      className="window-container"
      data-testid={`window-${window.id}`}
    >
      <div className="flex flex-col h-full bg-card border border-card-border rounded-lg shadow-2xl overflow-hidden">
        {/* Title Bar */}
        <div
          className="window-drag-handle flex items-center justify-between h-8 px-3 bg-secondary border-b border-border no-select cursor-grab active:cursor-grabbing"
          data-testid={`window-title-${window.id}`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs font-medium truncate">{window.title}</span>
          </div>
          <div className="flex items-center gap-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-10 hover-elevate active-elevate-2"
              onClick={handleMinimize}
              data-testid={`button-minimize-${window.id}`}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-10 hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleClose}
              data-testid={`button-close-${window.id}`}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Window Content */}
        <div className="flex-1 overflow-hidden bg-card">{children}</div>
      </div>
    </Rnd>
  );
}
