import { useState, createContext, useContext } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Settings,
  Palette,
  Cpu,
  Boxes,
  User,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GeneralSettings } from "./GeneralSettings";
import { AppearanceSettings } from "./AppearanceSettings";
import { InstalledProviders } from "./providers/InstalledProviders";
import { ProviderMarket } from "./providers/ProviderMarket";
import { ModelSettings } from "./ModelSettings/index";
import { AccountSettings } from "./AccountSettings";
import { AboutSettings } from "./AboutSettings";

interface SettingsContextType {
  navigateToTab: (tab: string, params?: Record<string, string>) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  navigateToTab: () => {},
});

export function useSettingsContext() {
  return useContext(SettingsContext);
}

interface NavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { key: "general", label: "通用", icon: Settings },
  { key: "appearance", label: "界面", icon: Palette },
  { key: "providers", label: "模型提供商", icon: Cpu },
  { key: "models", label: "模型", icon: Boxes },
  { key: "account", label: "账号", icon: User },
  { key: "about", label: "关于", icon: Info },
];

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [providersSubTab, setProvidersSubTab] = useState<"market" | "installed">("market");

  const navigateToTab = (tab: string, params?: Record<string, string>) => {
    if (tab === "providers" && params?.subTab) {
      setProvidersSubTab(params.subTab as "market" | "installed");
    }
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings />;
      case "appearance":
        return <AppearanceSettings />;
      case "providers":
        return (
          <div className="space-y-6">
            <div className="flex gap-6 text-xl">
              <button
                onClick={() => setProvidersSubTab("market")}
                className={cn(
                  "transition-colors",
                  providersSubTab === "market"
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                模型提供商
              </button>
              <button
                onClick={() => setProvidersSubTab("installed")}
                className={cn(
                  "transition-colors",
                  providersSubTab === "installed"
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                已安装
              </button>
            </div>
            {providersSubTab === "market" ? <ProviderMarket /> : <InstalledProviders />}
          </div>
        );
      case "models":
        return <ModelSettings />;
      case "account":
        return <AccountSettings />;
      case "about":
        return <AboutSettings />;
      default:
        return null;
    }
  };

  return (
    <SettingsContext.Provider value={{ navigateToTab }}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-6xl h-[85vh] p-0 flex flex-col" showCloseButton={false}>
          <div className="flex h-full">
            <div className="w-[220px] border-r p-4 shrink-0">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setActiveTab(item.key);
                        if (item.key === "providers") {
                          setProvidersSubTab("market");
                        }
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        activeTab === item.key
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <main className="flex-1 overflow-auto p-6">
              {renderContent()}
            </main>
          </div>
        </DialogContent>
      </Dialog>
    </SettingsContext.Provider>
  );
}
