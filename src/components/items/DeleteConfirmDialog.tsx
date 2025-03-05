
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName: string;
  translations: any;
}

const DeleteConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  translations: t,
}: DeleteConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.confirmDelete}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>
            {t.deleteItemDescription?.replace('{itemName}', itemName) || 
            `This will move the item "${itemName}" to the trash bin. 
            You can restore it from there if needed within 30 days.`}
          </p>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {t.confirm}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
