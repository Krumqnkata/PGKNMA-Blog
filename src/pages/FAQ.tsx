import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Info, UserPlus, Music, Calendar, ShieldAlert, Code } from "lucide-react";
import { cn } from "@/lib/utils";

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

const FAQ = () => {
  const faqs = [
    {
      question: "Какво е ПГКНМА Блог?",
      answer: "ПГКНМА Блог е дигитална платформа, създадена за учениците, учителите и родителите на Професионална гимназия по компютърно моделиране и компютърни системи \"Проф. Минко Балкански\". Тук можете да намерите новини, събития и училищни проекти.",
      icon: Info,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      hover: "group-hover:bg-blue-500/20"
    },
    {
      question: "Как мога да се регистрирам?",
      answer: "Регистрацията става чрез бутона в горния десен ъгъл. Можете да използвате вашия Google акаунт за бърз вход или да създадете нов профил с потребителско име и парола.",
      icon: UserPlus,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      hover: "group-hover:bg-emerald-500/20"
    },
    {
      question: "Как работи входът с Google?",
      answer: "Ако имате съществуващ акаунт, регистриран с Google имейл, вече можете да влизате директно чрез опцията „Вход с Google“. Важно е да знаете, че акаунтите, създадени по стандартния начин (с имейл), имат собствена парола за вход, докато акаунтите, създадени директно чрез Google профила, нямат отделна парола в нашата система.",
      icon: GoogleIcon,
      color: "", 
      bg: "bg-gray-500/10",
      hover: "group-hover:bg-gray-500/20"
    },
    {
      question: "Как мога да предложа песен за училищния звънец?",
      answer: "След като влезете в профила си, отидете на страницата \"Предложения за звънец\". Там можете да поставите линк към песен (например от YouTube) и да изберете за кой час се отнася вашето предложение.",
      icon: Music,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      hover: "group-hover:bg-pink-500/20"
    },
    {
      question: "Къде мога да видя седмичната програма?",
      answer: "Програмата е достъпна в менюто \"Програма\" в заглавната част на сайта. Тя се актуализира редовно от училищното ръководство, за да отразява всички промени.",
      icon: Calendar,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      hover: "group-hover:bg-orange-500/20"
    },
    {
      question: "Забравих си паролата. Какво да направя?",
      answer: "В момента платформата не поддържа автоматично възстановяване на парола. Моля, свържете се с администратор на сайта или използвайте Google Login, ако сте го активирали при регистрацията.",
      icon: ShieldAlert,
      color: "text-red-500",
      bg: "bg-red-500/10",
      hover: "group-hover:bg-red-500/20"
    },
    {
      question: "Кой поддържа и развива този сайт?",
      answer: "Сайтът е разработен и се поддържа от екип ученици на ПГКНМА \"Проф. Минко Балкански\" като част от техните извънкласни дейности и практически ИТ проекти.",
      icon: Code,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      hover: "group-hover:bg-indigo-500/20"
    },
    {
      question: "Как мога да публикувам статия в блога?",
      answer: "Статиите се публикуват от оторизирани автори (ученици и учители). Ако имаш интересна тема или новина, която искаш да споделиш, свържи се с редакционния екип или с някой от вашите преподаватели.",
      icon: Info,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      hover: "group-hover:bg-cyan-500/20"
    },
    {
      question: "Мога ли да редактирам или изтривам моите коментари?",
      answer: "Да, след като влезете в профила си, можете да управлявате своите коментари през страницата „Моят профил“.",
      icon: UserPlus,
      color: "text-teal-500",
      bg: "bg-teal-500/10",
      hover: "group-hover:bg-teal-500/20"
    },
    {
      question: "Как се избира „Меме на седмицата“?",
      answer: "Всеки регистриран потребител може да качи свое меме. Победителят се определя чрез гласуване от общността в края на всяка седмица.",
      icon: Music,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      hover: "group-hover:bg-purple-500/20"
    },
    {
      question: "Има ли мобилно приложение за ПГКНМА Блог?",
      answer: "Сайтът е напълно оптимизиран за мобилни устройства. Можете да го добавите на началния си екран като „пряк път“ през настройките на вашия браузър (Chrome или Safari) за по-бърз достъп.",
      icon: HelpCircle,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      hover: "group-hover:bg-amber-500/20"
    },
    {
      question: "Безопасни ли са данните ми в платформата?",
      answer: "Да, ние спазваме строги правила за поверителност и сигурност. Използваме съвременни методи за криптиране на данните и защита на потребителските профили.",
      icon: ShieldAlert,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      hover: "group-hover:bg-rose-500/20"
    },
    {
      question: "Има ли правила за избор на песни за звънеца?",
      answer: "Песните не трябва да съдържат нецензурни думи, обидни текстове или неподходящо съдържание. Администраторите преглеждат предложенията и премахват тези, които не съответстват на училищната етика.",
      icon: Music,
      color: "text-fuchsia-500",
      bg: "bg-fuchsia-500/10",
      hover: "group-hover:bg-fuchsia-500/20"
    },
    {
      question: "Какво се случва при нарушение на правилата?",
      answer: "При обидни коментари или системни нарушения на правилата на общността, потребителят може да получи предупреждение или временна забрана (бан) за достъп до определени функции на сайта.",
      icon: ShieldAlert,
      color: "text-orange-600",
      bg: "bg-orange-600/10",
      hover: "group-hover:bg-orange-600/20"
    },
    {
      question: "Мога ли да помогна с разработката на този сайт?",
      answer: "Разбира се! Проектът е с отворен код за учениците на гимназията. Ако се интересувате от програмиране или дизайн, вижте секцията „Разработчици“ и се свържете с екипа.",
      icon: Code,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      hover: "group-hover:bg-violet-500/20"
    },
    {
      question: "Сайтът официален източник на информация ли е?",
      answer: "Блогът е ученическа инициатива. Въпреки че се стремим към точност, за официални административни въпроси винаги проверявайте и основния сайт на гимназията: pgknma.com.",
      icon: Info,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
      hover: "group-hover:bg-sky-500/20"
    },
    {
      question: "Как мога да променя данните в профила си?",
      answer: "Отидете на страницата „Моят профил“ и изберете „Настройки“. Там можете да промените вашето потребителско име и парола (ако не сте използвали Google Login).",
      icon: UserPlus,
      color: "text-lime-600",
      bg: "bg-lime-600/10",
      hover: "group-hover:bg-lime-600/20"
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background">
      <Header />
      <main className="py-16 px-4 md:px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-500/10 mb-2">
              <HelpCircle className="h-8 w-8 text-amber-500" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Често задавани въпроси
            </h1>
            <p className="text-xl text-muted-foreground">
              Всичко, което трябва да знаете за платформата ПГКНМА Блог.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm p-2 md:p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b last:border-0 border-border/50">
                  <AccordionTrigger className="hover:no-underline py-4 px-2 text-left group">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg transition-colors", faq.bg, faq.hover)}>
                        <faq.icon className={cn("h-5 w-5", faq.color)} />
                      </div>
                      <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {faq.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed px-12 pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-12 p-8 bg-primary/5 rounded-2xl border border-primary/10 text-center space-y-4">
            <h2 className="text-2xl font-bold">Все още имате въпроси?</h2>
            <p className="text-muted-foreground">
              Ако не намирате отговора, който търсите, не се колебайте да се свържете с нас.
            </p>
            <div className="pt-2">
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
              >
                Свържете се с нас
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BackToTop />
      <CookieConsent />
    </div>
  );
};

export default FAQ;
