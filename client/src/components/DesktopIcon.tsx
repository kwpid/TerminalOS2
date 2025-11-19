import { useDesktop } from "@/lib/desktop-context";
import type { DesktopIcon as DesktopIconType, App } from "@shared/schema";

interface DesktopIconProps {
  icon: DesktopIconType;
  app: App;
}

export function DesktopIcon({ icon, app }: DesktopIconProps) {
  const { openWindow, showContextMenu } = useDesktop();

  const handleDoubleClick = () => {
    openWindow(app.id);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    showContextMenu(
      e.clientX,
      e.clientY,
      [
        {
          label: "Open",
          action: "open",
          icon: "↗",
        },
        {
          label: "Properties",
          action: "properties",
          icon: "ℹ",
        },
      ],
      { app, iconId: icon.id }
    );
  };

  return (
    <div
      className="flex flex-col items-center gap-2 p-2 w-24 rounded-lg hover:bg-accent/20 cursor-pointer group"
      style={{
        position: "absolute",
        left: icon.x,
        top: icon.y,
      }}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleRightClick}
      data-testid={`desktop-icon-${app.id}`}
    >
      <div className="text-5xl select-none">{app.icon}</div>
      <span className="text-xs text-center text-white text-shadow-lg select-none line-clamp-2">
        {app.name}
      </span>
    </div>
  );
}
