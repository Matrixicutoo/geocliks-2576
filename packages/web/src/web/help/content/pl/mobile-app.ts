import { type Category, h, note, p, see, steps, ul, warn } from "../../types";

export const mobileApp: Category = {
  slug: "mobile-app",
  title: "Aplikacja mobilna",
  summary: "Rób zdjęcia i filmy ze znakiem wodnym na iPhonie, iPadzie lub Androidzie.",
  icon: "Smartphone",
  sections: [
    {
      title: "Ujęcia",
      articles: [
        {
          slug: "sign-in-on-mobile",
          title: "Logowanie na telefonie",
          summary: "Wejdź do aplikacji i wybierz przestrzeń roboczą, dla której robisz ujęcia.",
          keywords: ["logowanie", "zaloguj się", "przestrzeń robocza", "przełączanie"],
          body: [
            p(
              "Zaloguj się tym samym adresem e-mail i hasłem, których używasz na stronie, albo przez Google, jeśli tak zakładałeś konto.",
            ),
            h("Jeśli należysz do więcej niż jednej przestrzeni roboczej"),
            p(
              "Twoje ujęcia zawsze trafiają do przestrzeni roboczej, która jest aktualnie otwarta. Sprawdź nazwę przestrzeni u góry ekranu, zanim zaczniesz — zdjęcie zapisane w niewłaściwej przestrzeni trzeba usunąć i zrobić od nowa.",
            ),
            steps(
              "Dotknij swojego awatara w rogu ekranu.",
              "Wybierz przestrzeń roboczą, o którą Ci chodzi.",
              "Lista projektów przeładuje się dla tej przestrzeni.",
            ),
            h("Pozostawanie zalogowanym"),
            p(
              "Aplikacja utrzymuje Cię zalogowanym. Nie wylogowuje Cię przy utracie zasięgu i nie potrzebuje połączenia, żeby się uruchomić. Jeśli za każdym razem prosi o hasło, telefon czyści pamięć aplikacji w tle — sprawdź ustawienia optymalizacji baterii.",
            ),
            see("troubleshoot/cant-sign-in", "mobile-app/offline-capture-and-queue"),
          ],
        },
        {
          slug: "take-a-photo",
          title: "Zrób zdjęcie",
          summary: "Główna czynność: ujęcie, stempel, przesłanie.",
          keywords: ["ujęcie", "aparat", "zdjęcie", "fotografowanie"],
          body: [
            steps(
              "Otwórz aplikację i wybierz projekt, nad którym pracujesz.",
              "Dotknij przycisku wykonania ujęcia.",
              "Poczekaj, aż wskaźnik lokalizacji się ustabilizuje — na zewnątrz zwykle wystarczy chwila.",
              "Skadruj i zrób zdjęcie.",
              "Dodaj notatkę, jeśli zdjęcie wymaga wyjaśnienia. Notatki można potem przeszukiwać.",
            ),
            h("Co trafia na zdjęcie"),
            ul(
              "Data i godzina, sprawdzone z czasem sieciowym, a nie z zegarem telefonu.",
              "Współrzędne GPS.",
              "Adres, na jaki te współrzędne się rozwiązują.",
              "Twoje imię i nazwisko oraz projekt, jeśli szablon je zawiera.",
              "Unikalny kod zdjęcia, który każdy może zweryfikować.",
            ),
            h("Jak uzyskać dobrą pozycję"),
            ul(
              "Wyjdź na zewnątrz albo odsuń się od stali i betonu przed zrobieniem ujęcia.",
              "Daj telefonowi kilka sekund po otwarciu aplikacji — pierwsze ustalenie pozycji jest najwolniejsze.",
              "W budynkach i pod ziemią spodziewaj się przybliżonego adresu. Współrzędne i tak zostaną zapisane.",
            ),
            warn(
              "Po fakcie nie da się zmienić czasu, współrzędnych ani adresu ujęcia. Jeśli zdjęcie jest błędne, usuń je i zrób nowe.",
            ),
            see("mobile-app/watermark-templates", "troubleshoot/gps-or-address-wrong"),
          ],
        },
        {
          slug: "record-a-video",
          title: "Nagraj film",
          summary: "Zweryfikowane wideo z tym samym stemplem co zdjęcia, do długości klipu z Twojego planu.",
          keywords: ["wideo", "nagrywanie", "klip", "film", "długość"],
          body: [
            p(
              "Wideo działa dokładnie tak jak zdjęcia: ten sam znak wodny, ten sam zweryfikowany czas i pozycja, to samo zachowanie przy przesyłaniu. To osobny przycisk na ekranie Aparat.",
            ),
            h("Długość klipu według planu"),
            ul(
              "Free — klipy 30-sekundowe, dostępne przez pierwsze trzy dni po utworzeniu przestrzeni roboczej.",
              "Plus — wideo pełnej długości dla jednej osoby.",
              "Business, Crew 10, Crew 25 — klipy do 3 minut na każdym stanowisku.",
              "Plany Delivery — klipy 3-minutowe w zestawie.",
            ),
            h("Jak dobrze nagrywać"),
            ul(
              "Utrzymaj kadr na tym, co ważne, przez pełne trzy sekundy. Szybkie panoramowanie czyni wideo bezużytecznym jako dowód.",
              "Opowiadaj, co pokazujesz. Dźwięk jest częścią zapisu.",
              "Nagrywaj krótkie, celowe klipy zamiast jednego długiego obchodu — przesyłają się szybciej i dużo łatwiej je potem znaleźć.",
            ),
            note(
              "Pliki wideo są duże. Przy limitowanym transferze pozwól klipom przesłać się przez Wi-Fi na koniec dnia, zamiast przez sieć komórkową.",
            ),
            see("plans-billing/compare-plans", "mobile-app/photo-quality-and-storage"),
          ],
        },
        {
          slug: "offline-capture-and-queue",
          title: "Ujęcia bez zasięgu",
          summary: "Pracuj wszędzie — ujęcia czekają w kolejce na urządzeniu i wysyłają się, gdy wróci zasięg.",
          keywords: ["offline", "kolejka", "brak zasięgu", "synchronizacja", "przesyłanie", "piwnica"],
          body: [
            p(
              "GeoCliks jest zbudowany z myślą o miejscach bez zasięgu. Wszystko działa offline poza przesyłaniem. Nie ma żadnego specjalnego trybu do włączenia.",
            ),
            h("Co dzieje się offline"),
            ul(
              "Aparat, znak wodny i GPS działają normalnie — GPS nie potrzebuje transmisji danych.",
              "Każde ujęcie zapisuje się na urządzeniu z rzeczywistym czasem wykonania.",
              "Ekran Kolejka pokazuje, co czeka na przesłanie.",
              "Gdy tylko pojawi się połączenie, kolejka opróżnia się sama w tle.",
            ),
            h("Czas na ujęciu wykonanym offline"),
            p(
              "Zapisany czas to moment naciśnięcia przycisku, a nie moment, w którym zdjęcie w końcu się przesłało. Późniejsze przesłanie nie osłabia zapisu.",
            ),
            warn(
              "Nie usuwaj i nie instaluj ponownie aplikacji, dopóki ujęcia czekają w kolejce. Wszystko, co nie zostało jeszcze przesłane, przepadnie. Najpierw sprawdź, czy kolejka jest pusta.",
            ),
            h("Jeśli kolejka utknęła"),
            ul(
              "Otwórz aplikację i zostaw ją na minutę na pierwszym planie przy dobrym połączeniu.",
              "Upewnij się, że nadal jesteś zalogowany.",
              "Sprawdź, czy telefon nie jest w trybie oszczędzania danych lub baterii, który blokuje transfery w tle.",
            ),
            see("troubleshoot/photos-not-uploading"),
          ],
        },
        {
          slug: "assign-capture-to-project",
          title: "Umieszczaj ujęcia we właściwym projekcie",
          summary: "Wybierz projekt przed zrobieniem zdjęcia albo przenieś zdjęcia później.",
          keywords: ["projekt", "przypisanie", "przeniesienie", "segregowanie", "porządkowanie"],
          body: [
            p(
              "Każde ujęcie należy do jakiegoś projektu. Projekt steruje raportami, mapą i tym, co widzi klient, więc dobre trafienie oszczędza późniejszego sprzątania.",
            ),
            h("Zanim zrobisz ujęcie"),
            steps(
              "Otwórz listę projektów.",
              "Dotknij zlecenia, przy którym jesteś. Pozostanie wybrane, dopóki go nie zmienisz.",
              "Rób ujęcia normalnie — wszystko samo trafi we właściwe miejsce.",
            ),
            h("Przenoszenie ujęcia później"),
            p(
              "Menedżerowie, administratorzy i właściciel mogą przenosić ujęcia między projektami z poziomu Przestrzeni zespołu. Przeniesienie zdjęcia zmienia tylko przynależność do projektu; czas, pozycja, adres i kod zdjęcia pozostają nietknięte, a zapis weryfikacyjny nadal się zgadza.",
            ),
            note(
              "Jeśli Twoja ekipa ciągle zapisuje ujęcia do złego zlecenia, zwykłą przyczyną jest nieaktualny wybór projektu z poprzedniego dnia. Poproś, żeby każdego ranka sprawdzali nazwę projektu na ekranie Aparat.",
            ),
            see("teamspace/create-a-project", "teamspace/browse-and-filter-photos"),
          ],
        },
      ],
    },
    {
      title: "Znaki wodne i ustawienia",
      articles: [
        {
          slug: "watermark-templates",
          title: "Szablony znaków wodnych",
          summary: "Zdecyduj, co pojawia się na każdym zdjęciu, i umieść na nim swoje logo.",
          keywords: ["znak wodny", "szablon", "logo", "marka", "stempel", "pola"],
          body: [
            p(
              "Szablon znaku wodnego to układ stempla wypalanego w Twoich ujęciach. Ustawia się go dla całej przestrzeni roboczej, więc zdjęcia każdego członka ekipy wychodzą spójne.",
            ),
            h("Pola, które możesz pokazać lub ukryć"),
            ul(
              "Data i godzina",
              "Współrzędne GPS",
              "Adres",
              "Nazwa projektu",
              "Imię i nazwisko osoby wykonującej ujęcie",
              "Dowolny tekst lub numer zlecenia",
              "Logo Twojej firmy",
            ),
            h("Edycja szablonu"),
            steps(
              "W Przestrzeni zespołu otwórz Znaki wodne.",
              "Wybierz szablon albo utwórz nowy.",
              "Włącz pola, których chcesz używać, i wgraj swoje logo.",
              "Zapisz. Nowe ujęcia od razu z niego korzystają; istniejące zdjęcia zachowują stempel, z którym powstały.",
            ),
            warn(
              "Zmiana szablonu nigdy nie zmienia już zrobionych zdjęć. Jest to zamierzone — stempel, który dałoby się przepisać po fakcie, nie byłby dowodem.",
            ),
            h("Ile szablonów dostajesz"),
            ul(
              "Free — 2 szablony.",
              "Plus i wyższe — wszystkie szablony oraz własne logo.",
            ),
            see("teamspace/watermark-template-library", "mobile-app/switch-template"),
          ],
        },
        {
          slug: "switch-template",
          title: "Zmiana szablonu na zleceniu",
          summary: "Użyj innego stempla dla jednego klienta lub jednego rodzaju zlecenia.",
          keywords: ["przełączanie", "zmiana szablonu", "domyślny", "dla projektu"],
          body: [
            p(
              "Większość zespołów używa jednego szablonu do wszystkiego. Gdy potrzebujesz innego — klient chce swojego numeru zlecenia na każdym zdjęciu albo inspekcja wymaga dodatkowych pól — zmień go na ekranie Aparat.",
            ),
            steps(
              "Na ekranie Aparat dotknij nazwy szablonu.",
              "Wybierz szablon, o który Ci chodzi.",
              "Rób ujęcia. Wybór utrzyma się, dopóki go nie cofniesz.",
            ),
            note(
              "Twoja przestrzeń robocza ma jeden szablon domyślny, używany zawsze wtedy, gdy nikt nie wybrał inaczej. Menedżerowie ustawiają domyślny w Przestrzeni zespołu w sekcji Znaki wodne.",
            ),
            see("teamspace/watermark-template-library"),
          ],
        },
        {
          slug: "photo-quality-and-storage",
          title: "Jakość zdjęć i pamięć",
          summary: "Wyważ jakość obrazu wobec szybkości przesyłania i pamięci telefonu.",
          keywords: ["jakość", "rozdzielczość", "pamięć", "rozmiar", "oryginał", "dane"],
          body: [
            h("Ustawienie jakości"),
            p(
              "Wyższa jakość to lepszy dowód i wolniejsze przesyłanie. Przy większości prac dokumentacyjnych ustawienie standardowe wystarcza — pozostaje czytelne po wydrukowaniu w raporcie. Podnieś je, gdy liczą się drobne szczegóły, jak włoskowate pęknięcia albo numery seryjne.",
            ),
            h("Zachowywanie oryginału"),
            p(
              "Możesz sprawić, by aplikacja zapisywała w galerii telefonu oryginał bez znaku wodnego obok wersji ze stemplem. Przydaje się, gdy potrzebujesz czystego obrazu do innego celu. Mniej więcej podwaja to miejsce zajmowane przez każde ujęcie na telefonie.",
            ),
            h("Zwalnianie miejsca"),
            ul(
              "Ujęcia, które zakończyły przesyłanie, można usunąć z urządzenia — zostają w Przestrzeni zespołu.",
              "To wideo zapycha telefon. Najpierw czyść przesłane klipy.",
              "Nigdy nie usuwaj niczego, co wciąż czeka w kolejce przesyłania.",
            ),
            see("mobile-app/offline-capture-and-queue", "mobile-app/app-settings"),
          ],
        },
        {
          slug: "notifications",
          title: "Powiadomienia",
          summary: "O czym aplikacja Cię informuje i jak ją wyciszyć.",
          keywords: ["powiadomienia", "push", "alerty", "wyciszenie", "wycisz"],
          body: [
            h("Co wysyła GeoCliks"),
            ul(
              "Przesyłanie zakończone albo przesyłanie nieudane i wymagające Twojej uwagi.",
              "Wiadomość bezpośrednia lub ogłoszenie z biura.",
              "Trasa przypisana Tobie oraz przypomnienia w miarę zbliżania się do przystanku.",
              "Zaproszenia i zmiany ról.",
            ),
            h("Jak je ograniczyć"),
            steps(
              "Otwórz Ustawienia w aplikacji.",
              "Otwórz Powiadomienia.",
              "Wyłącz kategorie, których nie potrzebujesz.",
            ),
            note(
              "Jeśli jesteś kierowcą, zostaw włączone powiadomienia o trasach. Dyspozytornia używa ich, żeby powiedzieć Ci, że przystanek został dodany do już trwającego kursu.",
            ),
            see("troubleshoot/notifications-not-arriving"),
          ],
        },
        {
          slug: "app-settings",
          title: "Ustawienia aplikacji",
          summary: "Język, motyw, siatka kadrowania, dźwięk migawki i reszta.",
          keywords: ["ustawienia", "język", "motyw", "tryb ciemny", "siatka", "dźwięk"],
          body: [
            h("Język"),
            p(
              "GeoCliks jest dostępny w 11 językach. Twój wybór dotyczy tylko tego urządzenia, więc każdy członek ekipy może czytać aplikację we własnym języku w obrębie jednej przestrzeni roboczej. Zostaw ustawienie domyślne przestrzeni, żeby podążać za tym, co wybrało biuro.",
            ),
            h("Wygląd"),
            p(
              "Dostępne są motyw jasny i ciemny. Ciemny jest łagodniejszy dla oczu w samochodzie nocą; jasny jest czytelniejszy w pełnym słońcu.",
            ),
            h("Pomoce przy ujęciach"),
            ul(
              "Siatka kadrowania — pomocnicza siatka w wizjerze. Nie zapisuje się na zdjęciu.",
              "Dźwięk migawki — wyłącz go na cichych obiektach. W niektórych krajach jest wymagany prawem i nie da się go tam wyłączyć.",
              "Zapisz oryginał — zachowaj na urządzeniu kopię bez znaku wodnego.",
            ),
            h("Twój profil"),
            p(
              "Twoje imię i nazwisko, zdjęcie oraz hasło znajdziesz w sekcji Profil. Twoje imię i nazwisko pojawia się na ujęciach, gdy szablon je zawiera, więc niech będzie w formie, po której rozpozna Cię ekipa.",
            ),
            see("mobile-app/photo-quality-and-storage", "teamspace/roles-and-permissions"),
          ],
        },
      ],
    },
  ],
};
