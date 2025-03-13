
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FilePlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DocumentUploadButtonProps {
  onDocumentUpload: (file: File) => void;
  disabled?: boolean;
}

const DocumentUploadButton: React.FC<DocumentUploadButtonProps> = ({ 
  onDocumentUpload, 
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
      const allowedTypes = [
        "application/pdf", 
        "text/plain", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword"
      ];
      
      if (allowedTypes.includes(file.type)) {
        onDocumentUpload(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a document file (PDF, TXT, DOC, DOCX)",
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
        title="Upload a document"
      >
        <FilePlus className="h-4 w-4" />
        <span className="sr-only">Upload document</span>
      </Button>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept=".pdf,.txt,.doc,.docx"
        className="hidden"
      />
    </>
  );
};

export default DocumentUploadButton;
