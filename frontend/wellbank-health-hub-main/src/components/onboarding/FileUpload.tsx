import { useState, useRef } from "react";
import { Upload, X, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  label: string;
  accept?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
  description?: string;
}

export default function FileUpload({ label, accept = ".jpg,.jpeg,.png,.pdf", value, onChange, required, description }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    onChange(file);
  };

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </p>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <FileText className="h-5 w-5 shrink-0 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{value.name}</p>
            <p className="text-xs text-muted-foreground">{(value.size / 1024).toFixed(1)} KB</p>
          </div>
          <Check className="h-4 w-4 text-primary" />
          <button type="button" onClick={() => onChange(null)} className="text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
          }`}
        >
          <Upload className="mx-auto mb-1.5 h-5 w-5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Click or drag to upload</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">{accept.replace(/\./g, "").toUpperCase()}</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
    </div>
  );
}
