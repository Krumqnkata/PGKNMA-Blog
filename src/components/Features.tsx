import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Calendar, BookOpen, Trophy, Bell } from "lucide-react";

const Features = () => {
  const parentLinks = [
    { icon: Calendar, label: "Parent-Teacher Meetings" },
    { icon: BookOpen, label: "Academic Progress" },
    { icon: Bell, label: "Important Announcements" },
  ];

  const studentLinks = [
    { icon: GraduationCap, label: "Course Schedule" },
    { icon: Trophy, label: "Clubs & Activities" },
    { icon: BookOpen, label: "Homework & Assignments" },
  ];

  return (
    <section className="border-b border-border py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold sm:text-4xl">Quick Access</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need, right at your fingertips
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* For Parents Card */}
          <Card className="group border-border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardHeader>
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">For Parents</CardTitle>
              <CardDescription>
                Stay informed about your child's educational journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {parentLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground"
                    >
                      <link.icon className="h-5 w-5 text-primary" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* For Students Card */}
          <Card className="group border-border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardHeader>
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">For Students</CardTitle>
              <CardDescription>
                Access your resources and stay organized
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {studentLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground"
                    >
                      <link.icon className="h-5 w-5 text-primary" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Features;
