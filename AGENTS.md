
# Wytyczne Projektowe (AGENTS.md)
🛠 Tech Stack & Core Libraries
Framework: Next.js

Język: TypeScript (Strict Mode)

Backend/Data: JSON file (odczyt/zapis przez Next.js API routes)

CSS: Tailwind CSS (minimalistyczny, utility-first)

Daty: date-fns (wyłącznie do logiki i formatowania)

Ikony: Lucide React (lekkie, spójne)

📋 Reguły Kodowania (Hard Rules)
ZAKAZ używania any: Wszystkie typy danych (Equipment, Booking, User) muszą być zdefiniowane w @/types/schema.ts.

Architektura "Thin API + Thin Components": - Logika biznesowa działa w API routes i warstwie serwisowej, komponenty React pełnią rolę widoku.

Komponenty React pełnią rolę "widoku" – odbierają dane i wywołują endpointy API.

Zasada KISS: Unikamy over-engineeringu. Brak zewnętrznych bibliotek do formularzy (używamy natywnego onSubmit i stanu lokalnego) oraz brak ciężkich UI Kits (MUI/AntD).

Język Projektu:

Kod: Zmienne, funkcje, komentarze techniczne, pliki – English.

Interfejs (UI): Teksty, etykiety, komunikaty błędów, daty – Polish.

Komentarze: Piszemy tylko "Why" (dlaczego coś jest zrobione w dany sposób). Unikamy oczywistych opisów "What" (co robi funkcja).

📅 Logika Rezerwacji (Demo MVP)
Model Single-Item: Rezerwacja odbywa się bezpośrednio z karty produktu lub modalu. Brak funkcjonalności koszyka w tej wersji.

Format Dat: Wszystkie daty w JSON file przechowujemy jako ISO Strings. Konwersja na obiekty JavaScript następuje tylko wewnątrz funkcji obliczeniowych date-fns.

Walidacja Konfliktów: - Przed zapisem rezerwacji, API musi sprawdzić, czy wybrany zakres start - end nie pokrywa się z istniejącymi rezerwacjami dla danego equipmentId.

Funkcja walidująca (isSlotAvailable) powinna być dostępna przez endpoint lub serwis współdzielony, aby UI mógł zablokować przycisk "Rezerwuj" w czasie rzeczywistym.

Persistence: Dane rezerwacji i sprzętu muszą być zapisywane w JSON file, aby dane nie znikały po odświeżeniu strony.

🎨 Stylistyka i UI
Tailwind Only: Nie tworzymy plików .css ani .module.scss. Używamy standardowej palety barw Tailwind.

Dostępność (A11y): Przyciski nieaktywne (disabled) muszą wizualnie komunikować brak możliwości kliknięcia (np. opacity-50 cursor-not-allowed).

Feedback: Każda udana rezerwacja musi zakończyć się powiadomieniem (Toast lub prosty Alert) oraz widocznym wpisem w sekcji "Moje Rezerwacje".
 