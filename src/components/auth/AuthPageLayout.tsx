import type { ReactNode } from "react";

import { SiteArt, type SiteArtName } from "@/components/art/SiteArt";
import { AuthSwitch, type AuthMode } from "@/components/auth/AuthSwitch";
import { InteriorPage, InteriorSection } from "@/components/InteriorPage";

interface AuthPageLayoutProps {
  art: SiteArtName;
  title: string;
  description: string;
  mode: AuthMode;
  next: string;
  children: ReactNode;
}

export function AuthPageLayout({ art, title, description, mode, next, children }: AuthPageLayoutProps) {
  return (
    <InteriorPage>
      <InteriorSection className="py-6 sm:py-12">
        <div className="mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-border/70 bg-card shadow-xl shadow-primary/5">
          <header className="border-b border-border/60 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5 sm:p-7">
            <SiteArt name={art} className="art-wiggle mb-3 block h-14 w-14 drop-shadow-sm sm:h-16 sm:w-16" />
            <h1 className="text-2xl font-black sm:text-3xl">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            <div className="mt-5">
              <AuthSwitch active={mode} next={next} />
            </div>
          </header>
          <div className="p-5 sm:p-7">{children}</div>
        </div>
      </InteriorSection>
    </InteriorPage>
  );
}
