import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Rocket, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { InteriorPage, InteriorPageHero, InteriorSection } from "@/components/InteriorPage";
import { TEAM_INTRO, TEAM_JOIN_TEXT, TEAM_JOIN_TITLE, TEAM_MEMBERS, TEAM_NOTE } from "@/content/team";

// Texts live in src/content/team.ts (also used by the AI assistant).
const developers = TEAM_MEMBERS;

const Developers = () => {
  return (
    <InteriorPage>
      <InteriorPageHero eyebrow="Технологичен екип" title={<>Хората зад <span className="text-primary">ПГКНМА Блог</span></>} description={TEAM_INTRO} art="laptop" />
      <InteriorSection>

        <div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {developers.map((dev, index) => (
            <Card 
              key={index} 
              className="group relative flex h-full flex-col overflow-hidden transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 motion-reduce:hover:translate-y-0"
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
        <div className="mx-auto mb-16 max-w-5xl px-0 sm:px-2">
          <Card className="relative overflow-hidden border-2 border-dashed border-primary/30 bg-primary/5 p-6 md:p-10 transition-all duration-300 hover:border-primary hover:bg-primary/10 group">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="w-24 h-24 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <Plus className="w-12 h-12 text-primary animate-pulse" />
              </div>
              
              <div className="flex-grow text-center md:text-left space-y-3">
                <CardTitle className="text-3xl md:text-4xl font-bold">{TEAM_JOIN_TITLE}</CardTitle>
                <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                  {TEAM_JOIN_TEXT}
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
          * {TEAM_NOTE}
        </div>
      </InteriorSection>
    </InteriorPage>
  );
};

export default Developers;
