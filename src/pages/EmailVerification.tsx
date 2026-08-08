import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, CircleAlert, Loader2, MailCheck, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { resendVerificationEmail } from "@/lib/api";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status") || "invalid";
  const { openLoginDialog } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const successful = status === "verified" || status === "already-verified";
  const title = status === "verified"
    ? "Имейлът е потвърден"
    : status === "already-verified"
      ? "Имейлът вече е потвърден"
      : status === "expired"
        ? "Линкът е изтекъл"
        : "Линкът не е валиден";
  const description = successful
    ? "Профилът ви е готов. Вече можете да влезете с потребителско име и парола."
    : "Поискайте нов линк за потвърждение с имейла, използван при регистрацията.";

  const handleResend = async () => {
    if (!email.trim()) {
      setMessage("Въведете имейл адреса от регистрацията.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const result = await resendVerificationEmail(email.trim());
      setMessage(result.detail);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Неуспешно повторно изпращане.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[65vh] flex-col bg-background">
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <section className="w-full max-w-lg rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-10">
          <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${successful ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
            {successful ? <CheckCircle2 className="h-9 w-9" /> : <CircleAlert className="h-9 w-9" />}
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          <p className="mt-3 text-muted-foreground">{description}</p>

          {successful ? (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={openLoginDialog}>
                <MailCheck className="mr-2 h-4 w-4" />
                Вход в профила
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Към началната страница</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-7 space-y-3 text-left">
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@school.bg"
                disabled={loading}
              />
              <Button className="w-full" onClick={handleResend} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Изпрати нов линк
              </Button>
              {message && <p className="text-center text-sm text-muted-foreground">{message}</p>}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default EmailVerification;
