
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ItemsHeaderProps {
  title: string;
  description: string;
  addButtonLabel: string;
  onAddClick: () => void;
  language: string;
}

const ItemsHeader = ({ 
  title, 
  description, 
  addButtonLabel, 
  onAddClick,
  language
}: ItemsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>
      <Button onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" />
        {addButtonLabel}
      </Button>
    </div>
  );
};

export default ItemsHeader;
