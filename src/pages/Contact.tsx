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
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d0!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sbg!4v169--EXAMPLE--"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen= ""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
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
