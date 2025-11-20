import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, X } from "lucide-react";
import UserAvatar from "./UserAvatar";
import { format } from "date-fns";

interface SearchResult {
  chatId: string;
  chatName: string;
  chatAvatar?: string;
  messageId: string;
  messageText: string;
  timestamp: Date;
}

interface ChatSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectResult: (chatId: string, messageId: string) => void;
}

export default function ChatSearch({ open, onOpenChange, onSelectResult }: ChatSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          chatId: "1",
          chatName: "Sarah Chen",
          messageId: "msg1",
          messageText: "Let's meet tomorrow for coffee!",
          timestamp: new Date(Date.now() - 86400000),
        },
        {
          chatId: "2",
          chatName: "Mike Wilson",
          messageId: "msg2",
          messageText: "Thanks for your help with the project",
          timestamp: new Date(Date.now() - 172800000),
        },
      ].filter((result) =>
        result.messageText.toLowerCase().includes(query.toLowerCase()) ||
        result.chatName.toLowerCase().includes(query.toLowerCase())
      );

      setResults(mockResults);
      setIsSearching(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col" data-testid="dialog-search">
        <DialogHeader>
          <DialogTitle>Search Messages</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for messages, contacts, or media..."
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
            data-testid="input-search"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setResults([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              data-testid="button-clear-search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {isSearching ? (
            <div className="text-center py-8 text-muted-foreground">Searching...</div>
          ) : results.length > 0 ? (
            results.map((result) => (
              <div
                key={result.messageId}
                onClick={() => {
                  onSelectResult(result.chatId, result.messageId);
                  onOpenChange(false);
                }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                data-testid={`search-result-${result.messageId}`}
              >
                <UserAvatar name={result.chatName} src={result.chatAvatar} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">{result.chatName}</h4>
                    <span className="text-xs text-muted-foreground">
                      {format(result.timestamp, "MMM d")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{result.messageText}</p>
                </div>
              </div>
            ))
          ) : searchQuery.trim().length >= 2 ? (
            <div className="text-center py-8 text-muted-foreground">No results found</div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Start typing to search messages
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
