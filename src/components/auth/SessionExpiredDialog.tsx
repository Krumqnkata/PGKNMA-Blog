import { useLocation } from "react-router-dom";

import { LoginForm } from "@/components/auth/LoginForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { registerPath } from "@/lib/auth-paths";

/**
 * Signing in always happens on /login, except when a session ends while someone is working.
 * Leaving the page then would throw away what they have typed, so this one case stays a dialog.
 */
export default function SessionExpiredDialog() {
  const { dismissSessionExpired } = useAuth();
  const { pathname, search, hash } = useLocation();

  return (
    <Dialog open onOpenChange={(open) => !open && dismissSessionExpired()}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto overscroll-contain sm:max-h-[calc(100dvh-2rem)] sm:max-w-md">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="text-2xl font-black">Сесията приключи</DialogTitle>
          <DialogDescription>Влезте отново, за да продължите. Написаното на страницата остава.</DialogDescription>
        </DialogHeader>
        <LoginForm registerHref={registerPath(`${pathname}${search}${hash}`)} onRegisterClick={dismissSessionExpired} />
      </DialogContent>
    </Dialog>
  );
}
