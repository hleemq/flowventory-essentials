
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ItemForm from "@/components/items/ItemForm";
import DeleteConfirmDialog from "@/components/items/DeleteConfirmDialog";

interface Item {
  id: string;
  image: string;
  stockCode: string;
  productName: string;
  boxes: number;
  unitsPerBox: number;
  initialPrice: number;
  sellingPrice: number;
  location: string;
  stockStatus: string;
  unitsLeft: number;
  currency: string;
}

type DialogMode = 'add' | 'edit' | 'delete' | null;

interface ItemDialogsProps {
  dialogMode: DialogMode;
  setDialogMode: (mode: DialogMode) => void;
  newItem: any;
  setNewItem: (item: any) => void;
  selectedItem: Item | null;
  formErrors: any;
  warehouses: any[];
  imagePreview: string;
  setImagePreview: (url: string) => void;
  onAddItem: () => void;
  onEditItem: () => void;
  onDeleteItem: () => void;
  translations: any;
}

const ItemDialogs = ({
  dialogMode,
  setDialogMode,
  newItem,
  setNewItem,
  selectedItem,
  formErrors,
  warehouses,
  imagePreview,
  setImagePreview,
  onAddItem,
  onEditItem,
  onDeleteItem,
  translations: t
}: ItemDialogsProps) => {
  return (
    <>
      {/* Add Item Dialog */}
      <Dialog open={dialogMode === 'add'} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t.addNewStockItem}</DialogTitle>
            <DialogDescription>
              Fill in the item details below to add it to your inventory.
            </DialogDescription>
          </DialogHeader>
          <ItemForm
            item={newItem}
            formErrors={formErrors}
            warehouses={warehouses}
            onItemChange={setNewItem}
            onSubmit={onAddItem}
            onCancel={() => setDialogMode(null)}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            translations={t}
            submitLabel={t.addItem}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={dialogMode === 'edit'} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update the item details below.
            </DialogDescription>
          </DialogHeader>
          <ItemForm
            item={newItem}
            formErrors={formErrors}
            warehouses={warehouses}
            onItemChange={setNewItem}
            onSubmit={onEditItem}
            onCancel={() => setDialogMode(null)}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            translations={t}
            submitLabel={t.edit}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={dialogMode === 'delete'}
        onOpenChange={(open) => !open && setDialogMode(null)}
        onConfirm={onDeleteItem}
        itemName={selectedItem?.productName || ''}
        translations={t}
      />
    </>
  );
};

export default ItemDialogs;
