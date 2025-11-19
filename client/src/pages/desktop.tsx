import { useDesktop } from "@/lib/desktop-context";
import { Window } from "@/components/Window";
import { Taskbar } from "@/components/Taskbar";
import { DesktopIcon } from "@/components/DesktopIcon";
import { ContextMenu } from "@/components/ContextMenu";
import { Terminal } from "@/components/apps/Terminal";
import { VSStudio } from "@/components/apps/VSStudio";
import { Files } from "@/components/apps/Files";
import { Browser } from "@/components/apps/Browser";
import { WebStore } from "@/components/apps/WebStore";
import { Properties } from "@/components/apps/Properties";

export default function Desktop() {
  const { windows, apps, desktopIcons, hideContextMenu } = useDesktop();

  const openWindows = windows.filter((w) => w.status !== "closed");

  const getAppComponent = (window: Window) => {
    switch (window.appType) {
      case "terminal":
        return <Terminal window={window} />;
      case "vs-studio":
        return <VSStudio window={window} />;
      case "files":
        return <Files window={window} />;
      case "browser":
        return <Browser window={window} />;
      case "web-store":
        return <WebStore window={window} />;
      case "properties":
        return <Properties window={window} />;
      default:
        return (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>Application not implemented: {window.appType}</p>
          </div>
        );
    }
  };

  return (
    <div
      className="h-screen w-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
      onClick={hideContextMenu}
      data-testid="desktop"
    >
      {/* Desktop Icons */}
      <div className="absolute inset-0 pb-12">
        {desktopIcons.map((icon) => {
          const app = apps.find((a) => a.id === icon.appId);
          if (!app) return null;
          return <DesktopIcon key={icon.id} icon={icon} app={app} />;
        })}
      </div>

      {/* Windows */}
      <div className="absolute inset-0 pb-12">
        {openWindows.map((window) => (
          <Window key={window.id} window={window}>
            {getAppComponent(window)}
          </Window>
        ))}
      </div>

      {/* Context Menu */}
      <ContextMenu />

      {/* Taskbar */}
      <Taskbar />
    </div>
  );
}
