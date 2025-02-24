
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Paintbrush } from "lucide-react";

type CustomizationSettingsProps = {
  darkMode: boolean;
  compactMode: boolean;
  onDarkModeChange: (checked: boolean) => void;
  onCompactModeChange: (checked: boolean) => void;
  title: string;
  darkModeText: string;
  compactModeText: string;
};

const CustomizationSettings = ({
  darkMode,
  compactMode,
  onDarkModeChange,
  onCompactModeChange,
  title,
  darkModeText,
  compactModeText,
}: CustomizationSettingsProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Paintbrush className="h-5 w-5" />
        {title}
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode">{darkModeText}</Label>
          <Switch
            id="dark-mode"
            checked={darkMode}
            onCheckedChange={onDarkModeChange}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="compact-mode">{compactModeText}</Label>
          <Switch
            id="compact-mode"
            checked={compactMode}
            onCheckedChange={onCompactModeChange}
          />
        </div>
      </div>
    </Card>
  );
};

export default CustomizationSettings;
