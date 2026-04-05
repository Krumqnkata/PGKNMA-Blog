import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Newspaper } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const phrases = [
    "Нашата Гимназия",
    "Училищния Живот",
    "Твоето Бъдеще",
    "Новите Технологии",
    "Нашите Проекти",
  ];

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
    <section className="relative overflow-hidden border-b border-border">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
      
      <div className="container relative mx-auto px-4 py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <span className="mr-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
            Добре дошли в ПГКНМА Блог!
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl min-h-[3em] sm:min-h-[2.5em] lg:min-h-0">
            Бъдете в крак с всичко за{" "}
            <span className="block text-primary">
              {text}
              <span className="ml-1 inline-block h-[0.9em] w-1 animate-pulse bg-primary align-middle" />
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
           Твоят информационен център: актуални новини и предстоящи събития за гимназията.
           Създадено за ученици, родители и учители.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 px-8 shadow-lg transition-transform hover:scale-105" onClick={() => navigate("/news")}>
              <Newspaper className="h-5 w-5" />
              Последни Новини
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 px-8 transition-transform hover:scale-105"
              onClick={() => navigate("/events")}
            >
              <Calendar className="h-5 w-5" />
              Училищен Календар
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </section>
  );
};

export default Hero;
