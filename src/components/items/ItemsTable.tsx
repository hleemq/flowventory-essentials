
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash, Edit } from "lucide-react";
import { supportedCurrencies } from "@/integrations/supabase/client";

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

interface ItemsTableProps {
  items: Item[];
  searchQuery: string;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  translations: any;
}

const ItemsTable = ({ items, searchQuery, onEdit, onDelete, translations: t }: ItemsTableProps) => {
  const getCurrencySymbol = (currencyCode: string) => {
    const currency = supportedCurrencies[currencyCode];
    return currency ? currency.symbol : currencyCode;
  };

  const filteredItems = items.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.stockCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.image}</TableHead>
            <TableHead>{t.stockCode}</TableHead>
            <TableHead>{t.productName}</TableHead>
            <TableHead>{t.boxes}</TableHead>
            <TableHead>{t.unitsPerBox}</TableHead>
            <TableHead>{t.initialPrice}</TableHead>
            <TableHead>{t.sellingPrice}</TableHead>
            <TableHead>{t.location}</TableHead>
            <TableHead>{t.stockStatus}</TableHead>
            <TableHead>{t.unitsLeft}</TableHead>
            <TableHead>{t.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                No items found. Click 'Add Item' to add your first inventory item.
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-10 h-10 object-cover rounded"
                  />
                </TableCell>
                <TableCell>{item.stockCode}</TableCell>
                <TableCell>{item.productName}</TableCell>
                <TableCell>{item.boxes}</TableCell>
                <TableCell>{item.unitsPerBox}</TableCell>
                <TableCell>{item.initialPrice} {getCurrencySymbol(item.currency)}</TableCell>
                <TableCell>{item.sellingPrice} {getCurrencySymbol(item.currency)}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.stockStatus === "In Stock"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.stockStatus}
                  </span>
                </TableCell>
                <TableCell>{item.unitsLeft}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t.edit}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(item)}>
                        <Trash className="h-4 w-4 mr-2" />
                        {t.delete}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ItemsTable;
