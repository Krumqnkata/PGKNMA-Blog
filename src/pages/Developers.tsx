import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import ParticlesComponent from "@/components/Particles";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const developers = [
  {
    name: "Александър",
    role: "Front-end и Back-end Разработчик",
    avatar: "https://avatars.githubusercontent.com/u/246351746?v=4", // Using AlexanderYthef0's avatar
    github: "https://github.com/ythef0",
  },
  {
    name: "Крум",
    role: "Front-end Разработчик",
    avatar: "https://avatars.githubusercontent.com/u/213969107?v=4", // Using Krumqnkata's avatar
    github: "https://github.com/Krumqnkata",
  },
  {
    name: "Никола",
    role: "Front-end и Back-end Разработчик",
    avatar: "https://avatars.githubusercontent.com/u/184959849?v=4", // Using N1ki2K's avatar
    github: "https://github.com/N1ki2K",
  },
  {
    name: "Г-н Людмил Бонев",
    role: "Ментор и Съветник",
    avatar: "https://static.vecteezy.com/system/resources/previews/053/547/120/non_2x/generic-user-profile-avatar-for-online-platforms-and-social-media-vector.jpg", 
    github: "/developers",
  },
];
// ==========================

const Developers = () => {
  const { theme } = useTheme();
  return (
    <div className="min-h-screen w-full flex flex-col relative">
      <ParticlesComponent id="tsparticles" theme={theme} />
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
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
