
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Upload } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function WallpaperPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedWallpaper, setSelectedWallpaper] = useState("default");

  const wallpapers = [
    { id: "default", name: "Default", gradient: "from-slate-900 to-slate-800" },
    { id: "ocean", name: "Ocean", gradient: "from-blue-900 to-cyan-800" },
    { id: "sunset", name: "Sunset", gradient: "from-orange-900 to-pink-800" },
    { id: "forest", name: "Forest", gradient: "from-green-900 to-emerald-800" },
    { id: "night", name: "Night", gradient: "from-purple-900 to-indigo-800" },
    { id: "rose", name: "Rose", gradient: "from-rose-900 to-pink-800" },
  ];

  const handleWallpaperSelect = (wallpaperId: string) => {
    setSelectedWallpaper(wallpaperId);
    toast({
      title: "Wallpaper updated",
      description: "Your chat wallpaper has been changed",
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
          <h1 className="text-xl font-semibold">Wallpaper</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Choose Wallpaper</h3>
          <div className="grid grid-cols-2 gap-3">
            {wallpapers.map((wallpaper) => (
              <div
                key={wallpaper.id}
                className={`cursor-pointer rounded-lg overflow-hidden transition-all ${
                  selectedWallpaper === wallpaper.id ? 'ring-4 ring-primary' : ''
                }`}
                onClick={() => handleWallpaperSelect(wallpaper.id)}
              >
                <div className={`h-32 bg-gradient-to-br ${wallpaper.gradient} flex items-center justify-center`}>
                  <span className="text-white font-medium">{wallpaper.name}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Custom Wallpaper</h3>
          <Button className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Upload Custom Image
          </Button>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Upload your own image as chat background
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Preview</h3>
          <div className={`h-48 rounded-lg bg-gradient-to-br ${wallpapers.find(w => w.id === selectedWallpaper)?.gradient} p-4 flex flex-col justify-end`}>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 max-w-[80%]">
              <p className="text-white text-sm">This is how your chat will look</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
