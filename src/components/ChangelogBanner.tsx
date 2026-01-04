import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChangelogEntry {
  content: string;
  updated_at: string;
}

interface ChangelogBannerProps {
  isOpen: boolean;
  onClose: () => void;
  entries: ChangelogEntry[];
}

const ChangelogBanner: React.FC<ChangelogBannerProps> = ({ isOpen, onClose, entries }) => {
  if (!entries || entries.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Последни промени в сайта</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-6">
          <div className="space-y-6">
            {entries.map((entry, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-semibold text-lg">
                  {formatDate(entry.updated_at)}
                </h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{entry.content}</ReactMarkdown>
                </div>
                {index < entries.length - 1 && <hr className="border-border/40" />}
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={onClose}>Затвори</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangelogBanner;
