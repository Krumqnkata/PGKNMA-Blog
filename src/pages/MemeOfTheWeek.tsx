import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getMemes, submitMeme, voteForMeme, Meme } from '@/lib/api';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/hooks/use-auth';
import LoginDialog from '@/components/LoginDialog';
import RegisterDialog from '@/components/RegisterDialog';
import { Heart, Images, Laugh, UploadCloud } from 'lucide-react';
import { InteriorPage, InteriorPageHero, InteriorSection, SectionHeading } from '@/components/InteriorPage';
import { Link } from 'react-router-dom';
import { publicProfilePath } from '@/lib/public-profile';


const MemeOfTheWeek: React.FC = () => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, openLoginDialog, loginDialogOpen, closeLoginDialog } = useAuth();
  const [registerOpen, setRegisterOpen] = useState(false);


  useEffect(() => {
    const fetchMemes = async () => {
      try {
        setIsLoading(true);
        const fetchedMemes = await getMemes();
        setMemes(Array.isArray(fetchedMemes) ? fetchedMemes : []);
        setError(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Неуспешно зареждане на меметата.';
        setError(errorMessage);
        console.error(err);
        toast({
          title: "Грешка при зареждане",
          description: errorMessage || "Не успяхме да заредим меметата. Моля, опреснете страницата.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemes();
  }, [toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      toast({ title: "Грешка", description: "Моля, изберете файл.", variant: "destructive" });
      return;
    }
    if (!isAuthenticated) { 
      toast({ title: "Не сте влезли", description: "Моля, влезте, за да качвате мемета.", variant: "destructive" });
      openLoginDialog();
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMeme({ title, image: selectedFile });
      toast({ title: "Успех!", description: "Вашето меме е изпратено за модерация!" });
      setTitle("");
      setSelectedFile(null);
      const fileInput = document.getElementById('meme-file') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Неуспешно изпращане. Моля, опитайте отново.";
      toast({
        title: "Грешка при качване",
        description: errorMessage,
        variant: "destructive",
      });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (memeId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Необходим е вход",
        description: "Моля, влезте в профила си, за да гласувате.",
        variant: "destructive",
      });
      openLoginDialog();
      return;
    }

    try {
      const updatedMeme = await voteForMeme(memeId);
      setMemes(currentMemes =>
        currentMemes.map(meme =>
          meme.id === memeId ? updatedMeme : meme
        )
      );
      toast({
        title: "Успешен глас!",
        description: "Вашият глас беше отчетен.",
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Вече сте гласували за това меме или възникна друга грешка.";
      toast({
        title: "Грешка при гласуване",
        description: errorMessage,
        variant: "destructive",
      });
      console.error(err);
    }
  };

  return (
    <InteriorPage>
      <InteriorPageHero eyebrow="Забавната страна на училището" title={<>Меме на <span className="text-primary">седмицата</span></>} description="Споделете забавен момент от училищния живот и подкрепете любимите предложения." icon={Laugh} />
      <InteriorSection>

          {isAuthenticated ? (
            <Card className="mx-auto mb-12 max-w-2xl overflow-hidden shadow-xl shadow-primary/5">
              <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary/10 to-transparent">
                <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><UploadCloud className="h-5 w-5" aria-hidden="true" /></div>
                <CardTitle>Качи твоето меме</CardTitle>
                <CardDescription>Попълни формата, за да изпратиш меме за одобрение.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Заглавие на мемето</Label>
                    <Input id="title" type="text" placeholder="Например: Когато учителят по математика..." value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meme-file">Файл с меме</Label>
                    <Input id="meme-file" type="file" accept="image/*" onChange={handleFileChange} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Изпращане...' : 'Изпрати за одобрение'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="mx-auto mb-12 max-w-2xl p-7 text-center shadow-lg">
                <CardTitle className="mb-4">Влезте, за да качите меме</CardTitle>
                <CardDescription className="mb-6">
                    За да участвате в състезанието "Меме на седмицата" и да качвате свои мемета, моля, влезте в системата.
                </CardDescription>
                <Button onClick={openLoginDialog} className="w-full">Вход</Button>
            </Card>
          )}

          <div>
            <SectionHeading eyebrow="Общността избира" title="Галерия" description="Разгледайте одобрените предложения и гласувайте за своя фаворит." />
            {isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-square w-full rounded-t-2xl" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex items-center justify-between mt-4">
                        <Skeleton className="h-8 w-1/4" />
                        <Skeleton className="h-10 w-1/3" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
                <p className="text-center text-destructive mt-8">{error}</p>
            ) : (
              <>
                {memes.length === 0 ? (
                  <p className="text-center text-muted-foreground mt-8">Все още няма одобрени мемета. Бъди първият!</p>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {memes.map((meme) => (
                      <Card key={meme.id} className="group overflow-hidden transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl motion-reduce:hover:translate-y-0">
                        <CardContent className="p-0">
                          <div className="aspect-square overflow-hidden bg-muted"><img src={meme.image_url} alt={meme.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100" /></div>
                        </CardContent>
                        <div className="p-5">
                          <CardTitle className="text-lg">{meme.title}</CardTitle>
                          <CardDescription>Качено от: {meme.user_username ? <Link className="font-medium hover:text-primary hover:underline" to={publicProfilePath(meme.user_username)}>{meme.user_username}</Link> : 'изтрит потребител'} на {new Date(meme.created_at).toLocaleDateString('bg-BG')}</CardDescription>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Heart className="h-4 w-4 text-rose-500" aria-hidden="true" />
                                <span className="text-lg font-black text-foreground">{meme.votes}</span>
                                <span>гласа</span>
                            </div>
                            <Button
                                onClick={() => handleVote(meme.id)}
                                disabled={!isAuthenticated || meme.has_voted}
                                variant={meme.has_voted ? "secondary" : "default"}
                            >
                                {meme.has_voted ? "Гласувано" : "Гласувай"}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
      </InteriorSection>
      <LoginDialog 
        open={loginDialogOpen} 
        onOpenChange={(isOpen) => !isOpen && closeLoginDialog()} 
        onOpenRegister={() => {
          closeLoginDialog();
          setRegisterOpen(true);
        }}
      />
      <RegisterDialog open={registerOpen} onOpenChange={setRegisterOpen} onOpenLogin={() => { setRegisterOpen(false); openLoginDialog(); }} />
    </InteriorPage>
  );
};

export default MemeOfTheWeek;
