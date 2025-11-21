
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

export default function HelpPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    { category: "Getting Started", items: [
      "How do I create an account?",
      "How do I connect with friends?",
      "What is a PIN code?",
    ]},
    { category: "Privacy & Security", items: [
      "How secure are my messages?",
      "Can I delete messages?",
      "How do I block someone?",
    ]},
    { category: "Features", items: [
      "How do I make a video call?",
      "How do I share files?",
      "What are status updates?",
    ]},
    { category: "Troubleshooting", items: [
      "Messages not sending",
      "Can't login to my account",
      "App crashes or freezes",
    ]},
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="sticky top-0 z-10 px-4 py-3 border-b border-border bg-card/60 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation("/settings")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Help Center</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {faqs.map((section, index) => (
          <Card key={index} className="p-6">
            <h3 className="font-semibold text-lg mb-3">{section.category}</h3>
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <span className="text-sm">{item}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </Card>
        ))}

        <Card className="p-6 text-center">
          <h3 className="font-semibold text-lg mb-2">Still need help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Contact our support team for personalized assistance
          </p>
          <Button onClick={() => setLocation("/settings/contact")}>
            Contact Support
          </Button>
        </Card>
      </div>
    </div>
  );
}
