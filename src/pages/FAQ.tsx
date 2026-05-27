import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import ParticlesComponent from "@/components/Particles";
import { useTheme } from "next-themes";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Info, UserPlus, Music, Calendar, ShieldAlert, Code, Zap, Smartphone, MessageSquare, Bug, Globe } from "lucide-react";
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
  const { theme } = useTheme();

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
      question: "Какво е PWA и как да инсталирам сайта като приложение?",
      answer: "PWA (Progressive Web App) позволява на сайта да работи като мобилно приложение. В Chrome натиснете трите точки и изберете „Install app“, а в Safari използвайте бутона „Share“ и „Add to Home Screen“. Така ще имате бърз достъп от вашия начален екран.",
      icon: Smartphone,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      hover: "group-hover:bg-cyan-500/20"
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
      question: "Колко пъти мога да гласувам за песен?",
      answer: "Всеки потребител може да предложи до неограничен брой песни на ден. Гласуването за вече предложени песни е неограничено, но системата следи за злоупотреби и автоматизиран вот.",
      icon: Zap,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      hover: "group-hover:bg-yellow-500/20"
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
      question: "Кога се сменят меметата в „Меме на седмицата“?",
      answer: "Нов цикъл започва всеки понеделник сутрин. Гласуването приключва в неделя вечер, след което се обявява победителят и списъкът се нулира за нови предложения.",
      icon: Calendar,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      hover: "group-hover:bg-purple-500/20"
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
      question: "Къде да съобщя за забелязан бъг или проблем?",
      answer: "Можете да използвате формата за контакт или да се свържете директно с екипа разработчици през Discord или в училище. Всяка обратна връзка ни помага да направим сайта по-добър.",
      icon: Bug,
      color: "text-red-400",
      bg: "bg-red-400/10",
      hover: "group-hover:bg-red-400/20"
    },
    {
      question: "Как работи офлайн режимът?",
      answer: "Благодарение на Service Workers, веднъж зареден, сайтът запазва основните новини и програмата в кеша на вашия браузър. Можете да преглеждате това съдържание дори без активна интернет връзка.",
      icon: Globe,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      hover: "group-hover:bg-blue-400/20"
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
      question: "Как мога да стана автор на статии в блога?",
      answer: "Търсим активни ученици с интерес към писането! Свържете се с редакционния екип или с преподавател по БЕЛ/ИТ. След кратко одобрение ще получите авторски права в системата.",
      icon: MessageSquare,
      color: "text-green-500",
      bg: "bg-green-500/10",
      hover: "group-hover:bg-green-500/20"
    },
    {
      question: "Как се одобряват коментарите?",
      answer: "Коментарите се модерират автоматично за спам и нецензурни думи. В определени случаи администратор може да прегледа коментар ръчно, преди той да стане видим за всички.",
      icon: ShieldAlert,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      hover: "group-hover:bg-orange-400/20"
    },
    {
      question: "Мога ли да предложа нова функционалност за сайта?",
      answer: "Да! Отворени сме за идеи. Можете да споделите вашето предложение през страницата за контакт или да участвате в нашите периодични анкети за развитие на сайта.",
      icon: Zap,
      color: "text-yellow-600",
      bg: "bg-yellow-600/10",
      hover: "group-hover:bg-yellow-600/20"
    },
    {
      question: "Как се избира „Меме на седмицата“?",
      answer: "Всеки регистриран потребител може да качи свое меме. Победителят се определя чрез гласуване от общността. Мемето с най-много гласове в края на седмицата се визуализира на началната страница и на телевизорите в училище.",
      icon: Music,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      hover: "group-hover:bg-purple-500/20"
    },
    {
      question: "Какво представлява страницата „ТВ Екран“?",
      answer: "Тази страница е оптимизирана за визуализация на информационните монитори в коридорите на училището. Тя показва актуални новини, предстоящи събития, меме на седмицата и друга важна информация в реално време.",
      icon: Smartphone,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      hover: "group-hover:bg-blue-500/20"
    },
    {
      question: "Безопасни ли са данните ми в платформата?",
      answer: "Да, ние спазваме строги правила за поверителност. Използваме съвременни методи за защита на потребителските профили и не споделяме лична информация с трети страни.",
      icon: ShieldAlert,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      hover: "group-hover:bg-rose-500/20"
    },
    {
      question: "Какво се случва при нарушение на правилата?",
      answer: "При системни нарушения на правилата на общността (обидни коментари, спам и др.), потребителят може да получи предупреждение или временна забрана за достъп до определени функции на сайта.",
      icon: ShieldAlert,
      color: "text-orange-600",
      bg: "bg-orange-600/10",
      hover: "group-hover:bg-orange-600/20"
    },
    {
      question: "Сайтът официален източник на информация ли е?",
      answer: "Блогът е ученическа инициатива, подкрепена от училището. Въпреки че се стремим към точност, за официални административни въпроси винаги проверявайте и основния сайт на гимназията.",
      icon: Info,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
      hover: "group-hover:bg-sky-500/20"
    },
    {
      question: "Как мога да променя данните в профила си?",
      answer: "Отидете на страницата „Моят профил“ и изберете „Настройки“. Там можете да промените вашето потребителско име, парола или аватар.",
      icon: UserPlus,
      color: "text-lime-600",
      bg: "bg-lime-600/10",
      hover: "group-hover:bg-lime-600/20"
    },
    {
      question: "Мога ли да редактирам или изтривам моите коментари?",
      answer: "Да, след като влезете в профила си, можете да управлявате своите коментари през профилната ви страница.",
      icon: MessageSquare,
      color: "text-teal-500",
      bg: "bg-teal-500/10",
      hover: "group-hover:bg-teal-500/20"
    },
    {
      question: "Има ли правила за избор на песни за звънеца?",
      answer: "Песните не трябва да съдържат нецензурни думи, политически послания или неподходящо съдържание. Администраторите преглеждат предложенията преди да бъдат пуснати в училищната уредба.",
      icon: Music,
      color: "text-fuchsia-500",
      bg: "bg-fuchsia-500/10",
      hover: "group-hover:bg-fuchsia-500/20"
    },
    {
      question: "Мога ли да видя историята на промените по сайта?",
      answer: "Да, в страницата „Changelog“ можете да проследите всички нови функции, подобрения и поправки на бъгове, които сме направили от началото на проекта.",
      icon: Code,
      color: "text-slate-500",
      bg: "bg-slate-500/10",
      hover: "group-hover:bg-slate-500/20"
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden">
      <ParticlesComponent id="faq-particles" key={theme} theme={theme} />
      
      {/* Background Blobs for Depth */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <Header />
      
      <main className="relative z-10 py-16 px-4 md:px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 mb-2 backdrop-blur-sm border border-amber-500/20 shadow-lg animate-bounce-slow">
              <HelpCircle className="h-8 w-8 text-amber-500" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl drop-shadow-sm">
              Често задавани въпроси
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Всичко, което трябва да знаете за платформата ПГКНМА Блог в един модерен и достъпен формат.
            </p>
          </div>

          <div className="bg-card/40 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-2 md:p-8">
              <Accordion type="single" collapsible className="w-full space-y-2">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`} 
                    className="border-none bg-white/5 dark:bg-black/5 rounded-2xl transition-all duration-300 hover:bg-white/10 dark:hover:bg-black/10 px-4"
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
              </Accordion>
            </div>
          </div>

          <div className="mt-16 p-10 bg-primary/10 backdrop-blur-lg rounded-3xl border border-primary/20 text-center space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold">Все още имате въпроси?</h2>
              <p className="text-muted-foreground text-lg">
                Ако не намирате отговора, който търсите, нашият екип е тук, за да помогне.
              </p>
              <div className="pt-6">
                <a 
                  href="/contact" 
                  className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-primary/30 hover:shadow-primary/40"
                >
                  Свържете се с нас
                </a>
              </div>
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
