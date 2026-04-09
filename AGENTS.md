
# Wytyczne Projektowe (AGENTS.md)
🛠 Tech Stack & Core Libraries
Framework: React + Vite

Język: TypeScript (Strict Mode)

Stan: Zustand (+ persist do LocalStorage)

CSS: Tailwind CSS (minimalistyczny, utility-first)

Daty: date-fns (wyłącznie do logiki i formatowania)

Ikony: Lucide React (lekkie, spójne)

📋 Reguły Kodowania (Hard Rules)
ZAKAZ używania any: Wszystkie typy danych (Equipment, Booking, User) muszą być zdefiniowane w @/types/schema.ts.

Architektura "Fat Store, Thin Components": - Cała logika biznesowa (obliczanie dostępności, dodawanie rezerwacji, filtrowanie) musi znajdować się w Zustand Store.

Komponenty React pełnią rolę "widoku" – odbierają dane i wywołują gotowe akcje ze store'a.

Zasada KISS: Unikamy over-engineeringu. Brak zewnętrznych bibliotek do formularzy (używamy natywnego onSubmit i stanu lokalnego) oraz brak ciężkich UI Kits (MUI/AntD).

Język Projektu:

Kod: Zmienne, funkcje, komentarze techniczne, pliki – English.

Interfejs (UI): Teksty, etykiety, komunikaty błędów, daty – Polish.

Komentarze: Piszemy tylko "Why" (dlaczego coś jest zrobione w dany sposób). Unikamy oczywistych opisów "What" (co robi funkcja).

📅 Logika Rezerwacji (Demo MVP)
Model Single-Item: Rezerwacja odbywa się bezpośrednio z karty produktu lub modalu. Brak funkcjonalności koszyka w tej wersji.

Format Dat: Wszystkie daty w Store przechowujemy jako ISO Strings. Konwersja na obiekty JavaScript następuje tylko wewnątrz funkcji obliczeniowych date-fns.

Walidacja Konfliktów: - Przed zapisem rezerwacji, Store musi sprawdzić, czy wybrany zakres start - end nie pokrywa się z istniejącymi rezerwacjami dla danego equipmentId.

Funkcja walidująca (isSlotAvailable) powinna być dostępna jako selektor, aby UI mógł zablokować przycisk "Rezerwuj" w czasie rzeczywistym.

Persistence: Stan rezerwacji musi być zapisywany w localStorage (Zustand persist), aby dane nie znikały po odświeżeniu strony.

🎨 Stylistyka i UI
Tailwind Only: Nie tworzymy plików .css ani .module.scss. Używamy standardowej palety barw Tailwind.

Dostępność (A11y): Przyciski nieaktywne (disabled) muszą wizualnie komunikować brak możliwości kliknięcia (np. opacity-50 cursor-not-allowed).

Feedback: Każda udana rezerwacja musi zakończyć się powiadomieniem (Toast lub prosty Alert) oraz widocznym wpisem w sekcji "Moje Rezerwacje".
 