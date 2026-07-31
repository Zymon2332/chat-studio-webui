"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Bot, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface EntityItem {
  id: string;
  name: string;
  type: "agent" | "team";
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
}

interface EntitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  items: EntityItem[];
  onItemClick: (item: EntityItem) => void;
}

export function EntitySheet({
  open,
  onOpenChange,
  title,
  items,
  onItemClick,
}: EntitySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick(item)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-3 rounded-lg text-left",
                "transition-colors duration-150",
                "hover:bg-accent/50 cursor-pointer",
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  item.gradientFrom,
                  item.gradientTo,
                )}
              >
                {item.type === "agent" ? (
                  <Bot className="w-4 h-4 text-white" />
                ) : (
                  <Users className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-sidebar-foreground/90 truncate">
                  {item.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {item.subtitle}
                </div>
              </div>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
