
import { useState, useEffect, useRef } from "react";
import { UploadCloud } from "lucide-react";

interface ImageUploadProps {
  imagePreview: string | null;
  onImageChange: (file: File) => void;
  dragImageText: string;
}

const ImageUpload = ({ imagePreview, onImageChange, dragImageText }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle drag and drop events for the dropzone
    const dropzone = dropzoneRef.current;
    if (!dropzone) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('border-primary');
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('border-primary');
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('border-primary');
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        handleImageFile(e.dataTransfer.files[0]);
      }
    };

    dropzone.addEventListener('dragover', handleDragOver);
    dropzone.addEventListener('dragleave', handleDragLeave);
    dropzone.addEventListener('drop', handleDrop);

    return () => {
      dropzone.removeEventListener('dragover', handleDragOver);
      dropzone.removeEventListener('dragleave', handleDragLeave);
      dropzone.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleImageFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    onImageChange(file);
  };

  return (
    <div 
      ref={dropzoneRef}
      className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => fileInputRef.current?.click()}
    >
      {imagePreview ? (
        <img
          src={imagePreview}
          alt="Preview"
          className="w-32 h-32 object-cover rounded-lg"
        />
      ) : (
        <div className="flex flex-col items-center text-center p-4">
          <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{dragImageText}</p>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleImageFile(e.target.files[0]);
          }
        }}
      />
    </div>
  );
};

export default ImageUpload;
