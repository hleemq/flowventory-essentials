
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Coins } from "lucide-react";

type CurrencySettingsProps = {
  currentCurrency: string;
  onCurrencyChange: (currency: string) => void;
  title: string;
};

const CurrencySettings = ({ currentCurrency, onCurrencyChange, title }: CurrencySettingsProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Coins className="h-5 w-5" />
        {title}
      </h2>
      <Select value={currentCurrency} onValueChange={onCurrencyChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="USD">$ (USD)</SelectItem>
          <SelectItem value="EUR">€ (EUR)</SelectItem>
          <SelectItem value="MAD">MAD (Moroccan Dirham)</SelectItem>
        </SelectContent>
      </Select>
    </Card>
  );
};

export default CurrencySettings;
