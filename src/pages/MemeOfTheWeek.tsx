import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getMemes, submitMeme, voteForMeme, Meme } from '@/lib/api';
import { Skeleton } from "@/components/ui/skeleton";
import CookieConsent from "@/components/CookieConsent";
import { useAuth } from '@/contexts/AuthContext';
import LoginDialog from '@/components/LoginDialog';
import RegisterDialog from '@/components/RegisterDialog';


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
        setMemes(fetchedMemes);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load memes.');
        console.error(err);
        toast({
          title: "Грешка при зареждане",
          description: err.message || "Не успяхме да заредим меметата. Моля, опреснете страницата.",
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
    } catch (err: any) {
      toast({
        title: "Грешка при качване",
        description: err.message || "Неуспешно изпращане. Моля, опитайте отново.",
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
    } catch (err: any) {
      toast({
        title: "Грешка при гласуване",
        description: err.message || "Вече сте гласували за това меме или възникна друга грешка.",
        variant: "destructive",
      });
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen w-full">
      <Header />
      <main>
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-4 text-center">Меме на седмицата</h1>
          <p className="text-muted-foreground text-center mb-8">
            Изпратете анонимно "вътрешни" мемета, свързани с училищния живот. Най-доброто ще бъде "Меме на седмицата"!
          </p>

          {isAuthenticated ? (
            <Card className="mb-8 max-w-lg mx-auto">
              <CardHeader>
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
            <Card className="mb-8 max-w-lg mx-auto text-center p-6">
                <CardTitle className="mb-4">Влезте, за да качите меме</CardTitle>
                <CardDescription className="mb-6">
                    За да участвате в състезанието "Меме на седмицата" и да качвате свои мемета, моля, влезте в системата.
                </CardDescription>
                <Button onClick={openLoginDialog} className="w-full">Вход</Button>
            </Card>
          )}

          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Галерия</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="w-full h-[250px] rounded-t-lg" />
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {memes.map((meme) => (
                      <Card key={meme.id}>
                        <CardContent className="p-0">
                          <img src={meme.image_url} alt={meme.title} className="w-full h-auto rounded-t-lg object-cover" />
                        </CardContent>
                        <div className="p-4">
                          <CardTitle className="text-lg">{meme.title}</CardTitle>
                          <CardDescription>Качено от: {meme.user_username} на {new Date(meme.created_at).toLocaleDateString('bg-BG')}</CardDescription>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg">{meme.votes}</span>
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
        </div>
      </main>
      <Footer />
      <BackToTop />
      <LoginDialog 
        open={loginDialogOpen} 
        onOpenChange={(isOpen) => !isOpen && closeLoginDialog()} 
        onOpenRegister={() => {
          closeLoginDialog();
          setRegisterOpen(true);
        }}
      />
      <RegisterDialog open={registerOpen} onOpenChange={setRegisterOpen} />
      <CookieConsent/>
    </div>
  );
};

export default MemeOfTheWeek;
