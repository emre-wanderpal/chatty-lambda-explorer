
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ImageUploadButtonProps {
  onImageUpload: (file: File) => void;
  disabled?: boolean;
}

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({ 
  onImageUpload, 
  disabled = false 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        onImageUpload(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (jpg, png, etc.)",
          variant: "destructive"
        });
      }
      // Reset input value so the same file can be uploaded again
      e.target.value = "";
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={handleClick}
        disabled={disabled}
        title="Upload an image"
      >
        <ImagePlus className="h-4 w-4" />
        <span className="sr-only">Upload image</span>
      </Button>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </>
  );
};

export default ImageUploadButton;
