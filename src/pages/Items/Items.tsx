
import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useItems } from "./hooks/useItems";
import { useWarehouses } from "./hooks/useWarehouses";
import { Item } from "./types";
import { translations } from "./translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash } from "lucide-react";
import ItemsTable from "./components/ItemsTable";
import AddItemDialog from "./components/AddItemDialog";
import EditItemDialog from "./components/EditItemDialog";
import DeleteItemDialog from "./components/DeleteItemDialog";
import { useNavigate } from "react-router-dom";

const Items = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const {
    items,
    isLoading,
    fetchItems,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
    imagePreview,
    setImagePreview,
    imageFile,
    setImageFile,
    formErrors,
    setFormErrors,
  } = useItems();

  const { warehouses, fetchWarehouses } = useWarehouses();

  useEffect(() => {
    fetchItems();
    fetchWarehouses();
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.stockCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditItem = (item: Item) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (item: Item) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={() => navigate("/recycle-bin")}
            className="gap-2"
          >
            <Trash className="h-4 w-4" />
            {t.recycleBin}
          </Button>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t.addItem}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Input
          placeholder={t.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <ItemsTable
        items={filteredItems}
        isLoading={isLoading}
        onEdit={handleEditItem}
        onDelete={handleOpenDeleteDialog}
        translations={t}
      />

      <AddItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        warehouses={warehouses}
        onSubmit={handleAddItem}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        imageFile={imageFile}
        setImageFile={setImageFile}
        formErrors={formErrors}
        translations={t}
      />

      {selectedItem && (
        <>
          <EditItemDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            item={selectedItem}
            warehouses={warehouses}
            onSubmit={handleUpdateItem}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            imageFile={imageFile}
            setImageFile={setImageFile}
            formErrors={formErrors}
            translations={t}
          />

          <DeleteItemDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            item={selectedItem}
            onConfirm={handleDeleteItem}
            translations={t}
          />
        </>
      )}
    </div>
  );
};

export default Items;
