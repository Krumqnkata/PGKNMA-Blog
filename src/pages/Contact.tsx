import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { ContactForm } from "@/components/ContactForm";

const Contact = () => {
  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="py-12 px-4 md:px-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Контакти</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Информация за контакт</h2>
              <p className="mb-2"><strong>Адрес:</strong> град Стара Загора, ул. "Стефан Сливков" №7</p>
              <p className="mb-2"><strong>Телефон:</strong> +359 88 499 4500</p>
              <p className="mb-2"><strong>Имейл:</strong> info-2400020@edu.mon.bg</p>
              <div className="mt-4 relative rounded-md overflow-hidden">
                <iframe
                  width="100%"
                  height="450"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=25.64068,42.42345,25.65072,42.42935&amp;layer=mapnik&amp;marker=42.42642,25.64575"
                  style={{ border: "1px solid black" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="dark:invert-[90%]"
                ></iframe>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">Формуляр за контакт</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Contact;
