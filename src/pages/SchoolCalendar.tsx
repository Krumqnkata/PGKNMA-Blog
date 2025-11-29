import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users } from "lucide-react";

const upcomingEvents = [
  {
    id: 1,
    title: "Parent-Teacher Conferences",
    date: "2024-03-20",
    time: "3:00 PM - 8:00 PM",
    location: "All Classrooms",
    category: "Academic",
    description: "Meet with your child's teachers to discuss their progress and academic goals for the semester.",
    attendees: "Parents & Teachers",
  },
  {
    id: 2,
    title: "Spring Sports Tryouts",
    date: "2024-03-22",
    time: "3:30 PM - 5:30 PM",
    location: "Athletic Fields & Gymnasium",
    category: "Sports",
    description: "Tryouts for baseball, softball, track & field, and tennis teams. All interested students welcome!",
    attendees: "Students",
  },
  {
    id: 3,
    title: "Book Fair Week",
    date: "2024-03-25",
    time: "All Day",
    location: "School Library",
    category: "Academic",
    description: "Annual book fair featuring hundreds of titles for all ages. Special author visit on Wednesday!",
    attendees: "All Students & Families",
  },
  {
    id: 4,
    title: "School Musical Performance",
    date: "2024-03-28",
    time: "7:00 PM",
    location: "Main Auditorium",
    category: "Arts",
    description: "Opening night of our spring musical 'The Sound of Music'. Tickets available at the door.",
    attendees: "Community",
  },
  {
    id: 5,
    title: "STEM Fair",
    date: "2024-04-05",
    time: "9:00 AM - 3:00 PM",
    location: "Gymnasium & Cafeteria",
    category: "Academic",
    description: "Students showcase their science, technology, engineering, and math projects. Open to the public.",
    attendees: "All Students & Community",
  },
  {
    id: 6,
    title: "Spring Break",
    date: "2024-04-08",
    time: "All Week",
    location: "No School",
    category: "Holiday",
    description: "School closed for spring break. Classes resume April 15th. Enjoy your time off!",
    attendees: "All Students & Staff",
  },
  {
    id: 7,
    title: "College Prep Workshop",
    date: "2024-04-12",
    time: "6:00 PM - 8:00 PM",
    location: "Auditorium",
    category: "Academic",
    description: "For juniors and seniors: Learn about the college application process, financial aid, and scholarships.",
    attendees: "Students & Parents",
  },
  {
    id: 8,
    title: "Earth Day Celebration",
    date: "2024-04-22",
    time: "10:00 AM - 2:00 PM",
    location: "School Grounds",
    category: "Community",
    description: "Tree planting, recycling drive, and environmental education activities for all grade levels.",
    attendees: "All Students",
  },
];

const categories = ["All", "Academic", "Sports", "Arts", "Community", "Holiday"];

const SchoolCalendar = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredEvents = upcomingEvents.filter(
    (event) => selectedCategory === "All" || event.category === selectedCategory
  );

  const getCategoryColor = (category: string) => {
    const colors = {
      Academic: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      Sports: "bg-green-500/10 text-green-500 border-green-500/20",
      Arts: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      Community: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      Holiday: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[category as keyof typeof colors] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen w-full">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="w-full bg-gradient-to-br from-primary/20 via-background to-background py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">Училищен Календар</h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Останете информирани за предстоящи събития, дейности и важни дати
            </p>
          </div>
        </section>

        {/* Filter Section */}
        <section className="w-full border-b border-border bg-background/95 py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Events List */}
        <section className="w-full py-16">
          <div className="container mx-auto px-4">
            {filteredEvents.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">No events found in this category.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="group overflow-hidden transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex flex-col gap-6 p-6 md:flex-row">
                      {/* Date Box */}
                      <div className="flex-shrink-0">
                        <div className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-primary bg-primary/5">
                          <span className="text-3xl font-bold text-primary">
                            {new Date(event.date).getDate()}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">
                            {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                          </span>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="text-2xl font-bold transition-colors group-hover:text-primary">
                              {event.title}
                            </h3>
                            <Badge className={`mt-2 border ${getCategoryColor(event.category)}`}>
                              {event.category}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-muted-foreground">{event.description}</p>

                        <div className="grid gap-3 text-sm md:grid-cols-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4 text-primary" />
                            <span>{event.attendees}</span>
                          </div>
                        </div>

                        <Button variant="outline" size="sm" className="mt-2">
                          <Calendar className="mr-2 h-4 w-4" />
                          Add to Calendar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default SchoolCalendar;
