import { useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw, Settings } from "lucide-react";
import { Link, Navigate, useSearchParams } from "react-router-dom";

import { SiteArt } from "@/components/art/SiteArt";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { RegistrationForm } from "@/components/auth/RegistrationForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/hooks/use-settings";
import { resendVerificationEmail } from "@/lib/api";
import type { RegistrationResponse } from "@/lib/api";
import { getSafeNextPath, loginPath } from "@/lib/auth-paths";

const Register = () => {
  const { isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();
  const [registrationResult, setRegistrationResult] = useState<RegistrationResponse | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const next = getSafeNextPath(searchParams.get("next"));
  const loginHref = loginPath(next);

  useEffect(() => {
    if (registrationResult) successHeadingRef.current?.focus();
  }, [registrationResult]);

  if (isAuthenticated) return <Navigate to={next} replace />;

  const handleResend = async () => {
    if (!registrationResult?.email) return;
    setResendLoading(true);
    setResendMessage("");
    try {
      const result = await resendVerificationEmail(registrationResult.email);
      setResendMessage(result.detail);
    } catch (caughtError: unknown) {
      setResendMessage(caughtError instanceof Error ? caughtError.message : "Неуспешно повторно изпращане.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthPageLayout
      art="badge"
      title="Създай профил"
      description={settings?.enable_user_registration
        ? "Попълнете данните си, за да създадете профил."
        : "Регистрациите са временно спрени от администратор."}
      mode="register"
      next={next}
    >
      {registrationResult ? (
        <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 px-2 py-4 text-center">
          <SiteArt name="envelope" className="art-pop h-20 w-20 drop-shadow-sm" />
          <div className="space-y-2">
            <h2 ref={successHeadingRef} tabIndex={-1} className="text-lg font-semibold outline-none">
              {registrationResult.verification_required ? "Потвърдете имейла си" : "Профилът е потвърден"}
            </h2>
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
          <Button asChild className="w-full"><Link to={loginHref}>Към входа</Link></Button>
        </div>
      ) : settings?.enable_user_registration ? (
        <RegistrationForm onRegistered={setRegistrationResult} />
      ) : (
        <div className="flex flex-col items-center justify-center p-4 text-center sm:p-6">
          <Settings className="mb-4 h-16 w-16 text-muted-foreground" aria-hidden="true" />
          <p className="text-muted-foreground">Регистрациите на нови потребители са временно изключени.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Вече имаш профил?{" "}
            <Link to={loginHref} className="font-semibold text-primary hover:underline">Вход</Link>
          </p>
        </div>
      )}
    </AuthPageLayout>
  );
};

export default Register;
