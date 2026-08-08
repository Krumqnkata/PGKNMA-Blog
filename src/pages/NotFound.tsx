import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, MoveLeft, Terminal } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(">[ERROR] SYSTEM FAILURE: ROUTE NOT FOUND:", location.pathname);
  }, [location.pathname]);

  const bgDark = "#0d1f1f";
  const textRetro = "#fcead8";
  const accentOrange = "#f5a66b";

  return (
    <div 
      className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden p-4 text-center font-mono"
      style={{ backgroundColor: bgDark, color: textRetro }}
    >
      {/* CRT Scanline Overlay */}
      <div className="pointer-events-none absolute inset-0 z-50 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15)_0px,rgba(0,0,0,0.15)_1px,transparent_1px,transparent_3px)] opacity-50"></div>
      
      {/* Vignette Effect */}
      <div className="pointer-events-none absolute inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>

      {/* Background 404 Glitch */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
        <span className="text-[20rem] font-black tracking-tighter md:text-[30rem]" style={{ textShadow: `8px 8px 0px ${accentOrange}` }}>
          404
        </span>
      </div>

      <div className="relative z-10 space-y-8">
        <Terminal className="mx-auto h-16 w-16 mb-4 animate-pulse" style={{ color: accentOrange }} />

        <div className="flex flex-col items-center">
          <div 
            className="mb-4 z-20 -rotate-3 border-2 border-dashed px-4 py-2 text-sm font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]"
            style={{ backgroundColor: accentOrange, color: bgDark, borderColor: bgDark }}
          >
             ГРЕШКА В СИСТЕМАТА
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl uppercase" style={{ textShadow: `0 0 10px ${accentOrange}44` }}>
            Ахой! Тук няма нищо.<span className="animate-pulse">_</span>
          </h1>
        </div>

        <div className="mx-auto max-w-[600px] border-l-4 border-dashed pl-6 text-lg sm:text-xl text-left" style={{ borderColor: accentOrange }}>
          <p className="mb-2"> {">"} DIAGNOSTIC: Адресът е невалиден.</p>
          <p> {">"} STATUS: Страницата е отплавала в неизвестна посока.</p>
        </div>

        <div className="flex flex-col flex-wrap items-center justify-center gap-6 sm:flex-row pt-8">
          {/* Бутон Назад */}
          <Button 
            onClick={() => navigate(-1)}
            variant="ghost"
            className="group relative rounded-none border-2 px-8 py-6 font-bold uppercase tracking-widest transition-all hover:bg-white/5"
            style={{ borderColor: textRetro, color: textRetro, boxShadow: `4px 4px 0px 0px ${textRetro}` }}
          >
            <MoveLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
            Назад
          </Button>

          {/* Бутон Начало */}
          <Button asChild 
            className="group relative rounded-none border-2 px-8 py-6 font-bold uppercase tracking-widest transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            style={{ backgroundColor: accentOrange, borderColor: accentOrange, color: bgDark, boxShadow: `4px 4px 0px 0px ${textRetro}` }}
          >
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Към Началото
            </Link>
          </Button>
        </div>
      </div>

    </div>
  );
};

export default NotFound;
