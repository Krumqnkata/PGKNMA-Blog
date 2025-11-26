import Header from "@/components/Header";
import UnderHeader from "@/components/UnderHeader";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

const Contact = () => {
  return (
    <div className="min-h-screen w-full">
      <Header />
      <UnderHeader />
      <main className="py-12 px-4 md:px-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Контакти</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Информация за контакт</h2>
              <p className="mb-2"><strong>Адрес:</strong> град Стара Загора, ул. "Стефан Сливков" №7</p>
              <p className="mb-2"><strong>Телефон:</strong> +359 88 499 4500</p>
              <p className="mb-2"><strong>Имейл:</strong> info-2400020@edu.mon.bg</p>
              <div className="mt-4">
                <iframe
                  src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=%D0%A1%D1%82%D0%B5%D1%84%D0%B0%D0%BD%20%D1%81%D0%BB%D0%B8%D0%B2%D0%BA%D0%BE%D0%B2%207+(%D0%9F%D0%93%D0%9A%D0%9D%D0%9C%D0%90)&amp;t=&amp;z=15&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="gmap-iframe"
                ></iframe>
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
