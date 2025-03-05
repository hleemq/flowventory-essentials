
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item;
  onConfirm: (itemId: string) => Promise<boolean>;
  translations: any;
}

const DeleteItemDialog = ({ 
  open, 
  onOpenChange, 
  item, 
  onConfirm,
  translations: t 
}: DeleteItemDialogProps) => {
  const handleDelete = async () => {
    const success = await onConfirm(item.id);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
