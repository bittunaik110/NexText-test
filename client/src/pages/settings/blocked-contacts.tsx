
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import UserAvatar from "@/components/UserAvatar";
import { ArrowLeft, Ban } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface BlockedContact {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function BlockedContactsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [blockedContacts, setBlockedContacts] = useState<BlockedContact[]>([
    { id: "1", name: "Spam User", email: "spam@example.com" },
    { id: "2", name: "Unknown Person", email: "unknown@example.com" },
  ]);

  const handleUnblock = (contact: BlockedContact) => {
    setBlockedContacts(blockedContacts.filter(c => c.id !== contact.id));
    toast({
      title: "Contact unblocked",
      description: `${contact.name} has been unblocked`,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="sticky top-0 z-10 px-4 py-3 border-b border-border bg-card/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation("/settings")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Blocked Contacts</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {blockedContacts.length === 0 ? (
          <Card className="p-8 text-center">
            <Ban className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No Blocked Contacts</h3>
            <p className="text-sm text-muted-foreground">
              You haven't blocked anyone yet
            </p>
          </Card>
        ) : (
          blockedContacts.map((contact) => (
            <Card key={contact.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar name={contact.name} src={contact.avatar} size="lg" />
                  <div>
                    <h3 className="font-semibold">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">{contact.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnblock(contact)}
                >
                  Unblock
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
