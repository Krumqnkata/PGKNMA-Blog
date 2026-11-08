import {  } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InteriorPage, InteriorSection } from '@/components/InteriorPage';
import { SiteArt } from "@/components/art/SiteArt";

const FeatureDisabledPage = () => {
  return (
    <InteriorPage>
      <InteriorSection className="flex min-h-[70vh] items-center">
        <div className="mx-auto max-w-xl rounded-3xl border border-border/70 bg-card p-8 text-center shadow-xl sm:p-12">
            <SiteArt name="lock" className="art-wiggle mx-auto mb-6 block h-20 w-20" />
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Функционалността е изключена</h1>
            <p className="mx-auto mb-8 mt-4 max-w-md leading-relaxed text-muted-foreground">
                Тази функционалност е временно изключена от администратора. Моля, проверете отново по-късно.
            </p>
            <Button asChild><Link to="/">Към началната страница</Link></Button>
        </div>
      </InteriorSection>
    </InteriorPage>
  );
};

export default FeatureDisabledPage;
