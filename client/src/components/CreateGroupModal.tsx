import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import UserAvatar from "./UserAvatar";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Array<{ id: string; name: string; avatar?: string }>;
  onCreateGroup: (groupData: { name: string; members: string[]; avatar?: string }) => void;
}

export default function CreateGroupModal({
  open,
  onOpenChange,
  contacts,
  onCreateGroup,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const { toast } = useToast();

  const handleCreate = () => {
    if (!groupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for the group",
        variant: "destructive",
      });
      return;
    }

    if (selectedMembers.length === 0) {
      toast({
        title: "Select members",
        description: "Please select at least one member for the group",
        variant: "destructive",
      });
      return;
    }

    onCreateGroup({
      name: groupName,
      members: selectedMembers,
      avatar: groupAvatar,
    });

    setGroupName("");
    setGroupAvatar("");
    setSelectedMembers([]);
    onOpenChange(false);

    toast({
      title: "Group created",
      description: `${groupName} has been created successfully`,
    });
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-create-group">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <UserAvatar name={groupName || "Group"} src={groupAvatar} size="xl" />
              <label className="absolute bottom-0 right-0 cursor-pointer">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg">
                  <Camera className="h-4 w-4 text-white" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setGroupAvatar(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  data-testid="input-group-avatar"
                />
              </label>
            </div>

            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="text-center font-semibold"
              data-testid="input-group-name"
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Add Members</p>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {contacts.map((contact) => (
                <label
                  key={contact.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  data-testid={`contact-${contact.id}`}
                >
                  <Checkbox
                    checked={selectedMembers.includes(contact.id)}
                    onCheckedChange={() => toggleMember(contact.id)}
                  />
                  <UserAvatar name={contact.name} src={contact.avatar} />
                  <span className="flex-1">{contact.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreate}
              disabled={!groupName.trim() || selectedMembers.length === 0}
              data-testid="button-create-group"
            >
              Create Group
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
