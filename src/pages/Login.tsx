import React, { useState } from 'react';
import Header from '@/components/Header';


const Login: React.FC = () => {
  // Състояние за данните
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Симулация на заявка (тук свържи твоя Backend)
    setTimeout(() => {
      console.log('Login details:', formData);
      setIsLoading(false);
      // Ако има грешка: setError("Невалидно име или парола");
      alert(`Успешен опит за вход: ${formData.username}`);
    }, 1000);
  };
     
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#F5E5E1] to-[#427A76] font-sans">
      <Header />

      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
        {/* Основна Карта */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 transform transition-all hover:-translate-y-1 duration-300">
          
          {/* Заглавие */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Добре дошли</h2>
            <p className="text-gray-500 text-sm">
              Влезте в системата на <span className="font-semibold text-[#1e3c72]">ПГКНМА Блог</span>
            </p>
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Поле за Потребителско име */}
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Потребителско име
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Въведете потребителско име"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1e3c72] focus:border-transparent transition duration-200 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Поле за Парола */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Парола
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1e3c72] focus:border-transparent transition duration-200 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Съобщение за грешка */}
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {/* Бутон за Вход */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold text-lg shadow-md transition-all duration-300 
                ${isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#1e3c72] hover:bg-[#162b55] hover:shadow-lg active:scale-95'
                }`}
            >
              {isLoading ? 'Зареждане...' : 'Вход'}
            </button>

          {/* Допълнителни връзки */}
          <div className="flex items-center justify-center text-sm mt-6">
            <a 
              href="/login" 
              className="text-[#1e3c72] font-semibold hover:text-[#2a5298] hover:underline transition"
            >
              Към страницата за вход
            </a>
          </div>
          </form>
        </div>
      </main>

      <div className="pb-6 text-center text-white/70 text-xs">
        © {new Date().getFullYear()} ПГКНМА Блог. Всички права запазени.
      </div>
    </div>
  );
};

export default Login;
