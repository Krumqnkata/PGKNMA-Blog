import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, MoveLeft, Terminal } from "lucide-react";
import { InteriorPage, InteriorSection } from "@/components/InteriorPage";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(">[ERROR] SYSTEM FAILURE: ROUTE NOT FOUND:", location.pathname);
  }, [location.pathname]);

  return (
    <InteriorPage>
      <InteriorSection className="flex min-h-[72vh] items-center">
        <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-border/70 bg-card p-7 text-center shadow-2xl sm:p-12 lg:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.18),transparent_45%),linear-gradient(to_right,hsl(var(--border)/0.18)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.18)_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px]" aria-hidden="true" />
          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm"><Terminal className="h-8 w-8" aria-hidden="true" /></div>
            <p className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-primary">Грешка 404</p>
            <h1 className="mt-3 text-balance text-4xl font-black tracking-[-0.04em] sm:text-6xl">Тази страница не е тук</h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">Адресът <span className="break-all font-semibold text-foreground">{location.pathname}</span> не води до активна страница. Върнете се назад или продължете към началото.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button onClick={() => navigate(-1)} variant="outline" size="lg"><MoveLeft className="h-5 w-5" />Назад</Button>
              <Button asChild size="lg"><Link to="/"><Home className="h-5 w-5" />Към началото</Link></Button>
            </div>
          </div>
        </div>
      </InteriorSection>
    </InteriorPage>
  );
};

export default NotFound;
