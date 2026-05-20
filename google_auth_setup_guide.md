# Ръководство за интеграция на Google Login & Регистрация
## Проект: ПГКНМА Дигитална Платформа

Това ръководство описва стъпка по стъпка как да реализирате вход и регистрация с Google акаунт във вашето приложение, като се започне от конзолата на Google, премине се през Django бекенда и се завърши с React фронтенда.

---

## Етап 1: Конфигурация в Google Cloud Console
За да работи входът с Google, трябва да регистрирате проекта си при тях, за да получите уникален `Client ID`.

1. Отидете на [Google Cloud Console](https://console.cloud.google.com/).
2. Създайте нов проект (напр. `PGKNMA Platform`).
3. В лявото меню отидете на **APIs & Services** > **OAuth consent screen** (Екран за съгласие):
   * Изберете **External** (Външен), за да може всеки ученик/учител с Google профил да влиза.
   * Попълнете името на сайта, имейл за поддръжка и контактна информация.
   * Преминете през стъпките *Scopes* и *Test Users* с натискане на **Save and Continue** (без допълнителни промени).
4. Отидете на **Credentials** (Удостоверения) в лявото меню:
   * Кликнете на **+ CREATE CREDENTIALS** отгоре и изберете **OA    uth client ID**.
   * За **Application type** изберете **Web application**.
   * Под **Authorized JavaScript origins** добавете локалния адрес на React:
     * `http://localhost:5173`
     * *(Ако сайтът има производствен адрес, например `https://blog.pgknma.com`, го добавете тук също).*
   * Под **Authorized redirect URIs** добавете същия адрес:
     * `http://localhost:5173`
5. Натиснете **Create**. Google ще генерира вашия **Client ID** (който изглежда подобно на `xxxx.apps.googleusercontent.com`) и **Client Secret**. Запазете ги.

---

## Етап 2: Имплементация в Django Бекенда (Python)
След като имате `Client ID`, трябва да подготвите Django сървъра да приема и проверява Google токените.

### 1. Инсталация на пакет за верификация:
Във вашата виртуална среда на Django инсталирайте официалната библиотека на Google:
```bash
pip install google-auth requests
```

### 2. Конфигуриране на `settings.py` на Django:
Добавете вашия Google Client ID в настройките на проекта:
```python
# settings.py
GOOGLE_CLIENT_ID = "ТВОЯТ_GOOGLE_CLIENT_ID_ОТ_ЕТАП_1.apps.googleusercontent.com"
```

### 3. Създаване на View за обработка на входа (`views.py`):
Този View приема изпратения от React Google Token, валидира го, намира или създава потребителя и генерира JWT токени.

```python
# views.py
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings

User = get_user_model()

class GoogleAuthView(APIView):
    permission_classes = []  # Този път трябва да е публично достъпен

    def post(self, request):
        token = request.data.get('credential')
        if not token:
            return Response(
                {'error': 'Липсва Google credential token.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Валидиране на токена през библиотеката на Google
            id_info = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                settings.GOOGLE_CLIENT_ID
            )

            # Проверка на издателя на токена
            if id_info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                return Response(
                    {'error': 'Невалиден издател на токена.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            email = id_info.get('email')
            first_name = id_info.get('given_name', '')
            last_name = id_info.get('family_name', '')

            if not email:
                return Response(
                    {'error': 'Имейл адресът не е предоставен от Google.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Генериране на потребителско име на базата на имейла (преди @)
            username_suggestion = email.split('@')[0]
            
            # Предпазване от дублиране на потребителски имена в базата данни
            username = username_suggestion
            counter = 1
            while User.objects.filter(username=username).exclude(email=email).exists():
                username = f"{username_suggestion}{counter}"
                counter += 1

            # Търсене или създаване на потребител с този имейл
            user, created = User.objects.get_or_create(
                email=email, 
                defaults={
                    'username': username,
                    'first_name': first_name,
                    'last_name': last_name,
                    'is_active': True
                }
            )

            if created:
                user.set_unusable_password()
                user.save()

            # Генериране на Simple JWT токени (Access & Refresh) за сесията
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            }, status=status.HTTP_200_OK)

        except ValueError:
            # Токенът е изтекъл, подправен или грешен
            return Response(
                {'error': 'Невалиден Google токен.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Сървърна грешка: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
```

### 4. Регистрация на URL маршрута (`urls.py`):
```python
# urls.py
from django.urls import path
from .views import GoogleAuthView

urlpatterns = [
    # ... вашите други маршрути
    path('api/auth/google/', GoogleAuthView.as_view(), name='google-auth'),
]
```

---

## Етап 3: Реализация в React Фронтенда
Тези промени ще бъдат реализирани в настоящия проект:

1. **Инсталация на `@react-oauth/google`**:
   ```bash
   npm install @react-oauth/google
   ```
2. **Настройка на `.env`**:
   Добавяне на променлива `VITE_GOOGLE_CLIENT_ID=ТВОЯТ_GOOGLE_CLIENT_ID`.
3. **Обвиване на приложението** в `main.tsx` с `<GoogleOAuthProvider>`.
4. **Обновяване на `api.tsx` и `AuthContext.tsx`** за поддръжка на новия endpoint `/api/auth/google/`.
5. **Добавяне на бутона "Влез с Google"** в `LoginDialog.tsx` и `RegisterDialog.tsx`.
