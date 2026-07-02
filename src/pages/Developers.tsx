import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import ParticlesComponent from "@/components/Particles";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Code2, Rocket, Plus } from "lucide-react";
import CookieConsent from "@/components/CookieConsent";
import { Link } from "react-router-dom";

const developers = [
  {
    name: "Александър /@ad0312/",
    role: "Full-Stack гуру и главен архитект",
    avatar: "https://avatars.githubusercontent.com/u/246351746?v=4",
    github: "https://github.com/ythef0",
    skills: ["Python", "Django", "MySQL", "System Architecture"],
    color: "blue",
  },
  {
    name: "Крум /@Krumqnkata/",
    role: "UI/UX нинджа и фронтенд магьосник",
    avatar: "https://avatars.githubusercontent.com/u/213969107?v=4",
    github: "https://github.com/Krumqnkata",
    skills: ["React", "TypeScript", "Tailwind CSS", "Design Systems"],
    color: "emerald",
  },
  {
    name: "Инж. Людмил Бонев",
    role: "Ментор и двигател на проекта",
    avatar: "https://avatars.githubusercontent.com/u/86717130?v=4",
    github: "https://github.com/lkbonev72",
    skills: ["Mentorship", "Project Management", "Technical Advisory"],
    color: "orange",
  },
];

const Developers = () => {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen w-full flex flex-col relative bg-background font-sofia">
      <ParticlesComponent id="tsparticles" theme={theme} />
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center p-2 px-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-2">
            <Code2 className="w-4 h-4 mr-2" />
            Технологичен Екип
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            Хората зад <span className="text-primary">ПГКНМА Блог</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ние сме екип от ентусиасти, отдадени на идеята да създадем най-добрата дигитална среда за нашето училище.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {developers.map((dev, index) => (
            <Card 
              key={index} 
              className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 border-border/50 hover:border-primary/50 flex flex-col h-full"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Avatar className="w-28 h-28 border-4 border-background shadow-xl relative z-10 transition-transform duration-500 group-hover:scale-105">
                    <AvatarImage src={dev.avatar} alt={dev.name} />
                    <AvatarFallback className="bg-secondary text-2xl">
                      {dev.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="mt-6 space-y-1">
                  <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                    {dev.name}
                  </CardTitle>
                  <CardDescription className="text-md font-medium text-foreground/80">
                    {dev.role}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="text-center flex-grow flex flex-col justify-between space-y-6 pt-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {dev.skills.map((skill, sIndex) => (
                    <Badge 
                      key={sIndex} 
                      variant="secondary" 
                      className="bg-secondary/50 text-xs font-semibold py-1 hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-border/50 mt-auto">
                  <Button asChild variant="outline" className="w-full rounded-xl group/btn hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                    <a
                      href={dev.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <Github className="w-4 h-4 transition-transform group-hover/btn:rotate-12" />
                      GitHub Профил
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Join Us Section - Rectangular Horizontal Bar */}
        <div className="max-w-5xl mx-auto mb-16 px-2">
          <Card className="relative overflow-hidden border-2 border-dashed border-primary/30 bg-primary/5 p-6 md:p-10 transition-all duration-300 hover:border-primary hover:bg-primary/10 group">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="w-24 h-24 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <Plus className="w-12 h-12 text-primary animate-pulse" />
              </div>
              
              <div className="flex-grow text-center md:text-left space-y-3">
                <CardTitle className="text-3xl md:text-4xl font-bold">Тук можеш да бъдеш ти!</CardTitle>
                <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                  Имаш умения в програмирането, дизайна или писането на статии? 
                  Стани част от нашия растящ екип и развивай платформата заедно с нас.
                </p>
              </div>

              <div className="w-full md:w-auto">
                <Button asChild size="lg" className="w-full md:px-10 h-14 text-lg rounded-xl shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-105 active:scale-95">
                  <Link to="/contact" className="flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Свържи се с нас
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center text-muted-foreground text-sm opacity-60 italic">
          * Проектът е разработен с образователна цел и е с отворен код.
        </div>
      </main>

      <Footer />
      <BackToTop />
      <CookieConsent/>
    </div>
  );
};

export default Developers;
