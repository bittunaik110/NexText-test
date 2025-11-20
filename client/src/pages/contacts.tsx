import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/UserAvatar";
import { ArrowLeft, Search, UserPlus, UserMinus, Ban } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
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

interface Contact {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  blocked?: boolean;
}

export default function ContactsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [actionDialog, setActionDialog] = useState<"block" | "unblock" | "remove" | null>(null);

  const [contacts] = useState<Contact[]>([
    { id: "1", name: "Sarah Chen", email: "sarah@example.com" },
    { id: "2", name: "Mike Wilson", email: "mike@example.com" },
    { id: "3", name: "Emily Rodriguez", email: "emily@example.com" },
    { id: "4", name: "David Lee", email: "david@example.com", blocked: true },
  ]);

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = () => {
    if (!selectedContact) return;

    switch (actionDialog) {
      case "block":
        toast({
          title: "Contact blocked",
          description: `${selectedContact.name} has been blocked`,
        });
        break;
      case "unblock":
        toast({
          title: "Contact unblocked",
          description: `${selectedContact.name} has been unblocked`,
        });
        break;
      case "remove":
        toast({
          title: "Contact removed",
          description: `${selectedContact.name} has been removed from contacts`,
        });
        break;
    }

    setActionDialog(null);
    setSelectedContact(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="sticky top-0 z-10 px-4 py-3 border-b border-border bg-card/60 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation("/settings")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Contacts</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts..."
            className="pl-9"
            data-testid="input-search-contacts"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <Card className="p-4 hover-elevate cursor-pointer" data-testid="card-add-contact">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Add New Contact</h3>
              <p className="text-sm text-muted-foreground">Connect using PIN or email</p>
            </div>
          </div>
        </Card>

        {filteredContacts.map((contact) => (
          <Card
            key={contact.id}
            className={`p-4 ${contact.blocked ? 'opacity-60' : ''}`}
            data-testid={`contact-${contact.id}`}
          >
            <div className="flex items-center gap-3">
              <UserAvatar name={contact.name} src={contact.avatar} size="lg" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">
                  {contact.name}
                  {contact.blocked && (
                    <span className="ml-2 text-xs text-destructive">(Blocked)</span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
              </div>
              <div className="flex gap-1">
                {contact.blocked ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setSelectedContact(contact);
                      setActionDialog("unblock");
                    }}
                    data-testid={`button-unblock-${contact.id}`}
                  >
                    <Ban className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setSelectedContact(contact);
                      setActionDialog("block");
                    }}
                    data-testid={`button-block-${contact.id}`}
                  >
                    <Ban className="h-5 w-5 text-destructive" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setSelectedContact(contact);
                    setActionDialog("remove");
                  }}
                  data-testid={`button-remove-${contact.id}`}
                >
                  <UserMinus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={actionDialog !== null} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog === "block" && "Block Contact"}
              {actionDialog === "unblock" && "Unblock Contact"}
              {actionDialog === "remove" && "Remove Contact"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog === "block" && `Are you sure you want to block ${selectedContact?.name}? They won't be able to send you messages.`}
              {actionDialog === "unblock" && `Are you sure you want to unblock ${selectedContact?.name}?`}
              {actionDialog === "remove" && `Are you sure you want to remove ${selectedContact?.name} from your contacts?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-action">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction} data-testid="button-confirm-action">
              {actionDialog === "block" && "Block"}
              {actionDialog === "unblock" && "Unblock"}
              {actionDialog === "remove" && "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
