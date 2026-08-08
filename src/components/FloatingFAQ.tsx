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

  if (location.pathname === "/faq") return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="hidden h-10 w-10 text-white/60 transition-colors hover:bg-white/10 hover:text-white xl:inline-flex"
        >
          <Link to="/faq" aria-label="Често задавани въпроси">
            <HelpCircle className="h-[18px] w-[18px]" aria-hidden="true" />
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Помощ и често задавани въпроси</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default FloatingFAQ;
