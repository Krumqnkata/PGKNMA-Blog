import { ContactForm } from "@/components/ContactForm";
import { Mail, MapPin, Phone } from "lucide-react";

import { InteriorPage, InteriorPageHero, InteriorSection } from "@/components/InteriorPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const Contact = () => {
  return (
    <InteriorPage>
      <InteriorPageHero eyebrow="Свържете се с нас" title={<>Нека <span className="text-primary">поговорим</span></>} description="Въпрос, идея или технически проблем — изпратете ни съобщение или използвайте директните контакти." art="envelope" />
      <InteriorSection>
          <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary/10 to-transparent"><CardTitle>Информация за контакт</CardTitle></CardHeader>
              <CardContent className="space-y-5 pt-5 sm:pt-6">
                <ContactDetail icon={MapPin} label="Адрес">гр. Стара Загора, ул. „Стефан Сливков“ №7</ContactDetail>
                <ContactDetail icon={Phone} label="Телефон"><a className="underline-offset-4 hover:underline" href="tel:+359884994500">+359 88 499 4500</a></ContactDetail>
                <ContactDetail icon={Mail} label="Имейл"><a className="break-all underline-offset-4 hover:underline" href="mailto:info-2400020@edu.mon.bg">info-2400020@edu.mon.bg</a><br /><a className="break-all underline-offset-4 hover:underline" href="mailto:support@pgknma.space">support@pgknma.space</a></ContactDetail>
                <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-2xl border border-border/70 shadow-inner sm:aspect-video lg:aspect-[4/3]">
                <iframe
                  width="100%"
                  height="100%"
                  title="Местоположение на ПГКНМА"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=25.64068,42.42345,25.65072,42.42935&amp;layer=mapnik&amp;marker=42.42642,25.64575"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full dark:invert-[90%]"
                />
              </div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border/60 bg-gradient-to-r from-blue-500/10 to-transparent"><CardTitle>Изпратете съобщение</CardTitle></CardHeader>
              <CardContent className="pt-5 sm:pt-6"><ContactForm /></CardContent>
            </Card>
          </div>
      </InteriorSection>
    </InteriorPage>
  );
};

const ContactDetail = ({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></div>
    <div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p><div className="mt-1 text-sm font-semibold leading-relaxed">{children}</div></div>
  </div>
);

export default Contact;
