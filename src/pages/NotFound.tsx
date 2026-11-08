import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dices, Home, MoveLeft } from "lucide-react";
import { InteriorPage, InteriorSection } from "@/components/InteriorPage";
import { SiteArt } from "@/components/art/SiteArt";

const EXCUSES = [
  "Тази страница излезе в междучасието и още не се е върнала.",
  "Страницата е освободена от час. Има бележка от родител.",
  "Търсихме я в кабинета, в столовата и зад физкултурния салон. Няма я.",
  "Кучето изяде тази страница. Честно.",
  "Звънецът би, а страницата така и не дойде на час.",
  "Отсъства по уважителни причини. Или поне така твърди.",
  "Излезе до тоалетната преди 40 минути.",
  "Каза, че си е забравила тетрадката, и се прибра до вкъщи.",
  "Днес е на олимпиада. Коя точно, никой не знае.",
];

const pickExcuse = (current?: number) => {
  // Skips the current one, so asking for another always changes the text.
  const offset = current === undefined ? 0 : 1;
  const index = Math.floor(Math.random() * (EXCUSES.length - offset));
  return current !== undefined && index >= current ? index + 1 : index;
};

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [excuse, setExcuse] = useState(() => pickExcuse());

  useEffect(() => {
    console.error(">[ERROR] SYSTEM FAILURE: ROUTE NOT FOUND:", location.pathname);
  }, [location.pathname]);

  return (
    <InteriorPage>
      <InteriorSection className="flex min-h-[72vh] items-center">
        <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-border/70 bg-card p-7 text-center shadow-2xl sm:p-12 lg:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.18),transparent_45%),linear-gradient(to_right,hsl(var(--border)/0.18)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.18)_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px]" aria-hidden="true" />
          <div className="relative">
            <SiteArt name="map" className="art-wiggle mx-auto block h-24 w-24 sm:h-28 sm:w-28" />
            <p className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-primary">Грешка 404</p>
            <h1 className="mt-3 text-balance text-4xl font-black tracking-[-0.04em] sm:text-6xl">Тази страница отсъства</h1>
            <p aria-live="polite" className="mx-auto mt-5 max-w-xl text-pretty text-lg font-semibold leading-relaxed sm:text-xl">{EXCUSES[excuse]}</p>
            <Button type="button" variant="ghost" size="sm" className="mt-2 gap-2 text-muted-foreground" onClick={() => setExcuse(pickExcuse(excuse))}>
              <Dices className="h-4 w-4" aria-hidden="true" />
              Друго оправдание
            </Button>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">Адресът <span className="break-all font-semibold text-foreground">{location.pathname}</span> не води до активна страница.</p>
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
