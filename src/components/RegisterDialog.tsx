import { useEffect, useRef, useState } from "react";
import { Loader2, MailCheck, RefreshCw, Settings } from "lucide-react";

import { RegistrationForm } from "@/components/auth/RegistrationForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettings } from "@/hooks/use-settings";
import { resendVerificationEmail } from "@/lib/api";
import type { RegistrationResponse } from "@/lib/api";

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenLogin: () => void;
}

const RegisterDialog = ({ open, onOpenChange, onOpenLogin }: RegisterDialogProps) => {
  const { settings } = useSettings();
  const [registrationResult, setRegistrationResult] = useState<RegistrationResponse | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      setRegistrationResult(null);
      setResendMessage("");
    }
  }, [open]);

  useEffect(() => {
    if (registrationResult) successHeadingRef.current?.focus();
  }, [registrationResult]);

  const openLogin = () => {
    onOpenChange(false);
    onOpenLogin();
  };

  const handleResend = async () => {
    if (!registrationResult?.email) return;
    setResendLoading(true);
    setResendMessage("");
    try {
      const result = await resendVerificationEmail(registrationResult.email);
      setResendMessage(result.detail);
    } catch (caughtError: unknown) {
      setResendMessage(
        caughtError instanceof Error
          ? caughtError.message
          : "Неуспешно повторно изпращане.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogContentRef}
        tabIndex={-1}
        className="max-h-[90dvh] w-[calc(100%-1.5rem)] overflow-y-auto sm:max-w-md"
        aria-labelledby="register-dialog-title"
        aria-describedby="register-dialog-description"
        onOpenAutoFocus={(event) => {
          returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          event.preventDefault();
          window.requestAnimationFrame(() => (initialFocusRef.current ?? dialogContentRef.current)?.focus());
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          onOpenChange(false);
        }}
      >
        <DialogHeader>
          <DialogTitle id="register-dialog-title" className="text-xl font-semibold">Регистрация</DialogTitle>
          <DialogDescription id="register-dialog-description">
            {settings?.enable_user_registration
              ? "Попълнете данните си, за да създадете профил."
              : "Регистрациите са временно спрени от администратор."}
          </DialogDescription>
        </DialogHeader>

        {registrationResult ? (
          <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 px-2 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MailCheck className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 ref={successHeadingRef} tabIndex={-1} className="text-lg font-semibold outline-none">
                {registrationResult.verification_required ? "Потвърдете имейла си" : "Профилът е потвърден"}
              </h3>
              <p className="text-sm text-muted-foreground">{registrationResult.detail}</p>
              <p className="break-all text-sm font-medium">{registrationResult.email}</p>
            </div>
            {registrationResult.verification_required && (
              <Button variant="outline" className="w-full" onClick={handleResend} disabled={resendLoading}>
                {resendLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Изпрати имейла отново
              </Button>
            )}
            {resendMessage && <p aria-live="polite" className="text-sm text-muted-foreground">{resendMessage}</p>}
            <Button className="w-full" onClick={openLogin}>Към входа</Button>
          </div>
        ) : settings?.enable_user_registration ? (
          <RegistrationForm initialFocusRef={initialFocusRef} onClose={() => onOpenChange(false)} onOpenLogin={onOpenLogin} onRegistered={setRegistrationResult} />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center sm:p-8">
            <Settings className="mb-4 h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">Регистрациите на нови потребители са временно изключени.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Вече имаш профил?{" "}
              <button type="button" className="font-semibold text-primary hover:underline" onClick={openLogin}>Вход</button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RegisterDialog;
