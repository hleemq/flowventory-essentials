
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useRef } from "react";

type BackupSettingsProps = {
  onDownload: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  title: string;
  downloadText: string;
  restoreText: string;
};

const BackupSettings = ({ 
  onDownload, 
  onFileUpload, 
  title, 
  downloadText, 
  restoreText 
}: BackupSettingsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Download className="h-5 w-5" />
        {title}
      </h2>
      <div className="space-y-4">
        <Button onClick={onDownload} className="w-full" variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {downloadText}
        </Button>
        
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".json"
            onChange={onFileUpload}
            ref={fileInputRef}
            className="hidden"
            id="backup-file"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
            variant="outline"
          >
            <Upload className="mr-2 h-4 w-4" />
            {restoreText}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BackupSettings;
