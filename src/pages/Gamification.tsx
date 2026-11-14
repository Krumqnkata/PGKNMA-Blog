import { LogIn, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

import { InteriorPage, InteriorPageHero, InteriorSection, SectionHeading } from '@/components/InteriorPage';
import GamificationStatistics from '@/components/GamificationStatistics';
import GamificationCatalog from '@/components/GamificationCatalog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useGoToLogin } from '@/hooks/use-go-to-login';
import { GAMIFICATION_QUESTIONS } from '@/content/gamification';

// Texts live in src/content/gamification.ts (also used by the AI assistant).
const questions = GAMIFICATION_QUESTIONS;

export default function Gamification() {
  const { user, isLoading } = useAuth();
  const goToLogin = useGoToLogin();

  return (
    <InteriorPage>
      <InteriorPageHero
        eyebrow="Всяко участие има значение"
        art="trophy"
        title={<>Мисии, награди и <span className="text-primary">твоят следващ успех.</span></>}
        description="Чети, споделяй идеи и участвай в училищния живот. Събирай точки, откривай значки и направи профила си още по-твой."
        actions={(
          <>
            {user ? (
              <Button asChild size="lg" className="gap-2"><a href="#leaderboard"><Trophy className="size-4" aria-hidden="true" />Виж моето място</a></Button>
            ) : (
              <Button size="lg" className="gap-2" disabled={isLoading} onClick={goToLogin}><LogIn className="size-4" aria-hidden="true" />Влез и се включи</Button>
            )}
            <Button asChild size="lg" variant="outline"><a href="#how-it-works">Как работи?</a></Button>
            <Button asChild size="lg" variant="outline"><Link to="/games">Играй и печели точки</Link></Button>
          </>
        )}
      >
        <p className="mt-5 text-sm text-muted-foreground">Твоето темпо. Твоите постижения. Класацията е по желание.</p>
      </InteriorPageHero>

      <InteriorSection>
        <div id="leaderboard" className="scroll-mt-24">
          <SectionHeading eyebrow="Общността в числа" title="Класация и статистика" description="Виж кой води тази седмица, този месец и общо — и къде се нареждаш ти." />
          <GamificationStatistics />
        </div>
      </InteriorSection>

      <GamificationCatalog />

      <InteriorSection className="border-t border-border/60" containerClassName="max-w-3xl">
        <SectionHeading title="Преди да започнеш" description="Няколко полезни отговора за точките и наградите." />
        <Accordion type="single" collapsible>
          {questions.map(({ question, answer }, index) => (
            <AccordionItem key={question} value={`question-${index}`}>
              <AccordionTrigger className="text-left">{question}</AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">{answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </InteriorSection>
    </InteriorPage>
  );
}
