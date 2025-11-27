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

type NewsItem = { id: number; title: string; summary: string };
type EventItem = { id: number; title: string; date: string; place: string };
type PollConfig = { title: string; subtitle: string; code: string; options: string[] };
type ContactInfo = { email:string; phone: string; address: string };
type Suggestion = { name: string; link: string; status: "pending" | "approved" | "rejected" };
type PollResults = Record<"a" | "b" | "c" | "d", number>;

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
    setNotificationsEnabled 
  } = useNotification();

  const [news, setNews] = useState<NewsItem[]>([
    { id: 1, title: "Ново оборудване за лабораторията", summary: "Закупихме 20 нови лаптопа за часовете по програмиране." },
    { id: 2, title: "Седмичен хакатон", summary: "Учениците представиха 12 проекта за училищния хакатон." },
  ]);
  const [events, setEvents] = useState<EventItem[]>([
    { id: 1, title: "Родителска среща", date: "2025-02-05", place: "Аула" },
    { id: 2, title: "Състезание по ИТ", date: "2025-03-12", place: "София Тех Парк" },
  ]);
  const [poll, setPoll] = useState<PollConfig>({
    title: "Какво принтира?",
    subtitle: "Обход на масив",
    code: "const nums = [1,2,3];\nconsole.log(nums.map(n=>n*2));",
    options: ["1,2,3", "2,4,6", "3,6,9", "Нищо не принтира"],
  });
  const [pollResults, setPollResults] = useState<PollResults>({ a: 4, b: 9, c: 2, d: 1 });
  const [contact, setContact] = useState<ContactInfo>({
    email: "info@school.bg",
    phone: "+359 888 123 456",
    address: "ул. Школо 1, София",
  });
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    { name: "Мария, 10Б", link: "https://youtu.be/dQw4w9WgXcQ", status: "pending" },
    { name: "Иван, 9А", link: "https://youtu.be/abcd", status: "pending" },
  ]);
  const [openEmbeds, setOpenEmbeds] = useState<Record<number, boolean>>({});

  const updateSuggestionStatus = (idx: number, status: "approved" | "rejected") => {
    setSuggestions((prev) => prev.map((s, i) => (i === idx ? { ...s, status } : s)));
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
    const next: NewsItem = { id: Date.now(), title: "", summary: "" };
    setNews((prev) => [next, ...prev]);
  };

  const addEvent = () => {
    const next: EventItem = { id: Date.now(), title: "", date: "", place: "" };
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

  const pollOptions = useMemo(
    () =>
      poll.options.map((opt, idx) => ({
        value: opt,
        idx,
      })),
    [poll.options],
  );

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
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Заглавие</label>
                  <Input value={item.title} onChange={(e) => updateNews(item.id, "title", e.target.value)} placeholder="Заглавие" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Резюме</label>
                  <Textarea value={item.summary} onChange={(e) => updateNews(item.id, "summary", e.target.value)} rows={2} />
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
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Заглавие</label>
                    <Input value={item.title} onChange={(e) => updateEvent(item.id, "title", e.target.value)} placeholder="Заглавие" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Дата</label>
                    <Input type="date" value={item.date} onChange={(e) => updateEvent(item.id, "date", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Място</label>
                    <Input value={item.place} onChange={(e) => updateEvent(item.id, "place", e.target.value)} placeholder="Аула" />
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
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border px-4 py-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2 w-full sm:max-w-2xl">
                  <p className="font-semibold">{s.name}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm text-muted-foreground break-all">{s.link}</p>
                    {getYoutubeEmbed(s.link) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setOpenEmbeds((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                      >
                        {openEmbeds[idx] ? "Скрий видео" : "Покажи видео"}
                      </Button>
                    )}
                  </div>
                  {getYoutubeEmbed(s.link) && openEmbeds[idx] && (
                    <div className="w-full max-w-sm overflow-hidden rounded-lg border border-border/70 bg-muted/30">
                      <div className="relative w-full overflow-hidden" style={{ paddingBottom: "56.25%", maxHeight: "170px" }}>
                        <iframe
                          title={`suggestion-${idx}`}
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
                    <Button size="sm" variant="outline" onClick={() => updateSuggestionStatus(idx, "approved")}>
                      Одобри
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => updateSuggestionStatus(idx, "rejected")}>
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
          <CardHeader>
            <CardTitle>Weekly Poll</CardTitle>
            <CardDescription>Конфигурирай заглавие, подзаглавие, код и отговори (a-d).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Заглавие</label>
                <Input value={poll.title} onChange={(e) => setPoll({ ...poll, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Подзаглавие</label>
                <Input value={poll.subtitle} onChange={(e) => setPoll({ ...poll, subtitle: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Code snippet</label>
              <Textarea rows={4} value={poll.code} onChange={(e) => setPoll({ ...poll, code: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {pollOptions.map((opt) => (
                <div key={opt.idx} className="space-y-1.5">
                  <label className="text-sm font-semibold">Опция {String.fromCharCode(97 + opt.idx)}</label>
                  <Input
                    value={opt.value}
                    onChange={(e) => {
                      const next = [...poll.options];
                      next[opt.idx] = e.target.value;
                      setPoll({ ...poll, options: next });
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">Резултати (демо)</p>
                  <p className="text-xs text-muted-foreground">Сумирани гласове по отговор. Заменете с реални данни при бекенд.</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="rounded-full bg-secondary px-3 py-1">Общо: {Object.values(pollResults).reduce((sum, n) => sum + n, 0)}</span>
                </div>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-4">
                {(["a", "b", "c", "d"] as const).map((key, idx) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-md border border-border bg-background/70 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="uppercase">{key}</Badge>
                      <span className="font-semibold">{poll.options[idx] || `Отговор ${key.toUpperCase()}`}</span>
                    </div>
                    <span className="text-muted-foreground">{pollResults[key]}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">* Тези настройки са локални за демо. Свържете ги към реално съхранение при нужда.</p>
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
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Admin;
