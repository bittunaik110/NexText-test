import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ContactNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName: string;
  originalName: string;
  onSave: (customName: string) => void;
}

export default function ContactNameDialog({
  open,
  onOpenChange,
  contactName,
  originalName,
  onSave,
}: ContactNameDialogProps) {
  const [displayName, setDisplayName] = useState(contactName || originalName);

  const handleSave = () => {
    if (displayName.trim()) {
      onSave(displayName.trim());
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rename Contact</AlertDialogTitle>
          <AlertDialogDescription>
            Customize the display name for {originalName}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter custom name"
            data-testid="input-custom-name"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSave}>Save</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
