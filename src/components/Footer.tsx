import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Globe, Code, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type React from "react";
import PageLoadStats from "./PageLoadStats";
import DevicePushSettingsDialog from "@/components/DevicePushSettingsDialog";
import { CONTACT, FOOTER_QUICK_LINKS, FOOTER_RESOURCES, FOOTER_TAGLINE, SOCIAL_LINKS } from "@/content/contact";

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

const Footer: React.FC = () => {
  // Texts and links live in src/content/contact.ts (also used by the AI assistant).
  const quickLinks = FOOTER_QUICK_LINKS;
  const resources = FOOTER_RESOURCES;
  
  const socialIcons: Record<string, React.ElementType> = {
    Facebook,
    TikTok: TikTokIcon,
    Instagram,
    YouTube: Youtube,
    Website: Globe,
  };
  const socialLinks = SOCIAL_LINKS.map((link) => ({ ...link, icon: socialIcons[link.label] ?? Globe }));

  return (
    <footer className="relative z-10 border-t border-border bg-[hsl(var(--footer-background))] text-[hsl(var(--footer-foreground))]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/logo-dark.png" alt="ПГКНМА Блог лого" className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold">ПГКНМА Блог</span>
            </div>
            <p className="text-sm text-[hsl(var(--footer-foreground))]/80 leading-relaxed">
              {FOOTER_TAGLINE}
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Бързи връзки</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith('/') ? (
                    <Link to={link.href} className="text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-primary">{link.label}</Link>
                  ) : (
                    <a href={link.href} className="text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-primary">{link.label}</a>
                  )}
                </li>
              ))}
            </ul>
            <DevicePushSettingsDialog />
          </div>

          {/* Resources Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ресурси</h3>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith('/') ? (
                    <Link to={link.href} className="text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-primary">{link.label}</Link>
                  ) : (
                    <a href={link.href} className="text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-primary">{link.label}</a>
                  )}
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
                <span>{CONTACT.address}</span>
              </li>
              <li><a href={CONTACT.phoneHref} className="flex items-center gap-3 text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-primary hover:underline cursor-pointer">
                <Phone className="h-5 w-5 flex-shrink-0 text-primary" />
                <span>{CONTACT.phone}</span>
              </a></li>
              <li><a href={`mailto:${CONTACT.officialEmail}`} className="flex items-center gap-3 text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-primary hover:underline cursor-pointer">
                <Mail className="h-5 w-5 flex-shrink-0 text-primary" />
                <span className="break-all">{CONTACT.officialEmail}</span>
              </a></li>
              <li><a href={`mailto:${CONTACT.supportEmail}`} className="flex items-center gap-3 text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-primary hover:underline cursor-pointer">
                <Mail className="h-5 w-5 flex-shrink-0 text-primary" />
                <span className="break-all">{CONTACT.supportEmail}</span>
              </a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 lg:col-span-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <img src="/global_school.png" alt="Глобално училище" className="max-h-16 w-auto object-contain" />
            <img src="/innovative_school.png" alt="Иновативно училище" className="max-h-16 w-auto object-contain" />
            <img src="/ZaednoVChas.png" alt="Заедно в час" className="max-h-16 w-auto object-contain" />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-4 sm:text-left">
            <p className="text-sm text-[hsl(var(--footer-foreground))]/80">
            © {new Date().getFullYear()} ПГКНМА Блог. Всички права запазени.
            </p>
            <span className="hidden sm:inline text-[hsl(var(--footer-foreground))]/80">|</span>
            <Link to="/developers" className="flex items-center gap-2 text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-primary">
              <Code className="h-4 w-4" />
              <span>Разработка от учениците на ПГКНМА "Проф. Минко Балкански"</span>
            </Link>
            {/* Even more discrete Easter Egg Button */}
            <span className="hidden sm:inline text-[hsl(var(--footer-foreground))]/80">|</span> {/* Separator */}                                            
          {/* Easter Egg Button */}                                                                                                                        
              <Link to="/easter-egg" className="flex items-center gap-1 text-sm text-[hsl(var(--footer-foreground))]/80 transition-colors hover:text-primary" aria-label="Easter Egg"> 
              <Sparkles className="h-4 w-4" />
              <span>Тайна функция</span>
            </Link>
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
        
        <div className="mt-6 border-t pt-4 ">
          <PageLoadStats />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
