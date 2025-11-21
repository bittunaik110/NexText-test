
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, MessageCircle, Send } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    email: user?.email || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent",
      description: "We'll get back to you within 24 hours",
    });
    setFormData({ subject: "", message: "", email: user?.email || "" });
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
          <h1 className="text-xl font-semibold">Contact Us</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Get in Touch</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="What can we help you with?"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your issue or question..."
                rows={6}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </form>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Other Ways to Reach Us</h3>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">support@nextext.com</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <MessageCircle className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Live Chat</p>
              <p className="text-sm text-muted-foreground">Available 24/7</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
