import { useMemo, useState, type ElementType } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Info, UserPlus, Music, Calendar, ShieldAlert, Code, Zap, Smartphone, MessageSquare, Bug, Globe, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InteriorPage, InteriorPageHero, InteriorSection } from "@/components/InteriorPage";
import { QueryEmptyState } from "@/components/query/QueryStates";
import { FAQ_ENTRIES } from "@/content/faq";

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const FAQ_STYLES: Record<string, { icon: ElementType; color: string; bg: string; hover: string }> = {
  "faq-01": { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", hover: "group-hover:bg-blue-500/20" },
  "faq-02": { icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-500/10", hover: "group-hover:bg-emerald-500/20" },
  "faq-03": { icon: GoogleIcon, color: "", bg: "bg-gray-500/10", hover: "group-hover:bg-gray-500/20" },
  "faq-04": { icon: Smartphone, color: "text-cyan-500", bg: "bg-cyan-500/10", hover: "group-hover:bg-cyan-500/20" },
  "faq-05": { icon: Music, color: "text-pink-500", bg: "bg-pink-500/10", hover: "group-hover:bg-pink-500/20" },
  "faq-06": { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10", hover: "group-hover:bg-yellow-500/20" },
  "faq-07": { icon: Calendar, color: "text-orange-500", bg: "bg-orange-500/10", hover: "group-hover:bg-orange-500/20" },
  "faq-08": { icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10", hover: "group-hover:bg-purple-500/20" },
  "faq-09": { icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10", hover: "group-hover:bg-red-500/20" },
  "faq-10": { icon: Bug, color: "text-red-400", bg: "bg-red-400/10", hover: "group-hover:bg-red-400/20" },
  "faq-11": { icon: Globe, color: "text-blue-400", bg: "bg-blue-400/10", hover: "group-hover:bg-blue-400/20" },
  "faq-12": { icon: Code, color: "text-indigo-500", bg: "bg-indigo-500/10", hover: "group-hover:bg-indigo-500/20" },
  "faq-13": { icon: MessageSquare, color: "text-green-500", bg: "bg-green-500/10", hover: "group-hover:bg-green-500/20" },
  "faq-14": { icon: ShieldAlert, color: "text-orange-400", bg: "bg-orange-400/10", hover: "group-hover:bg-orange-400/20" },
  "faq-15": { icon: Zap, color: "text-yellow-600", bg: "bg-yellow-600/10", hover: "group-hover:bg-yellow-600/20" },
  "faq-16": { icon: Music, color: "text-purple-500", bg: "bg-purple-500/10", hover: "group-hover:bg-purple-500/20" },
  "faq-17": { icon: Smartphone, color: "text-blue-500", bg: "bg-blue-500/10", hover: "group-hover:bg-blue-500/20" },
  "faq-18": { icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-500/10", hover: "group-hover:bg-rose-500/20" },
  "faq-19": { icon: ShieldAlert, color: "text-orange-600", bg: "bg-orange-600/10", hover: "group-hover:bg-orange-600/20" },
  "faq-20": { icon: Info, color: "text-sky-500", bg: "bg-sky-500/10", hover: "group-hover:bg-sky-500/20" },
  "faq-21": { icon: UserPlus, color: "text-lime-600", bg: "bg-lime-600/10", hover: "group-hover:bg-lime-600/20" },
  "faq-22": { icon: MessageSquare, color: "text-teal-500", bg: "bg-teal-500/10", hover: "group-hover:bg-teal-500/20" },
  "faq-23": { icon: Music, color: "text-fuchsia-500", bg: "bg-fuchsia-500/10", hover: "group-hover:bg-fuchsia-500/20" },
  "faq-24": { icon: Code, color: "text-slate-500", bg: "bg-slate-500/10", hover: "group-hover:bg-slate-500/20" },
};

const faqs = FAQ_ENTRIES.map((entry) => ({ ...entry, ...FAQ_STYLES[entry.id] }));

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("bg");
    if (!query) return faqs;
    return faqs.filter(({ question, answer }) =>
      `${question} ${answer}`.toLocaleLowerCase("bg").includes(query),
    );
  }, [searchQuery]);

  return (
    <InteriorPage>
      <InteriorPageHero eyebrow="Помощен център" title={<>Често задавани <span className="text-primary">въпроси</span></>} description="Бързи и ясни отговори за профила, съдържанието и функциите на платформата." art="help" />
      <InteriorSection containerClassName="max-w-3xl">

          <div className="relative mx-auto mb-6 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Търсене във въпросите…"
              className="h-12 rounded-xl bg-card/70 pl-10 shadow-sm backdrop-blur-sm transition-shadow focus-visible:shadow-md"
              aria-label="Търсене в често задаваните въпроси"
            />
          </div>

          <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-xl shadow-primary/5 backdrop-blur-md">
            <div className="p-2 sm:p-4 md:p-6">
              {filteredFaqs.length > 0 ? <Accordion type="single" collapsible className="w-full space-y-2">
                {filteredFaqs.map((faq) => (
                  <AccordionItem 
                    key={faq.question}
                    value={faq.question}
                    className="rounded-2xl border border-transparent bg-muted/25 px-4 transition-[background-color,border-color,box-shadow] duration-300 hover:border-border/70 hover:bg-muted/50 data-[state=open]:border-primary/20 data-[state=open]:bg-primary/5 data-[state=open]:shadow-sm"
                  >
                    <AccordionTrigger className="hover:no-underline py-5 text-left group">
                      <div className="flex items-center gap-4">
                        <div className={cn("p-2.5 rounded-xl transition-all duration-300 shadow-inner", faq.bg, faq.hover)}>
                          <faq.icon className={cn("h-5 w-5", faq.color)} />
                        </div>
                        <span className="text-lg font-semibold text-foreground/90 group-hover:text-primary transition-colors">
                          {faq.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed pl-14 pr-4 pb-6">
                      <div className="h-[1px] w-full bg-gradient-to-r from-primary/30 to-transparent mb-4" />
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion> : (
                <QueryEmptyState
                  art="help"
                  title="Този въпрос още никой не го е задал"
                  description="Няма въпроси, отговарящи на търсенето. Опитайте с друга дума или ни питайте директно."
                  className="m-4"
                >
                  <Button asChild variant="outline"><Link to="/contact">Питай ни</Link></Button>
                </QueryEmptyState>
              )}
            </div>
          </div>

          <div className="group relative mt-12 space-y-6 overflow-hidden rounded-3xl border border-primary/20 bg-primary/10 p-7 text-center shadow-lg backdrop-blur-lg sm:p-10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold">Все още имате въпроси?</h2>
              <p className="text-muted-foreground text-lg">
                Ако не намирате отговора, който търсите, нашият екип е тук, за да помогне.
              </p>
              <div className="pt-6">
                <Button asChild size="lg"><Link to="/contact">Свържете се с нас</Link></Button>
              </div>
            </div>
          </div>
      </InteriorSection>
    </InteriorPage>
  );
};

export default FAQ;
