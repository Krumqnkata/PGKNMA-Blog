import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { InteriorPage, InteriorPageHero, InteriorSection } from '@/components/InteriorPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BALKANSKI_CAREER, BALKANSKI_CAREER_TITLE, BALKANSKI_CHARITY, BALKANSKI_CHARITY_TITLE, BALKANSKI_INTRO, BALKANSKI_TITLE } from '@/content/minko-balkanski';

const EasterEgg: React.FC = () => {
  const [revealed, setRevealed] = useState(false);
  const [answerInput, setAnswerInput] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const question = "През коя година е роден професор Минко Балкански?";
  const correctAnswer = "1927"; // Updated answer

  const handleSubmit = () => {
    if (answerInput.trim() === correctAnswer) { // Use trim() for input and exact match for year
      setRevealed(true);
      setFeedbackMessage('Поздравления! Отговорът е верен!');
    } else {
      setFeedbackMessage('Грешен отговор. Опитай отново!');
      setRevealed(false);
    }
  };

  if (!revealed) {
    return (
      <InteriorPage>
        <InteriorSection className="flex min-h-[70vh] items-center">
        <Card className="mx-auto w-full max-w-md overflow-hidden shadow-2xl shadow-primary/5">
          <div className="border-b border-border/60 bg-gradient-to-br from-primary/15 to-transparent p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary"><Sparkles className="h-7 w-7" aria-hidden="true" /></div>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-primary">Тайна страница</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Easter Egg</h1>
          </div>
          <CardContent className="p-6 sm:p-8">
          <p className="mb-4 text-center leading-relaxed text-muted-foreground">
            За да продължиш, отговори на следния въпрос:
          </p>
          <p className="mb-5 text-center text-xl font-bold leading-snug">
            {question}
          </p>
          <Input
            type="text"
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            placeholder="Въведи отговор тук..."
            className="mb-4"
            aria-label="Отговор на въпроса"
          />
          <Button onClick={handleSubmit} className="w-full">Изпрати отговор</Button>
          {feedbackMessage && (
            <p role="status" className={`mt-4 rounded-xl p-3 text-center text-sm font-semibold ${feedbackMessage.includes('верен') ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
              {feedbackMessage}
            </p>
          )}
          <Link to="/" className="mt-5 block text-center text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:text-primary">
            Върни се на началната страница
          </Link>
          </CardContent>
        </Card>
        </InteriorSection>
      </InteriorPage>
    );
  }

  return (
    <InteriorPage>
      <InteriorPageHero eyebrow="Тайната е отключена" title={<>Историята на <span className="text-primary">проф. Минко Балкански</span></>} description="Бележит учен, филантроп и вдъхновение за поколения български ученици." art="star" />
      <InteriorSection containerClassName="max-w-5xl">
        <div className="flex w-full flex-col items-center gap-8">
            <div className="w-full">
              <div className="relative mx-auto aspect-video w-full max-w-3xl overflow-hidden rounded-3xl border border-border/70 bg-black shadow-2xl">
                <video
                  src="/minko-b-ai-video-easter-egg.mp4"
                  controls
                  preload="metadata"
                  className="h-full w-full"
                  aria-label="Видео за професор Минко Балкански"
                />
              </div>
            </div>
            <Card className="w-full overflow-hidden">
              <CardContent className="p-6 text-base leading-relaxed sm:p-8 lg:p-10">
              <h2 className="mb-5 text-2xl font-black tracking-tight sm:text-3xl">{BALKANSKI_TITLE}</h2>
              
              <div className="mb-4">
                <p className="mb-2">
                  {BALKANSKI_INTRO}
                </p>
                <div className="my-6 text-center">
                  <img
                    src="/Prof_Minko_Balkanski.jpg"
                    alt="Портрет на Професор Минко Балкански"
                    className="mx-auto w-full max-w-xs rounded-2xl border border-border/60 shadow-lg"
                    loading="lazy"
                    decoding="async"
                  />
                  <p className="text-sm text-gray-500 mt-2">Професор Минко Балкански</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">{BALKANSKI_CAREER_TITLE}</h3>
                <p className="mb-2">
                  {BALKANSKI_CAREER}
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">{BALKANSKI_CHARITY_TITLE}</h3>
                <p className="mb-2">
                  {BALKANSKI_CHARITY}
                </p>
              </div>
              </CardContent>
            </Card>
          </div>
      </InteriorSection>
    </InteriorPage>
  );
};

export default EasterEgg;
