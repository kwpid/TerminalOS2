import { useEffect, useRef } from "react";
import { useDesktop } from "@/lib/desktop-context";
import type { ContextMenuItem } from "@shared/schema";

export function ContextMenu() {
  const { contextMenu, hideContextMenu, openWindow, closeWindow, focusWindow, minimizeWindow, uninstallApp, deleteNode } = useDesktop();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contextMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        hideContextMenu();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        hideContextMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [contextMenu, hideContextMenu]);

  if (!contextMenu) return null;

  const handleMenuItemClick = (item: ContextMenuItem) => {
    const { action } = item;
    const { data } = contextMenu;

    // Handle different actions
    switch (action) {
      case "open":
        if (data?.app) {
          openWindow(data.app.id);
        }
        break;
      
      case "close":
        if (data?.windowId) {
          closeWindow(data.windowId);
        }
        break;
      
      case "restore":
        if (data?.windowId) {
          focusWindow(data.windowId);
        }
        break;
      
      case "minimize":
        if (data?.windowId) {
          minimizeWindow(data.windowId);
        }
        break;
      
      case "properties":
        if (data?.window) {
          openWindow("properties", { targetWindow: data.window });
        } else if (data?.app) {
          openWindow("properties", { targetApp: data.app });
        }
        break;
      
      case "uninstall":
        if (data?.app && confirm(`Uninstall ${data.app.name}?`)) {
          uninstallApp(data.app.id);
        }
        break;
      
      case "delete":
        if (data?.nodeId && confirm("Delete this item?")) {
          deleteNode(data.nodeId);
        }
        break;
      
      default:
        console.warn(`Unhandled context menu action: ${action}`);
    }

    hideContextMenu();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-popover border border-popover-border rounded-md shadow-xl min-w-[200px] py-1 z-[100]"
      style={{
        left: contextMenu.x,
        top: contextMenu.y,
      }}
      data-testid="context-menu"
    >
      {contextMenu.items.map((item, index) => {
        if (item.divider) {
          return <div key={index} className="h-px bg-border my-1" />;
        }

        return (
          <button
            key={index}
            onClick={() => handleMenuItemClick(item)}
            disabled={item.disabled}
            className="w-full px-3 py-2 text-sm flex items-center gap-3 hover:bg-accent text-left disabled:opacity-50 disabled:cursor-not-allowed hover-elevate"
            data-testid={`context-menu-item-${item.action}`}
          >
            {item.icon && <span className="text-base">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
