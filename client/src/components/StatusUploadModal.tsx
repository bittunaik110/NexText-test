import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Image as ImageIcon, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/uploadFile";

interface StatusUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (status: { type: "text" | "image"; content: string; caption?: string }) => void;
}

export default function StatusUploadModal({ open, onOpenChange, onUpload }: StatusUploadModalProps) {
  const [mode, setMode] = useState<"select" | "text" | "image">("select");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setMode("image");
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (mode === "text") {
      if (!caption.trim()) {
        toast({
          title: "Enter text",
          description: "Please enter some text for your status",
          variant: "destructive",
        });
        return;
      }

      onUpload({
        type: "text",
        content: caption,
      });

      toast({
        title: "Status uploaded",
        description: "Your text status has been uploaded",
      });
    } else if (mode === "image" && selectedFile) {
      setIsUploading(true);
      try {
        const imageUrl = await uploadFile(selectedFile);
        onUpload({
          type: "image",
          content: imageUrl,
          caption: caption || undefined,
        });

        toast({
          title: "Status uploaded",
          description: "Your image status has been uploaded",
        });
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to upload status. Please try again.",
          variant: "destructive",
        });
        return;
      } finally {
        setIsUploading(false);
      }
    }

    setMode("select");
    setCaption("");
    setImagePreview(null);
    setSelectedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-upload-status">
        <DialogHeader>
          <DialogTitle>Upload Status</DialogTitle>
        </DialogHeader>

        {mode === "select" && (
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-32 flex flex-col gap-2"
              onClick={() => setMode("text")}
              data-testid="button-text-status"
            >
              <Type className="h-8 w-8" />
              <span>Text Status</span>
            </Button>

            <label className="cursor-pointer">
              <div className="h-32 flex flex-col gap-2 items-center justify-center border-2 border-dashed border-border rounded-lg hover:bg-muted transition-colors">
                <ImageIcon className="h-8 w-8" />
                <span>Image Status</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
                data-testid="input-image-status"
              />
            </label>
          </div>
        )}

        {mode === "text" && (
          <div className="space-y-4">
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              className="resize-none"
              autoFocus
              data-testid="textarea-status"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setMode("select")}
                data-testid="button-back"
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleUpload}
                disabled={!caption.trim()}
                data-testid="button-upload"
              >
                Upload
              </Button>
            </div>
          </div>
        )}

        {mode === "image" && imagePreview && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full rounded-lg max-h-64 object-cover"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 bg-background/80"
                onClick={() => {
                  setMode("select");
                  setImagePreview(null);
                  setSelectedFile(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption (optional)"
              rows={2}
              className="resize-none"
              data-testid="textarea-caption"
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setMode("select");
                  setImagePreview(null);
                  setSelectedFile(null);
                }}
                disabled={isUploading}
                data-testid="button-back"
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleUpload}
                disabled={isUploading}
                data-testid="button-upload"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
