
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ItemsSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder: string;
}

const ItemsSearch = ({ searchQuery, setSearchQuery, placeholder }: ItemsSearchProps) => {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-10"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default ItemsSearch;
