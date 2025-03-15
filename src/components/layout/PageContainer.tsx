
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

/**
 * Consistent page container component with responsive padding and RTL support
 */
const PageContainer = ({ 
  children, 
  className, 
  fullWidth = false 
}: PageContainerProps) => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  
  return (
    <div 
      className={cn(
        "animate-in fade-in py-8 px-4 md:px-6",
        !fullWidth && "container mx-auto max-w-7xl",
        isRTL ? "rtl text-right" : "ltr text-left",
        className
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {children}
    </div>
  );
};

export default PageContainer;
