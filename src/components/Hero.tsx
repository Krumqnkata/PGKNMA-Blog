import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Newspaper, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const phrases = useMemo(() => [
    "Нашата Гимназия",
    "Училищния Живот",
    "Вашето Бъдеще",
    "Новите Технологии",
    "Нашите Проекти",
  ], []);

  useEffect(() => {
    const handleType = () => {
      const i = loopNum % phrases.length;
      const fullText = phrases[i];

      setText(
        isDeleting
          ? fullText.substring(0, text.length - 1)
          : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 75 : 150);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed, phrases]);

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      {/* Background Textures/Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary-foreground)_0%,transparent_40%)] opacity-20" />
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      
      <div className="container relative mx-auto px-4 py-12 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Content Column */}
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left xl:col-span-6 order-first">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="mr-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
              Добре дошли в ПГКНМА Блог!
            </div>

            {/* Headline */}
            <h1 className="mb-8 text-3xl font-extrabold tracking-tight sm:text-6xl xl:text-7xl leading-[1.1]">
              Бъдете в крак с всичко за{" "}
              <span className="block text-primary italic">
                {text}
                <span className="ml-1 inline-block h-[0.9em] w-1.5 animate-pulse bg-primary align-middle" />
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mb-10 max-w-xl text-base text-muted-foreground sm:text-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
             Твоят информационен център: актуални новини и предстоящи събития за гимназията.
             Създадено с внимание за ученици, родители и учители.
            </p>

            {/* CTAs */}
            <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row animate-in fade-in slide-in-from-bottom-12 duration-1000">
              <Button size="lg" className="h-12 sm:h-14 gap-2 px-8 text-base sm:text-lg shadow-xl shadow-primary/20 transition-all hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-primary/30" onClick={() => navigate("/news")}>
                <Newspaper className="h-5 w-5" />
                Последни Новини
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 sm:h-14 gap-2 px-8 text-base sm:text-lg backdrop-blur-sm transition-all hover:bg-primary/5 hover:translate-y-[-2px]"
                onClick={() => navigate("/events")}
              >
                <Calendar className="h-5 w-5" />
                Училищен Календар
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="h-12 sm:h-14 gap-2 px-8 text-base sm:text-lg backdrop-blur-sm transition-all hover:bg-primary/10 hover:translate-y-[-2px]"
                onClick={() => navigate("/contact")}
              >
                <Mail className="h-5 w-5" />
                Свържи се с нас
              </Button>
            </div>
          </div>

          {/* Visual Column - The "Grid Breaker" */}
          <div className="relative lg:col-span-5 xl:col-span-6 order-last lg:order-last mb-12 lg:mb-0 w-full">
            <div className="relative mx-auto aspect-square max-w-[350px] sm:max-w-[500px]">
              {/* Decorative behind elements */}
              <div className="absolute -inset-4 rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
              
              {/* Main Visual Composition */}
              <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border bg-card shadow-2xl group/image">
                <video
                  src="/front-page-loop.webm"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover/image:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />

                {/* Floating UI Element 2 */}
                <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 animate-pulse">
                  <div className="rounded-xl border border-border/50 bg-background/80 p-4 sm:p-6 backdrop-blur-md shadow-lg">
                    <div className="text-xl sm:text-3xl font-black text-primary">450+</div>
                    <div className="text-[10px] sm:text-xs uppercase tracking-widest text-foreground/70 font-bold">Усмихнати лица в гимназията</div>
                  </div>
                </div>
              </div>
              
              {/* Out-of-bounds accent - Precisely on top-right corner */}
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-1/2 translate-x-1/2 rounded-full border-4 border-primary/20 animate-spin [animation-duration:10s]" />
              
              {/* Pinging dot - Precisely on bottom-left corner */}
              <div className="absolute bottom-0 left-0 h-4 w-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary animate-ping" />
            </div>
          </div>
        </div>
      </div>

      {/* Modern Section Divider */}
      <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
