import React from "react";
import { Link, useLocation } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FloatingFAQ = () => {
  const location = useLocation();
  
  // Don't show the button if we are already on the FAQ page
  if (location.pathname === "/faq") return null;

  return (
    <div className="fixed bottom-6 left-6 z-[60]">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            asChild
            variant="secondary"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg border border-border/50 bg-background/80 backdrop-blur-sm hover:scale-110 active:scale-95 transition-all duration-300 group"
          >
            <Link to="/faq" aria-label="Често задавани въпроси">
              <HelpCircle className="h-6 w-6 text-primary transition-colors" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-primary text-primary-foreground font-medium border-none shadow-md">
          <p>Често задавани въпроси</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default FloatingFAQ;
