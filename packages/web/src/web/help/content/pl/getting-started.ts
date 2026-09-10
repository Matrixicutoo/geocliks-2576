import { type Category, h, note, p, see, steps, ul } from "../../types";

export const gettingStarted: Category = {
  slug: "getting-started",
  title: "Pierwsze kroki",
  summary: "Nowy w GeoCliks? Wybierz ścieżkę, która pasuje do Ciebie.",
  icon: "Rocket",
  sections: [
    {
      title: "Podstawy",
      articles: [
        {
          slug: "what-is-geocliks",
          title: "Czym jest GeoCliks?",
          summary:
            "Dowody z terenu, które da się udowodnić: każde zdjęcie niesie zweryfikowany czas, pozycję GPS i adres.",
          keywords: ["overview", "about", "product", "introduction"],
          body: [
            p(
              "GeoCliks to narzędzie do dokumentacji zdjęciowej i wideo dla ekip w terenie. Rejestrujesz pracę telefonem, a każde ujęcie zostaje ostemplowane czasem wykonania, miejscem wykonania oraz adresem, na który ta pozycja się rozwiązuje. Stempel jest wypalany w obrazie i zapisywany osobno, żeby dało się go później sprawdzić.",
            ),
            p(
              "Nie chodzi o ładniejsze zdjęcia. Chodzi o to, że gdy klient, ubezpieczyciel albo sąd zapyta, czy zdjęcie jest tym, za co je podajesz, masz odpowiedź, która nie opiera się na Twoim słowie.",
            ),
            h("Co dostajesz"),
            ul(
              "Zdjęcia i filmy ze znakiem wodnym, ze zweryfikowanym czasem, współrzędnymi GPS i adresem.",
              "Unikalny kod zdjęcia na każdym ujęciu, który każdy może sprawdzić bez konta.",
              "Przestrzeń zespołu: wspólne miejsce, w którym biuro widzi ujęcia ekipy w miarę ich przesyłania.",
              "Projekty, widok mapy, porównania przed i po oraz eksport do PDF, Excela, ZIP i KMZ jednym kliknięciem.",
              "Trasy dostaw: zaplanuj dzień kierowcy, wyślij go w teren i zamknij każdy przystanek zdjęciem dowodowym.",
            ),
            h("Kto z tego korzysta"),
            ul(
              "Ekipy budowlane i wykonawcze dokumentujące postęp i odbiór prac.",
              "Prace remontowe i ubezpieczeniowe, gdzie cała argumentacja opiera się na chronologii.",
              "Zespoły utrzymania sieci, telekomunikacji i inspekcji, które potrzebują lokalizacji na każdym zapisie.",
              "Operacje dostawcze, które potrzebują dowodu, że przesyłka faktycznie dotarła.",
            ),
            note(
              "GeoCliks działa offline. Ujęcia czekają w kolejce na urządzeniu i przesyłają się same, gdy wróci zasięg, z zachowanym oryginalnym czasem wykonania.",
            ),
            see("getting-started/create-your-account", "verify/what-is-a-photo-code"),
          ],
        },
        {
          slug: "create-your-account",
          title: "Załóż konto",
          summary: "Zarejestruj się w aplikacji lub w sieci — to samo konto działa wszędzie.",
          keywords: ["sign up", "register", "new account", "email"],
          body: [
            p(
              "Jedno konto GeoCliks działa w aplikacji mobilnej, na stronie i w aplikacji na komputer. Załóż je tam, gdzie Ci wygodnie; rejestrując się w innym miejscu, nie tworzysz drugiego konta.",
            ),
            h("Rejestracja"),
            steps(
              "Otwórz aplikację GeoCliks albo wejdź na geocliks.com i wybierz rejestrację.",
              "Podaj imię i nazwisko, służbowy e-mail oraz hasło, albo kontynuuj przez Google.",
              "Sprawdź skrzynkę, znajdź e-mail weryfikacyjny i otwórz link.",
              "Wybierz język. Możesz go później zmienić w swoim profilu.",
            ),
            note(
              "Używaj służbowego e-maila, nie prywatnego. Gdy ktoś zaprosi Cię do przestrzeni roboczej, wyśle zaproszenie na adres, który zna.",
            ),
            h("Jeśli e-mail weryfikacyjny nie dociera"),
            ul(
              "Odczekaj dwie minuty i sprawdź folder ze spamem.",
              "Sprawdź wpisany adres — zwykle winna jest brakująca litera.",
              "Poproś o nowy link z ekranu logowania.",
            ),
            see("getting-started/for-solo-user", "troubleshoot/cant-sign-in"),
          ],
        },
        {
          slug: "install-the-app",
          title: "Zainstaluj aplikację",
          summary:
            "Zainstaluj GeoCliks na iPhonie, iPadzie lub Androidzie i korzystaj z wersji webowej na komputerze.",
          keywords: ["download", "ios", "android", "install", "desktop"],
          body: [
            p(
              "Rejestrowanie odbywa się na telefonie lub tablecie. Przeglądanie, raportowanie i planowanie tras są wygodniejsze na komputerze, ale wszystko jest dostępne w obu miejscach.",
            ),
            h("Telefon"),
            ul(
              "iPhone i iPad: zainstaluj z App Store.",
              "Android: zainstaluj z Google Play.",
              "Albo otwórz geocliks.com/get-app na urządzeniu i przejdź linkiem dla swojej platformy.",
            ),
            h("Komputer"),
            p(
              "Wejdź na geocliks.com i zaloguj się. Nie ma czego instalować — przestrzeń zespołu działa w przeglądarce. Dostępna jest też aplikacja na komputer, jeśli wolisz osobne okno.",
            ),
            h("O jakie uprawnienia prosi aplikacja"),
            ul(
              "Aparat — wymagany. Bez niego nie ma czego rejestrować.",
              "Lokalizacja — wymagana. Pozycja GPS to połowa tego, co czyni ujęcie dowodem.",
              "Zdjęcia — opcjonalnie, tylko jeśli chcesz zapisywać ujęcia także w galerii telefonu.",
              "Powiadomienia — opcjonalnie, o przesyłaniu, wiadomościach i przydzielonych trasach.",
            ),
            note(
              "Ustaw uprawnienie lokalizacji co najmniej na „Podczas używania aplikacji”. Przy „Pytaj za każdym razem” aplikacja musi Ci przerywać przed każdym ujęciem.",
            ),
            see("mobile-app/sign-in-on-mobile", "troubleshoot/gps-or-address-wrong"),
          ],
        },
      ],
    },
    {
      title: "Wybierz swoją ścieżkę",
      articles: [
        {
          slug: "for-solo-user",
          title: "Jeśli pracujesz sam",
          summary: "Najszybsza konfiguracja dla jednoosobowej działalności.",
          keywords: ["solo", "single user", "freelancer", "one person"],
          body: [
            p(
              "Nie potrzebujesz zespołu, żeby GeoCliks był przydatny. Konto jednoosobowe daje Ci ujęcia ze znakiem wodnym, projekty rozdzielające zlecenia i eksporty, które możesz przekazać klientowi.",
            ),
            h("Skonfiguruj się w pięć minut"),
            steps(
              "Zainstaluj aplikację i zaloguj się.",
              "Utwórz pierwszy projekt — zwykle adres zlecenia albo nazwa klienta.",
              "Otwórz szablon znaku wodnego i dodaj logo, żeby eksporty wyglądały jak Twoje.",
              "Zrób testowe ujęcie i sprawdź, czy stempel pokazuje właściwy czas i adres.",
              "Wyeksportuj je do PDF, żeby zobaczyć, co dostanie klient.",
            ),
            h("Co robić, gdy pracy przybywa"),
            ul(
              "Trzymaj jeden projekt na jedno zlecenie. Raporty zostają czytelne, a mapa przejrzysta.",
              "Używaj porównań przed i po na początku oraz na końcu każdego zlecenia.",
              "Wysyłaj klientom link udostępniania zamiast załącznika — pozostaje aktualny.",
            ),
            note(
              "Plan darmowy obejmuje zdjęcia ze znakiem wodnym, wideo do 30 sekund przez pierwsze trzy dni oraz eksport PDF do 20 zdjęć. Plus znosi limity zdjęć i wideo dla jednej osoby.",
            ),
            see("teamspace/create-a-project", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "for-team-owner",
          title: "Jeśli prowadzisz zespół",
          summary: "Utwórz przestrzeń roboczą, zaproś ekipę i zdecyduj, kto co może.",
          keywords: ["owner", "admin", "setup", "workspace", "manager"],
          body: [
            p(
              "Właściciel przestrzeni roboczej konfiguruje przestrzeń zespołu raz, a reszta po prostu dołącza. Zrób to na komputerze — jest szybciej niż na telefonie.",
            ),
            h("Kolejność konfiguracji, która się sprawdza"),
            steps(
              "Utwórz przestrzeń roboczą i nadaj jej nazwę swojej firmy.",
              "Zbuduj szablon znaku wodnego z logo i polami, które mają być na każdym zdjęciu.",
              "Utwórz bieżące projekty, zanim kogokolwiek zaprosisz, żeby ekipa miała gdzie odkładać ujęcia.",
              "Zaproś ekipę e-mailem albo udostępnij link dołączenia lub wydrukowany kod QR.",
              "Ustaw rolę każdej osoby. Większość ekipy powinna mieć Field.",
              "Zrób jedno ujęcie samodzielnie i potwierdź, że trafia do właściwego projektu.",
            ),
            h("Role"),
            ul(
              "Owner — pełna kontrola, łącznie z płatnościami i usunięciem przestrzeni roboczej. Jest jeden.",
              "Admin — wszystko to, co właściciel, poza płatnościami i własnością.",
              "Manager — tworzy projekty i trasy, zaprasza osoby, przygotowuje raporty.",
              "Field — robi zdjęcia i filmy, jeździ przydzielonymi trasami, widzi własną pracę.",
            ),
            note(
              "Zapraszaj ludzi jako Field, chyba że muszą tworzyć projekty lub przygotowywać raporty. Rolę możesz podnieść w każdej chwili; zadziała, gdy następnym razem otworzą aplikację.",
            ),
            see("teamspace/invite-your-crew", "teamspace/roles-and-permissions"),
          ],
        },
        {
          slug: "for-crew-member",
          title: "Jeśli zaproszono Cię do zespołu",
          summary: "Dołącz do przestrzeni roboczej i zrób pierwsze ujęcie.",
          keywords: ["field", "crew", "join", "invited", "member"],
          body: [
            p(
              "Ktoś w Twojej firmie założył przestrzeń roboczą i dodał Cię do niej. Twoim zadaniem jest rejestrowanie pracy w terenie; biuro zajmuje się projektami, raportami i płatnościami.",
            ),
            h("Dołączanie"),
            steps(
              "Otwórz e-mail z zaproszeniem albo zeskanuj kod QR od swojego kierownika.",
              "Załóż konto albo zaloguj się, jeśli już je masz.",
              "Zainstaluj aplikację GeoCliks na telefonie.",
              "Zezwól na aparat i lokalizację. Oba są wymagane do rejestrowania.",
              "Otwórz listę projektów i wybierz zlecenie, przy którym pracujesz.",
            ),
            h("Twoje pierwsze ujęcie"),
            steps(
              "Dotknij przycisku rejestrowania.",
              "Sprawdź, czy podgląd znaku wodnego pokazuje właściwy projekt i adres.",
              "Zrób zdjęcie. Prześle się samo.",
              "Jeśli nie masz zasięgu, pracuj dalej — ujęcia czekają w kolejce i prześlą się później.",
            ),
            note(
              "Nie możesz zmienić czasu ani lokalizacji ujęcia i Twój kierownik również nie może. To sedno tego produktu, a nie ograniczenie.",
            ),
            see("mobile-app/take-a-photo", "mobile-app/offline-capture-and-queue"),
          ],
        },
      ],
    },
  ],
};
