import { Button } from "@/components/ui/button";
import { Calendar, Newspaper } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
      
      <div className="container relative mx-auto px-4 py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <span className="mr-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
            Добре дошли в училищния блог!
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Бъдете в крак с всичко за
            <span className="block text-primary">Нашата Училищна Общност</span>
          </h1>

          {/* Subheadline */}
          <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
           Достъп до най-новите новини, предстоящи събития и важни актуализации, всичко на едно място.
           Създадено за ученици, родители и преподаватели.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 px-8 shadow-lg transition-transform hover:scale-105">
              <Newspaper className="h-5 w-5" />
              Последни Новини
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 px-8 transition-transform hover:scale-105"
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
