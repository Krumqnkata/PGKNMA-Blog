import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PDFViewer from "./PDFViewer";

interface PDFViewerDialogProps {
  fileUrl: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

const PDFViewerDialog: React.FC<PDFViewerDialogProps> = ({
  fileUrl,
  isOpen,
  onOpenChange,
  title = "Преглед на документ",
}) => {
  if (!fileUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-6 border-b">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow w-full h-full overflow-hidden">
          <PDFViewer fileUrl={fileUrl} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewerDialog;
