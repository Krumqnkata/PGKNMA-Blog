import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

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
                  src="https://maps.google.com/maps?q=%D0%9F%D1%80%D0%BE%D1%84%D0%B5%D1%81%D0%B8%D0%BE%D0%BD%D0%B0%D0%BB%D0%BD%D0%B0%20%D0%B3%D0%B8%D0%BC%D0%BD%D0%B0%D0%B7%D0%B8%D1%8F%20%D0%BF%D0%BE%20%D0%BA%D0%BE%D0%BC%D0%BF%D1%8E%D1%82%D1%8A%D1%80%D0%BD%D0%B8%20%D0%BD%D0%B0%D1%83%D0%BA%D0%B8%20%D0%B8%20%D0%BC%D0%B0%D1%82%D0%B5%D0%BC%D0%B0%D1%82%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%20%D0%B0%D0%BD%D0%B0%D0%BB%D0%B8%D0%B7%D0%B8%20%22%D0%9F%D1%80%D0%BE%D1%84.%20%D0%9C%D0%B8%D0%BD%D0%BA%D0%BE%20%D0%91%D0%B0%D0%BB%D0%BA%D0%B0%D0%BD%D1%81%D0%BA%D0%B8%22%2C%20%D0%BA%D0%B2.%20%D0%9E%D0%BF%D1%8A%D0%BB%D1%87%D0%B5%D0%BD%D1%81%D0%BA%D0%B8%2C%20%D1%83%D0%BB.%20%E2%80%9E%D0%A1%D1%82%D0%B5%D1%84%D0%B0%D0%BD%20%D0%A1%D0%BB%D0%B8%D0%B2%D0%BA%D0%BE%D0%B2%E2%80%9C%207%2C%206009%20%D0%A1%D1%82%D0%B0%D1%80%D0%B0%20%D0%97%D0%B0%D0%B3%D0%BE%D1%80%D0%B0&hl=bg&z=15&output=embed"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="dark:invert-[90%] dark:hue-rotate-180"
                ></iframe>
                <div className="absolute inset-0"></div>
              </div>
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
