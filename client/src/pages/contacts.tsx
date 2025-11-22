import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/UserAvatar";
import { ArrowLeft, Search, UserPlus, UserMinus, Ban } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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
  userId: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
}

export default function ContactsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [actionDialog, setActionDialog] = useState<"remove" | null>(null);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const token = await user?.getIdToken();
        const response = await fetch("/api/users/contacts/list", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.contacts) {
          setContacts(
            data.contacts.map((contact: any) => ({
              id: contact.userId,
              userId: contact.userId,
              displayName: contact.displayName,
              photoURL: contact.photoURL,
              bio: contact.bio,
            }))
          );
        }
      } catch (error) {
        console.error("Error loading contacts:", error);
        toast({
          title: "Error",
          description: "Failed to load contacts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadContacts();
    }
  }, [user, toast]);

  const filteredContacts = contacts.filter((contact) =>
    contact.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveContact = async () => {
    if (!selectedContact) return;

    try {
      const token = await user?.getIdToken();
      await fetch(`/api/users/contacts/remove/${selectedContact.userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setContacts(contacts.filter(c => c.userId !== selectedContact.userId));
      toast({
        title: "Contact removed",
        description: `${selectedContact.displayName} has been removed from contacts`,
      });
    } catch (error) {
      console.error("Error removing contact:", error);
      toast({
        title: "Error",
        description: "Failed to remove contact",
        variant: "destructive",
      });
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

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <UserPlus className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground">No contacts yet</p>
            <p className="text-sm text-muted-foreground">Add contacts to see them here</p>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <Card
              key={contact.id}
              className="p-4 hover-elevate cursor-pointer"
              data-testid={`contact-${contact.id}`}
            >
              <div className="flex items-center gap-3">
                <UserAvatar name={contact.displayName} src={contact.photoURL} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{contact.displayName}</h3>
                  {contact.bio && <p className="text-sm text-muted-foreground truncate">{contact.bio}</p>}
                </div>
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
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={actionDialog !== null} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedContact?.displayName} from your contacts?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-action">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveContact} data-testid="button-confirm-action">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
