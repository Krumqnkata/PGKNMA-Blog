import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useNotification } from "@/contexts/NotificationContext";
import { toast } from "@/components/ui/use-toast";

type NewsItem = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  image: string;
};
type EventItem = {
  id: number;
  title: string;
  day: string;
  month: string;
  time: string;
  location: string;
};
type Question = {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  options: { key: "a" | "b" | "c" | "d"; text: string; correct?: boolean }[];
};
type Suggestion = {
  id: number;
  name: string;
  link: string;
  slot: string;
  note: string;
  status: "pending" | "approved" | "rejected";
};
type FooterLink = { id: number; label: string; href: string; };
type SocialLink = { id: number; icon: string; href: string; label: string; };

type ContactInfo = { email: string; phone: string; address: string };

const getYoutubeEmbed = (link: string): string | null => {
  try {
    const url = new URL(link);
    const host = url.hostname.replace(/^www\./, "");
    let id: string | null = null;

    if (host === "youtu.be") {
      id = url.pathname.replace("/", "");
    } else if (host.includes("youtube.com")) {
      id = url.searchParams.get("v");
      if (!id && url.pathname.startsWith("/shorts/")) {
        id = url.pathname.split("/")[2] || null;
      }
      if (!id && url.pathname.startsWith("/embed/")) {
        id = url.pathname.split("/")[2] || null;
      }
    }

    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
};

const ADMIN_USER = "admin";
const ADMIN_PASS = "password";
const TOKEN_KEY = "pgknma-admin-auth";

const Admin = () => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const {
    notifications,
    notificationsEnabled,
    addNotification,
    updateNotificationText,
    toggleNotification,
    deleteNotification,
    setNotificationsEnabled,
  } = useNotification();

  const [news, setNews] = useState<NewsItem[]>([
    { id: 1, title: "Ново оборудване за лабораторията", excerpt: "Закупихме 20 нови лаптопа за часовете по програмиране.", category: "Facilities", date: "2025-03-20", author: "Директорът", image: "/placeholder.svg" },
    { id: 2, title: "Седмичен хакатон", excerpt: "Учениците представиха 12 проекта за училищния хакатон.", category: "Academics", date: "2025-03-18", author: "Г-н Бонев", image: "/placeholder.svg" },
  ]);
  const [events, setEvents] = useState<EventItem[]>([
    { id: 1, title: "Родителска среща", day: "05", month: "FEB", time: "18:00", location: "Аула" },
    { id: 2, title: "Състезание по ИТ", day: "12", month: "MAR", time: "09:00", location: "София Тех Парк" },
  ]);
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "unique-values",
      title: "Какво принтира?",
      subtitle: "Работа с map и filter",
      code: `const nums = [1, 2, 3];\nconst result = nums\n  .map((n) => n * 2)\n  .filter((n) => n > 3);\nconsole.log(result.join("-"));`,
      options: [
        { key: "a", text: "2-4-6" },
        { key: "b", text: "4-6", correct: true },
        { key: "c", text: "6" },
        { key: "d", text: "4-6-8" },
      ],
    },
  ]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    { id: 1, name: "Мария, 10Б", link: "https://youtu.be/dQw4w9WgXcQ", slot: "morning", note: "Много е свежа!", status: "pending" },
    { id: 2, name: "Иван, 9А", link: "https://youtu.be/abcd", slot: "afterLunch", note: "", status: "pending" },
  ]);
  const [contact, setContact] = useState<ContactInfo>({
    email: "info@school.bg",
    phone: "+359 888 123 456",
    address: "ул. Школо 1, София",
  });
  
  const [quickLinks, setQuickLinks] = useState<FooterLink[]>([
      { id: 1, label: "За нас", href: "/contact" },
      { id: 2, label: "Прием", href: "https://pgknma.com/priem" },
      { id: 3, label: "Новини", href: "/news" },
  ]);
  const [resources, setResources] = useState<FooterLink[]>([
      { id: 1, label: "Училищен уебсайт", href: "https://pgknma.com/" },
      { id: 2, label: "Политика за поверителност", href: "/privacy-policy" },
      { id: 3, label: "Условия за ползване", href: "/terms-of-service" },
      { id: 4, label: "Разработили сайта", href: "/developers" },
  ]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
      { id: 1, icon: "Facebook", href: "https://facebook.com/pgknma", label: "Facebook" },
      { id: 2, icon: "TikTok", href: "https://www.tiktok.com/@pgknma.proffbalkanski", label: "TikTok" },
      { id: 3, icon: "Instagram", href: "https://www.instagram.com/pgknma.prof.minko.balkanski/", label: "Instagram" },
  ]);

  const [openEmbeds, setOpenEmbeds] = useState<Record<number, boolean>>({});

  const updateSuggestionStatus = (id: number, status: "approved" | "rejected") => {
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved === "true") setIsAuthed(true);
  }, []);

  const handleLogin = () => {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setIsAuthed(true);
      localStorage.setItem(TOKEN_KEY, "true");
      setLoginError("");
      toast({ title: "Успешен вход" });
    } else {
      setLoginError("Невалидни данни. Опитайте с admin / password.");
    }
  };

  const handleLogout = () => {
    setIsAuthed(false);
    localStorage.removeItem(TOKEN_KEY);
  };

  const addNews = () => {
    const next: NewsItem = { id: Date.now(), title: "", excerpt: "", category: "", date: "", author: "", image: "" };
    setNews((prev) => [next, ...prev]);
  };

  const addEvent = () => {
    const next: EventItem = { id: Date.now(), title: "", day: "", month: "", time: "", location: "" };
    setEvents((prev) => [next, ...prev]);
  };

  const updateNews = (id: number, key: keyof NewsItem, value: string) => {
    setNews((prev) => prev.map((n) => (n.id === id ? { ...n, [key]: value } : n)));
  };

  const updateEvent = (id: number, key: keyof EventItem, value: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, [key]: value } : e)));
  };

  const deleteNews = (id: number) => setNews((prev) => prev.filter((n) => n.id !== id));
  const deleteEvent = (id: number) => setEvents((prev) => prev.filter((e) => e.id !== id));

  const addQuestion = () => {
    const next: Question = {
      id: `q_${Date.now()}`,
      title: "Нов въпрос",
      subtitle: "",
      code: "",
      options: [
        { key: "a", text: "" },
        { key: "b", text: "" },
        { key: "c", text: "" },
        { key: "d", text: "" },
      ],
    };
    setQuestions((prev) => [next, ...prev]);
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, key: keyof Question, value: any) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [key]: value } : q)));
  };

  const updateOptionText = (questionId: string, optionKey: "a" | "b" | "c" | "d", text: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt) =>
                opt.key === optionKey ? { ...opt, text } : opt
              ),
            }
          : q
      )
    );
  };

  const setCorrectOption = (questionId: string, optionKey: "a" | "b" | "c" | "d", isCorrect: boolean) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt) => ({
                ...opt,
                correct: opt.key === optionKey ? isCorrect : false,
              })),
            }
          : q
      )
    );
  };

  const addQuickLink = () => {
    const next: FooterLink = { id: Date.now(), label: "", href: "" };
    setQuickLinks((prev) => [...prev, next]);
  };

  const updateQuickLink = (id: number, key: keyof FooterLink, value: string) => {
    setQuickLinks((prev) => prev.map((link) => (link.id === id ? { ...link, [key]: value } : link)));
  };

  const deleteQuickLink = (id: number) => {
    setQuickLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const addResource = () => {
    const next: FooterLink = { id: Date.now(), label: "", href: "" };
    setResources((prev) => [...prev, next]);
  };

  const updateResource = (id: number, key: keyof FooterLink, value: string) => {
    setResources((prev) => prev.map((link) => (link.id === id ? { ...link, [key]: value } : link)));
  };

  const deleteResource = (id: number) => {
    setResources((prev) => prev.filter((link) => link.id !== id));
  };

  const addSocialLink = () => {
    const next: SocialLink = { id: Date.now(), icon: "", label: "", href: "" };
    setSocialLinks((prev) => [...prev, next]);
  };

  const updateSocialLink = (id: number, key: keyof SocialLink, value: string) => {
    setSocialLinks((prev) => prev.map((link) => (link.id === id ? { ...link, [key]: value } : link)));
  };

  const deleteSocialLink = (id: number) => {
    setSocialLinks((prev) => prev.filter((link) => link.id !== id));
  };



  if (!isAuthed) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#F5E5E1] to-[#427A76] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border bg-card/95 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Въведете admin / password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Потребител</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Парола</label>
              <Input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="password" />
            </div>
            {loginError && <p className="text-sm text-destructive">{loginError}</p>}
            <Button className="w-full" onClick={handleLogin}>
              Вход
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Header />

      <main className="container mx-auto px-4 py-10 space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Админ панел</p>
            <h1 className="text-3xl font-bold">CMS Dashboard</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Изход
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Известия в хедъра</CardTitle>
            <CardDescription>Управлявай глобалните известия в банера.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <label className="text-base font-medium">
                  Покажи банера с известия
                </label>
                <p className="text-sm text-muted-foreground">
                  Превключи, за да покажеш или скриеш всички известия.
                </p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            {notifications.map((notification) => (
              <div key={notification.id} className="rounded-lg border p-4 space-y-3">
                <Textarea
                  value={notification.text}
                  onChange={(e) => updateNotificationText(notification.id, e.target.value)}
                  placeholder="Въведи съобщение..."
                  rows={2}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={notification.enabled}
                      onCheckedChange={() => toggleNotification(notification.id)}
                      aria-label="Toggle notification"
                    />
                    <label className="text-sm font-medium">
                      {notification.enabled ? "Активно" : "Неактивно"}
                    </label>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => deleteNotification(notification.id)}>
                    Изтрий
                  </Button>
                </div>
              </div>
            ))}
            <Button onClick={addNotification}>+ Добави известие</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Новини</CardTitle>
              <CardDescription>Създавай, редактирай или изтривай новини.</CardDescription>
            </div>
            <Button size="sm" onClick={addNews}>+ Нова новина</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {news.map((item) => (
              <div key={item.id} className="rounded-lg border border-border p-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Заглавие</label>
                    <Input value={item.title} onChange={(e) => updateNews(item.id, "title", e.target.value)} placeholder="Заглавие" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Автор</label>
                    <Input value={item.author} onChange={(e) => updateNews(item.id, "author", e.target.value)} placeholder="Автор" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Категория</label>
                    <Input value={item.category} onChange={(e) => updateNews(item.id, "category", e.target.value)} placeholder="Категория" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Дата</label>
                    <Input type="date" value={item.date} onChange={(e) => updateNews(item.id, "date", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Линк към снимка</label>
                  <Input value={item.image} onChange={(e) => updateNews(item.id, "image", e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Кратко резюме (excerpt)</label>
                  <Textarea value={item.excerpt} onChange={(e) => updateNews(item.id, "excerpt", e.target.value)} rows={3} />
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">ID {item.id}</Badge>
                  <Button variant="destructive" size="sm" onClick={() => deleteNews(item.id)}>
                    Изтрий
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Събития</CardTitle>
              <CardDescription>Управлявай събития и дати.</CardDescription>
            </div>
            <Button size="sm" onClick={addEvent}>+ Ново събитие</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.map((item) => (
              <div key={item.id} className="rounded-lg border border-border p-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-semibold">Заглавие</label>
                    <Input value={item.title} onChange={(e) => updateEvent(item.id, "title", e.target.value)} placeholder="Заглавие" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Ден</label>
                    <Input value={item.day} onChange={(e) => updateEvent(item.id, "day", e.target.value)} placeholder="25" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Месец</label>
                    <Input value={item.month} onChange={(e) => updateEvent(item.id, "month", e.target.value)} placeholder="NOV" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Час</label>
                    <Input value={item.time} onChange={(e) => updateEvent(item.id, "time", e.target.value)} placeholder="18:00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Място</label>
                    <Input value={item.location} onChange={(e) => updateEvent(item.id, "location", e.target.value)} placeholder="Аула" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">ID {item.id}</Badge>
                  <Button variant="destructive" size="sm" onClick={() => deleteEvent(item.id)}>
                    Изтрий
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bell Suggestions</CardTitle>
            <CardDescription>Преглед на последни предложения.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-border px-4 py-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3 w-full sm:max-w-2xl">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <p className="font-semibold">{s.name}</p>
                      <Badge variant="outline">Slot: {s.slot}</Badge>
                    </div>
                    {s.note && <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">Бележка: {s.note}</p>}
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm text-muted-foreground break-all">{s.link}</p>
                      {getYoutubeEmbed(s.link) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setOpenEmbeds((prev) => ({ ...prev, [s.id]: !prev[s.id] }))}
                        >
                          {openEmbeds[s.id] ? "Скрий видео" : "Покажи видео"}
                        </Button>
                      )}
                    </div>
                    {getYoutubeEmbed(s.link) && openEmbeds[s.id] && (
                      <div className="w-full max-w-sm overflow-hidden rounded-lg border border-border/70 bg-muted/30">
                        <div className="relative w-full overflow-hidden" style={{ paddingBottom: "56.25%", maxHeight: "170px" }}>
                          <iframe
                            title={`suggestion-${s.id}`}
                            src={`${getYoutubeEmbed(s.link)}?rel=0`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute left-0 top-0 h-full w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-2">
                    <Badge variant={s.status === "approved" ? "default" : s.status === "rejected" ? "destructive" : "secondary"}>
                      {s.status === "approved" ? "Одобрено" : s.status === "rejected" ? "Отхвърлено" : "В изчакване"}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => updateSuggestionStatus(s.id, "approved")}>
                      Одобри
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => updateSuggestionStatus(s.id, "rejected")}>
                      Откажи
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">* Тези данни са примерни. Свържете реално API, ако има бекенд.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Седмична анкета (въпросник)</CardTitle>
              <CardDescription>Управлявай въпросите, които се показват в анкетата.</CardDescription>
            </div>
            <Button size="sm" onClick={addQuestion}>+ Нов въпрос</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="rounded-lg border border-border p-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Заглавие</label>
                    <Input value={q.title} onChange={(e) => updateQuestion(q.id, "title", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Подзаглавие</label>
                    <Input value={q.subtitle} onChange={(e) => updateQuestion(q.id, "subtitle", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Code snippet</label>
                  <Textarea rows={4} value={q.code} onChange={(e) => updateQuestion(q.id, "code", e.target.value)} />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold">Отговори</label>
                  {q.options.map((opt, optIndex) => (
                    <div key={opt.key} className="flex items-center gap-3">
                      <Badge variant="secondary" className="uppercase">{opt.key}</Badge>
                      <Input
                        className="flex-grow"
                        value={opt.text}
                        onChange={(e) => updateOptionText(q.id, opt.key, e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={opt.correct}
                          onCheckedChange={(checked) => setCorrectOption(q.id, opt.key, checked)}
                        />
                        <label className="text-xs text-muted-foreground">Верен</label>
                      </div>
                    </div>
                  ))}
                </div>
                 <div className="flex items-center gap-3">
                  <Badge variant="outline">ID {q.id}</Badge>
                  <Button variant="destructive" size="sm" onClick={() => deleteQuestion(q.id)}>
                    Изтрий
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Контакти</CardTitle>
            <CardDescription>Обнови публичната контактна информация.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Email</label>
                <Input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Телефон</label>
                <Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Адрес</label>
                <Input value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Настройките са локални. Свържете API за постоянство.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Бързи връзки (Footer)</CardTitle>
              <CardDescription>Управлявай бързите връзки в долната част на сайта.</CardDescription>
            </div>
            <Button size="sm" onClick={addQuickLink}>+ Нова връзка</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickLinks.map((link) => (
              <div key={link.id} className="rounded-lg border border-border p-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Текст</label>
                    <Input value={link.label} onChange={(e) => updateQuickLink(link.id, "label", e.target.value)} placeholder="Текст на връзката" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">URL</label>
                    <Input value={link.href} onChange={(e) => updateQuickLink(link.id, "href", e.target.value)} placeholder="/example-page" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">ID {link.id}</Badge>
                  <Button variant="destructive" size="sm" onClick={() => deleteQuickLink(link.id)}>
                    Изтрий
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Ресурси (Footer)</CardTitle>
              <CardDescription>Управлявай връзките към ресурси в долната част на сайта.</CardDescription>
            </div>
            <Button size="sm" onClick={addResource}>+ Нов ресурс</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {resources.map((link) => (
              <div key={link.id} className="rounded-lg border border-border p-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Текст</label>
                    <Input value={link.label} onChange={(e) => updateResource(link.id, "label", e.target.value)} placeholder="Текст на връзката" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">URL</label>
                    <Input value={link.href} onChange={(e) => updateResource(link.id, "href", e.target.value)} placeholder="https://example.com" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">ID {link.id}</Badge>
                  <Button variant="destructive" size="sm" onClick={() => deleteResource(link.id)}>
                    Изтрий
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Социални мрежи (Footer)</CardTitle>
              <CardDescription>Управлявай връзките към социални мрежи в долната част на сайта.</CardDescription>
            </div>
            <Button size="sm" onClick={addSocialLink}>+ Нова връзка</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {socialLinks.map((link) => (
              <div key={link.id} className="rounded-lg border border-border p-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Име на икона</label>
                    <Input value={link.icon} onChange={(e) => updateSocialLink(link.id, "icon", e.target.value)} placeholder="Facebook, TikTok, etc." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Aria Label</label>
                    <Input value={link.label} onChange={(e) => updateSocialLink(link.id, "label", e.target.value)} placeholder="Етикет (за достъпност)" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">URL</label>
                    <Input value={link.href} onChange={(e) => updateSocialLink(link.id, "href", e.target.value)} placeholder="https://facebook.com/example" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">ID {link.id}</Badge>
                  <Button variant="destructive" size="sm" onClick={() => deleteSocialLink(link.id)}>
                    Изтрий
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Admin;
