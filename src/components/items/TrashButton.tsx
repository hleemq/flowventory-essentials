
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TrashButtonProps {
  title: string;
}

const TrashButton = ({ title }: TrashButtonProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="fixed bottom-6 right-6">
      <Button 
        onClick={() => navigate('/corbeille')} 
        variant="outline" 
        size="icon" 
        className="h-14 w-14 rounded-full shadow-lg bg-background"
        title={title}
      >
        <Trash2 className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default TrashButton;
