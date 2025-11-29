import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ==== Placeholder Data ====
// Please provide the actual student data.
const developers = [
  {
    name: "Крум",
    role: "Front-end Разработчик",
    avatar: "https://avatars.githubusercontent.com/u/213969107?v=4", // Using Krumqnkata's avatar
    github: "https://github.com/Krumqnkata",
  },
  {
    name: "Александър",
    role: "Front-end и Back-end Разработчик",
    avatar: "https://avatars.githubusercontent.com/u/246351746?v=4", // Using AlexanderYthef0's avatar
    github: "https://github.com/ythef0",
  },
  {
    name: "Никола",
    role: "Front-end и Back-end Разработчик",
    avatar: "https://avatars.githubusercontent.com/u/184959849?v=4", // Using N1ki2K's avatar
    github: "https://github.com/N1ki2K",
  },
];
// ==========================

const Developers = () => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-12">
          Екипът зад проекта
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {developers.map((dev, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="flex justify-center">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={dev.avatar} alt={dev.name} />
                    <AvatarFallback>
                      {dev.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle>{dev.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{dev.role}</p>
                <a
                  href={dev.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline mt-2 inline-block"
                >
                  GitHub Профил
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Developers;
