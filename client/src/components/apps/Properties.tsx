import { useDesktop } from "@/lib/desktop-context";
import { formatUptime } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Window } from "@shared/schema";

interface PropertiesProps {
  window: Window;
}

export function Properties({ window }: PropertiesProps) {
  const { windows, apps } = useDesktop();

  const targetWindow = window.data?.targetWindow;
  const targetApp = window.data?.targetApp;

  if (targetWindow) {
    const app = apps.find((a) => a.id === targetWindow.appId);

    return (
      <div className="h-full flex flex-col bg-card" data-testid="properties-app">
        <div className="p-4 border-b border-border bg-secondary">
          <h2 className="text-lg font-semibold">Window Properties</h2>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* General Properties */}
            <div>
              <h3 className="text-sm font-medium mb-3">General</h3>
              <div className="space-y-2 text-sm">
                <PropertyRow label="Window ID" value={targetWindow.id} />
                <PropertyRow label="Title" value={targetWindow.title} />
                <PropertyRow label="App Type" value={targetWindow.appType} />
                <PropertyRow label="Status" value={targetWindow.status} />
              </div>
            </div>

            <Separator />

            {/* Position & Size */}
            <div>
              <h3 className="text-sm font-medium mb-3">Position & Size</h3>
              <div className="space-y-2 text-sm">
                <PropertyRow label="X Position" value={`${targetWindow.x}px`} />
                <PropertyRow label="Y Position" value={`${targetWindow.y}px`} />
                <PropertyRow label="Width" value={`${targetWindow.width}px`} />
                <PropertyRow label="Height" value={`${targetWindow.height}px`} />
                <PropertyRow label="Z-Index" value={targetWindow.zIndex.toString()} />
              </div>
            </div>

            <Separator />

            {/* Runtime Info */}
            <div>
              <h3 className="text-sm font-medium mb-3">Runtime</h3>
              <div className="space-y-2 text-sm">
                <PropertyRow label="Uptime" value={formatUptime(targetWindow.startTime)} />
                <PropertyRow
                  label="Focused"
                  value={targetWindow.focused ? "Yes" : "No"}
                />
                <PropertyRow
                  label="Started At"
                  value={new Date(targetWindow.startTime).toLocaleTimeString()}
                />
              </div>
            </div>

            <Separator />

            {/* Advanced Properties */}
            <div>
              <h3 className="text-sm font-medium mb-3">Advanced</h3>
              <div className="space-y-2 text-sm font-mono">
                <PropertyRow label="Library Path" value="/System/Library" mono />
                <PropertyRow label="UI Path" value="/System/Library/UI" mono />
                <PropertyRow
                  label="Components Path"
                  value="/System/Library/UI/Components"
                  mono
                />
                {app && (
                  <PropertyRow label="Executable" value={app.executable} mono />
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (targetApp) {
    return (
      <div className="h-full flex flex-col bg-card" data-testid="properties-app">
        <div className="p-4 border-b border-border bg-secondary">
          <h2 className="text-lg font-semibold">Application Properties</h2>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* General Properties */}
            <div>
              <h3 className="text-sm font-medium mb-3">General</h3>
              <div className="space-y-2 text-sm">
                <PropertyRow label="App ID" value={targetApp.id} />
                <PropertyRow label="Name" value={targetApp.name} />
                <PropertyRow label="Type" value={targetApp.type} />
                <PropertyRow label="Icon" value={targetApp.icon} />
              </div>
            </div>

            <Separator />

            {/* Details */}
            <div>
              <h3 className="text-sm font-medium mb-3">Details</h3>
              <div className="space-y-2 text-sm">
                <PropertyRow
                  label="Description"
                  value={targetApp.description || "No description"}
                />
                <PropertyRow label="Executable" value={targetApp.executable} mono />
                <PropertyRow
                  label="Multi-Instance"
                  value={targetApp.canMultiInstance ? "Yes" : "No"}
                />
                <PropertyRow
                  label="Installed"
                  value={targetApp.installed ? "Yes" : "No"}
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center text-muted-foreground">
      <p>No properties to display</p>
    </div>
  );
}

function PropertyRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}:</span>
      <span className={`text-right ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
