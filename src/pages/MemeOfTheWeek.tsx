import React, { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock data for memes. In a real application, this would come from a backend.
const initialMemes = [
  { id: 1, title: "Когато преживееш още една седмица в училище", imageUrl: "https://via.placeholder.com/400x300.png?text= оцеляване+в+училище" },
  { id: 2, title: "Това чувство, когато звънецът бие в петък", imageUrl: "https://via.placeholder.com/400x300.png?text=петъчно+чувство" },
  { id: 3, title: "Опитвайки се да разбера учителя по математика", imageUrl: "https://via.placeholder.com/400x300.png?text=математическо+объркване" },
];

const MemeOfTheWeek: React.FC = () => {
  const [memes, setMemes] = useState(initialMemes);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedFile) {
      const newMeme = {
        id: memes.length + 1,
        title: title || "Ново меме",
        imageUrl: URL.createObjectURL(selectedFile),
      };
      // In a real app, you'd upload the file and send the data to a server.
      // The server would handle moderation. For now, we'll just add it to the local state.
      setMemes([newMeme, ...memes]);
      setTitle("");
      setSelectedFile(null);
      // Reset the file input
      const fileInput = document.getElementById('meme-file') as HTMLInputElement;
      if(fileInput) fileInput.value = "";

      alert("Вашето меме е изпратено за модерация! Ще се появи след одобрение.");
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

          <Card className="mb-8 max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Качи твоето меме</CardTitle>
              <CardDescription>Попълни формата, за да изпратиш меме за одобрение.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Заглавие на мемето (по желание)</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Например: Когато учителят по математика..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meme-file">Файл с меме</Label>
                  <Input id="meme-file" type="file" accept="image/*" onChange={handleFileChange} required />
                </div>
                <Button type="submit" className="w-full">Изпрати за одобрение</Button>
              </form>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Галерия</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {memes.map((meme) => (
                <Card key={meme.id}>
                  <CardContent className="p-0">
                    <img src={meme.imageUrl} alt={meme.title} className="w-full h-auto rounded-t-lg object-cover" />
                  </CardContent>
                  <div className="p-4">
                    <CardTitle className="text-lg">{meme.title}</CardTitle>
                  </div>
                </Card>
              ))}
            </div>
            {memes.length === 0 && (
                <p className="text-center text-muted-foreground mt-8">Все още няма одобрени мемета. Бъди първият!</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default MemeOfTheWeek;
