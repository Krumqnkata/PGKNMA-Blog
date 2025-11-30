import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Globe, Code } from "lucide-react";
import type React from "react";

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v4.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917z"></path>
    </svg>
);

const Footer = () => {
  const quickLinks = [
    { label: "За нас", href: "/contact" },
    { label: "Прием", href: "https://pgknma.com/priem" },
    { label: "Новини", href: "/news" },
  ];

  const resources = [
    { label: "Училищен уебсайт", href: "https://pgknma.com/" },
    { label: "Политика за поверителност", href: "/privacy-policy" },
    { label: "Условия за ползване", href: "/terms-of-service" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/pgknma", label: "Facebook" },
    { icon: TikTokIcon, href: "https://www.tiktok.com/@pgknma.proffbalkanski", label: "TikTok" },
    { icon: Instagram, href: "https://www.instagram.com/pgknma.prof.minko.balkanski/", label: "Instagram" },
    { icon: Youtube, href: "https://www.youtube.com/@pgknma", label: "YouTube" },
    { icon: Globe, href: "https://pgknma.com/", label: "Website" },
  ];

  return (
    <footer className="relative z-10 border-t border-border bg-[hsl(var(--footer-background))] text-[hsl(var(--footer-foreground))]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo-dark.png" alt="ПГКНМА блог лого" className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold">ПГКНМА блог</span>
            </div>
            <p className="text-sm text-[hsl(var(--footer-foreground))]/80 leading-relaxed">
              Овластяване на учениците и ангажиране на родителите чрез образование, иновации и общност.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Бързи връзки</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                  className="text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-primary"
                >
                  {link.label}
                </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ресурси</h3>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                  className="text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-primary"
                >
                  {link.label}
                </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Контактна информация</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-[hsl(var(--footer-foreground))]/80">
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <span>ул. Стефан Сливков №7, град Стара Загора</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[hsl(var(--footer-foreground))]/80">
                <Phone className="h-5 w-5 flex-shrink-0 text-primary" />
                <span>+359 88 499 4500</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[hsl(var(--footer-foreground))]/80">
                <Mail className="h-5 w-5 flex-shrink-0 text-primary" />
                <span>info-2400020@edu.mon.bg</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-4 sm:text-left">
            <p className="text-sm text-[hsl(var(--footer-foreground))]/80">
              © 2025 ПГКНМА блог. Всички права запазени.
            </p>
            <span className="hidden sm:inline text-[hsl(var(--footer-foreground))]/80">|</span>
            <a href="/developers" className="flex items-center gap-2 text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-primary">
              <Code className="h-4 w-4" />
              <span>Разработка от учениците на ПГКНМА "Проф. Минко Балкански"</span>
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
              className="rounded-lg p-2 text-[hsl(var(--footer-foreground))]/80 transition-all hover:bg-accent hover:text-primary"
            >
              <social.icon className="h-5 w-5" />
            </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
