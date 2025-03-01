
import { Edit, Trash2, MoreHorizontal, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/integrations/supabase/client";
import { Item } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ItemsTableProps {
  items: Item[];
  isLoading: boolean;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  translations: any;
}

const ItemsTable = ({ items, isLoading, onEdit, onDelete, translations: t }: ItemsTableProps) => {
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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                {t.emptyState}
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
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
                <TableCell>{formatCurrency(item.initialPrice)}</TableCell>
                <TableCell>{formatCurrency(item.sellingPrice)}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.stockStatus === "In Stock" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
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
                        <Edit className="mr-2 h-4 w-4" />
                        {t.edit}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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
