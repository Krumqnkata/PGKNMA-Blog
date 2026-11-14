/** Екипът на сайта. Показва се на /developers и влиза в знанията на ИИ асистента. */
export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  github: string;
  skills: string[];
  color: string;
}

export const TEAM_INTRO = "Ученици и ментори, които изграждат по-добра дигитална среда за училищната общност.";

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Александър /@ad0312/",
    role: "Full-Stack гуру и главен архитект",
    avatar: "https://avatars.githubusercontent.com/u/246351746?v=4",
    github: "https://github.com/ythef0",
    skills: ["Python", "Django", "MySQL", "System Architecture"],
    color: "blue",
  },
  {
    name: "Крум /@Krumqnkata/",
    role: "UI/UX нинджа и фронтенд магьосник",
    avatar: "https://avatars.githubusercontent.com/u/213969107?v=4",
    github: "https://github.com/Krumqnkata",
    skills: ["React", "TypeScript", "Tailwind CSS", "Design Systems"],
    color: "emerald",
  },
  {
    name: "Инж. Людмил Бонев",
    role: "Ментор и двигател на проекта",
    avatar: "https://avatars.githubusercontent.com/u/86717130?v=4",
    github: "https://github.com/lkbonev72",
    skills: ["Mentorship", "Project Management", "Technical Advisory"],
    color: "orange",
  },
];

export const TEAM_JOIN_TITLE = "Тук можеш да бъдеш ти!";
export const TEAM_JOIN_TEXT =
  "Имаш умения в програмирането, дизайна или писането на статии? Стани част от нашия растящ екип и развивай платформата заедно с нас.";
export const TEAM_NOTE = "Проектът е разработен с образователна цел и е с отворен код.";
