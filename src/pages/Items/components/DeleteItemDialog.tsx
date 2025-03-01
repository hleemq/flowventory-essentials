
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Item } from "../types";

interface DeleteItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item;
  onDeleteItem: (itemId: string) => Promise<boolean>;
  translations: any;
}

const DeleteItemDialog = ({ 
  isOpen, 
  onOpenChange, 
  item, 
  onDeleteItem,
  translations: t 
}: DeleteItemDialogProps) => {
  const handleDelete = async () => {
    const success = await onDeleteItem(item.id);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.confirmDelete}</DialogTitle>
          <DialogDescription>{t.confirmDeleteMessage}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            {t.delete}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteItemDialog;
