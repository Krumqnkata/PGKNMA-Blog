import React, { useState } from 'react';
import MainLayout from '../components/MainLayout'; // Assuming MainLayout is in this path
import { Link } from 'react-router-dom';
const EasterEgg: React.FC = () => {
  const [revealed, setRevealed] = useState(false);
  const [answerInput, setAnswerInput] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const question = "Коя е рожденната дата на Проф. Минко Балкански?";
  const correctAnswer = "1927"; // Updated answer

  const handleSubmit = () => {
    if (answerInput.trim() === correctAnswer) { // Use trim() for input and exact match for year
      setRevealed(true);
      setFeedbackMessage('Поздравления! Отговорът е верен!');
    } else {
      setFeedbackMessage('Грешен отговор. Опитай отново!');
      setRevealed(false);
    }
  };

  if (!revealed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <div className="max-w-md mx-auto py-10 px-4 rounded-lg bg-card text-card-foreground shadow-lg">
          <h1 className="mb-8 text-4xl font-bold text-center">Easter Egg</h1>
          <p className="mb-4 text-lg text-center">
            За да продължиш, отговори на следния въпрос:
          </p>
          <p className="mb-4 text-xl font-semibold text-center">
            {question}
          </p>
          <input
            type="text"
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            placeholder="Въведи отговор тук..."
            className="mb-4 w-full rounded-lg border border-gray-300 p-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSubmit}
            className="rounded-lg bg-primary px-6 py-3 text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-50 w-full"
          >
            Изпрати отговор
          </button>
          {feedbackMessage && (
            <p className={`mt-4 text-center ${feedbackMessage.includes('верен') ? 'text-green-500' : 'text-red-500'}`}>
              {feedbackMessage}
            </p>
          )}
          <Link to="/" className="block mt-4 text-center text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
            Върни се на началната страница
          </Link>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center max-w-full mx-auto py-10 px-4">
        <h1 className="mb-8 text-4xl font-bold text-center">Добре дошли на easter egg страницата!</h1>
        <div className="mt-8 flex flex-col items-center gap-8 w-full max-w-5xl"> {/* Layout for video and text */}
            <div className="w-full">
              <div className="relative aspect-[16/9] w-full max-w-xl mx-auto"> {/* Responsive video container */}
                <iframe
                  src="/minko-b-ai-video-easter-egg.mp4"
                  title=""
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                ></iframe>
              </div>
            </div>
            <div className="flex-1 text-lg text-center md:text-left p-4 rounded-lg bg-secondary text-secondary-foreground shadow-md w-full md:w-auto">
              <h2 className="text-2xl font-bold mb-4">Професор Минко Балкански – Бележит Учен и Филантроп</h2>
              
              <div className="mb-4">
                <p className="mb-2">
                  Минко Балкански (1927 г. – 2017 г.) е виден френски физик от български произход. Роден в село Ореш, област Хасково, той е известен като професор в престижния Парижки университет „Пиер и Мария Кюри“ и е признат за един от най-изтъкнатите български физици в света. Завършва докторат едва на 27 години, а само година по-късно става професор по физика – забележително постижение.
                </p>
                <div className="my-6 text-center">
                  <img
                    src="/Prof_Minko_Balkanski.jpg"
                    alt="Портрет на Професор Минко Балкански"
                    className="w-full max-w-xs mx-auto rounded-lg shadow-md"
                  />
                  <p className="text-sm text-gray-500 mt-2">Професор Минко Балкански</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Научна кариера и приноси</h3>
                <p className="mb-2">
                  Научната кариера на професор Балкански е белязана от значими изследвания и ръководни позиции. Той провежда научни изследвания в École Normale Supérieure, работи в Масачузетския технологичен институт (MIT) и ръководи лаборатория по физика на твърдото тяло в Университета Париж VI. Неговото научно наследство включва авторството на 30 книги и над 2000 научни статии, които допринасят съществено за развитието на физиката.
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Благотворителност и признание</h3>
                <p className="mb-2">
                  Освен с научните си постижения, професор Балкански е известен и с мащабната си благотворителна дейност в България. Той основава фондация „Миню Балкански“, чиято мисия е да подкрепя културата, образованието и науката в родния му край. Фондацията осигурява компютърни кабинети на училища, организира олимпиади по математика и физика и провежда подготвителни курсове за талантливи ученици. За изключителния си принос е удостоен с множество отличия, сред които орден „Стара планина“ през 2003 г.
                </p>
              </div>
            </div>
          </div>
      </div>
    </MainLayout>
  );
};

export default EasterEgg;