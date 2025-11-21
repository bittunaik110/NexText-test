
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sun, Moon, Monitor } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function ThemePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState("dark");

  const themes = [
    { id: "light", name: "Light", icon: Sun, description: "Clean and bright" },
    { id: "dark", name: "Dark", icon: Moon, description: "Easy on the eyes" },
    { id: "auto", name: "Auto", icon: Monitor, description: "Matches system" },
  ];

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    toast({
      title: "Theme updated",
      description: `Theme changed to ${themeId}`,
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
          <h1 className="text-xl font-semibold">Theme</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Choose Theme</h3>
          <div className="space-y-3">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedTheme === theme.id ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/30 border-2 border-transparent hover:bg-muted/50'
                }`}
                onClick={() => handleThemeChange(theme.id)}
              >
                <div className="flex items-center gap-3">
                  <theme.icon className={`h-6 w-6 ${selectedTheme === theme.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="font-medium">{theme.name}</p>
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                  </div>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                  selectedTheme === theme.id ? 'border-primary' : 'border-muted-foreground'
                }`}>
                  {selectedTheme === theme.id && (
                    <div className="h-3 w-3 rounded-full bg-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Preview</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary to-accent">
              <p className="text-white font-medium">Sent Message</p>
              <p className="text-white/80 text-sm">This is how your messages will look</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="font-medium">Received Message</p>
              <p className="text-muted-foreground text-sm">This is how received messages will look</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
