
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface CardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: "none" | "sm" | "md" | "lg";
  className?: string;
}

/**
 * Responsive card grid layout that adapts to different screen sizes
 */
const CardGrid = ({ 
  children, 
  columns = 3, 
  gap = "md", 
  className 
}: CardGridProps) => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  
  const gapClasses = {
    none: "gap-0",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6"
  };
  
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  };
  
  return (
    <div 
      className={cn(
        "grid", 
        columnClasses[columns], 
        gapClasses[gap],
        isRTL ? "rtl" : "ltr",
        className
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {children}
    </div>
  );
};

export default CardGrid;
