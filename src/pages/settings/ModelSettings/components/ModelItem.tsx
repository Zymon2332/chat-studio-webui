import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Model } from "@/lib/models";
import { AbilityIcons } from "./AbilityIcons";

interface ModelItemProps {
  model: Model;
  onDelete: (model: Model) => void;
  onConfig: (model: Model) => void;
}

export function ModelItem({ model, onDelete, onConfig }: ModelItemProps) {
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-accent/50 rounded-md transition-colors">
      <div className="flex items-center gap-3">
        <span className="font-medium">{model.modelName}</span>
        {model.def && <Badge variant="default">默认</Badge>}
        <AbilityIcons abilities={model.abilities} />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onConfig(model)}>
          配置
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(model)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
