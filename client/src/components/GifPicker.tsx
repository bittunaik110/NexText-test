import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GifPickerProps {
  onGifSelect: (gifUrl: string) => void;
  onClose: () => void;
}

const GIPHY_API_KEY = "sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh";

interface GiphyGif {
  id: string;
  title: string;
  images: {
    fixed_height_small: {
      url: string;
    };
    downsized_medium: {
      url: string;
    };
  };
}

export default function GifPicker({ onGifSelect, onClose }: GifPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTrendingGifs();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery) {
        searchGifs(searchQuery);
      } else {
        loadTrendingGifs();
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const loadTrendingGifs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`
      );
      const data = await response.json();
      setGifs(data.data);
    } catch (error) {
      console.error("Failed to load trending GIFs:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20&rating=g`
      );
      const data = await response.json();
      setGifs(data.data);
    } catch (error) {
      console.error("Failed to search GIFs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="absolute bottom-16 left-4 right-4 md:left-auto md:w-96 max-h-96 flex flex-col bg-card border shadow-lg z-50">
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search GIFs..."
            className="pl-9"
            data-testid="input-gif-search"
          />
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          data-testid="button-close-gif"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => {
                  onGifSelect(gif.images.downsized_medium.url);
                  onClose();
                }}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden",
                  "hover:ring-2 hover:ring-primary transition-all",
                  "hover:scale-105"
                )}
                data-testid={`gif-${gif.id}`}
              >
                <img
                  src={gif.images.fixed_height_small.url}
                  alt={gif.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-border text-xs text-muted-foreground text-center">
        Powered by GIPHY
      </div>
    </Card>
  );
}
