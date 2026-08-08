import { useEffect, useState } from "react";
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
import { useSettings } from "@/contexts/SettingsContext";
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

  useEffect(() => {
    if (!open) {
      setRegistrationResult(null);
      setResendMessage("");
    }
  }, [open]);

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
      <DialogContent className="max-h-[90dvh] w-[calc(100%-1.5rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Регистрация</DialogTitle>
          <DialogDescription>
            {settings?.enable_user_registration
              ? "Попълнете данните си, за да създадете профил."
              : "Регистрациите са временно спрени от администратор."}
          </DialogDescription>
        </DialogHeader>

        {registrationResult ? (
          <div className="flex flex-col items-center gap-4 px-2 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MailCheck className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
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
          <RegistrationForm onClose={() => onOpenChange(false)} onOpenLogin={onOpenLogin} onRegistered={setRegistrationResult} />
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
