import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, CircleAlert, Loader2, MailCheck, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resendVerificationEmail } from "@/lib/api";
import { InteriorPage, InteriorSection } from "@/components/InteriorPage";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status") || "invalid";
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
    <InteriorPage>
      <InteriorSection className="flex min-h-[70vh] items-center">
        <section className="relative mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-border/70 bg-card p-6 text-center shadow-2xl shadow-primary/5 sm:p-10">
          <div className={`absolute inset-x-0 top-0 h-1.5 ${successful ? "bg-emerald-500" : "bg-amber-500"}`} aria-hidden="true" />
          <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm ${successful ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
            {successful ? <CheckCircle2 className="h-9 w-9" /> : <CircleAlert className="h-9 w-9" />}
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Потвърждение на профил</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">{description}</p>

          {successful ? (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link to="/login">
                  <MailCheck className="mr-2 h-4 w-4" />
                  Вход в профила
                </Link>
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
              {message && <p role="status" className="rounded-xl bg-muted/60 p-3 text-center text-sm text-muted-foreground">{message}</p>}
            </div>
          )}
        </section>
      </InteriorSection>
    </InteriorPage>
  );
};

export default EmailVerification;
