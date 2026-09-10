import { type Category, h, note, p, see, steps, ul, warn } from "../../types";

export const troubleshoot: Category = {
  slug: "troubleshoot",
  title: "Rozwiązywanie problemów",
  summary: "Rzeczy, które psują się najczęściej, i co sprawdzić w pierwszej kolejności.",
  icon: "Wrench",
  sections: [
    {
      title: "Ujęcia i przesyłanie",
      articles: [
        {
          slug: "photos-not-uploading",
          title: "Zdjęcia się nie przesyłają",
          summary: "Ujęcia stojące w kolejce i jak je ruszyć z miejsca.",
          keywords: [
            "przesyłanie",
            "kolejka",
            "utknęło",
            "oczekujące",
            "offline",
            "synchronizacja",
            "limit",
          ],
          body: [
            p(
              "Ujęcia zostają na telefonie do czasu przesłania. Kolejka przy słabym zasięgu jest normalna — kolejka, która nigdy się nie opróżnia, już nie.",
            ),
            h("Sprawdź w tej kolejności"),
            steps(
              "Otwórz aplikację i spójrz na kolejkę przesyłania. Jeśli pokazuje oczekujące pozycje, ujęcia są bezpieczne na urządzeniu.",
              "Znajdź prawdziwy zasięg albo Wi-Fi. Jedna kreska często łączy, ale nie przeniesie zdjęcia.",
              "Przełącz aplikację na pierwszy plan i zostaw ją tam na minutę. Niektóre telefony agresywnie wstrzymują transfery w tle.",
              "Sprawdź, czy telefon nie jest w trybie oszczędzania energii lub danych, który blokuje przesyłanie w tle.",
              "Wyloguj się i zaloguj ponownie tylko w ostateczności — zrób to przy pustej kolejce.",
            ),
            h("Jeśli kolejka się opróżnia, ale nic nie pojawia się w przestrzeni roboczej"),
            ul(
              "Sprawdź filtr projektu w aplikacji webowej. Ujęcia mogły trafić do projektu, na który nie patrzysz.",
              "Sprawdź filtr daty. Ujęcie z kolejki zapisuje się pod dniem wykonania, a nie pod dzisiejszym.",
              "Upewnij się, że patrzysz na właściwą przestrzeń roboczą, jeśli należysz do więcej niż jednej.",
            ),
            h("Jeśli osiągnąłeś miesięczny limit"),
            p(
              "Plan Free obejmuje 300 ujęć miesięcznie. Powyżej tego przesyłanie jest odrzucane do początku nowego miesiąca albo do przejścia na plan bez miesięcznego limitu.",
            ),
            warn(
              "Nie usuwaj aplikacji, gdy ujęcia czekają w kolejce. Przesłane ujęcia są w Twojej przestrzeni roboczej, ale wszystko, co wciąż czeka na urządzeniu, zniknie razem z nią.",
            ),
            note(
              "Czas wykonania zapisuje się na urządzeniu, więc zdjęcie przesłane dwa dni później nadal niesie moment naciśnięcia migawki, a weryfikacja to odzwierciedla.",
            ),
            see("mobile-app/offline-capture-and-queue", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "gps-or-address-wrong",
          title: "Pozycja GPS lub adres są błędne",
          summary: "Dlaczego pinezka ucieka i co zrobić z błędną nazwą ulicy.",
          keywords: [
            "gps",
            "lokalizacja",
            "adres",
            "dokładność",
            "błąd",
            "przesunięcie",
            "uprawnienia",
          ],
          body: [
            p(
              "GeoCliks zapisuje pozycję zgłoszoną przez telefon, a potem rozwiązuje ją na adres. Oba kroki mogą być nietrafione, z różnych powodów.",
            ),
            h("Pinezka jest w złym miejscu"),
            ul(
              "W budynkach, w piwnicy, w garażu podziemnym albo między wysokimi budynkami odbiór satelitarny jest słaby i telefon cofa się do zgrubnego ustalenia pozycji.",
              "Telefon dopiero co włączony nie ma jeszcze ustalonej pozycji. Daj mu piętnaście sekund na zewnątrz przed pierwszym ujęciem dnia.",
              "Każde ujęcie zapisuje swoją dokładność. Duża wartość dokładności to telefon mówiący Ci, że nie był pewny — to funkcja, nie usterka.",
            ),
            h("Pozycja jest dobra, ale adres błędny"),
            p(
              "Adres jest wyszukiwany na podstawie współrzędnych. Na nowym osiedlu, przy drodze wiejskiej albo na dużym terenie z jednym numerem porządkowym wraca najbliższy znany adres i może to być sąsiedni budynek. Współrzędne pozostają zapisem rozstrzygającym.",
            ),
            h("Nie ma żadnej lokalizacji"),
            steps(
              "Otwórz ustawienia telefonu i znajdź GeoCliks.",
              "Ustaw uprawnienie lokalizacji na Podczas używania aplikacji albo Zawsze.",
              "Na iPhonie włącz też Dokładną lokalizację. Bez niej dostajesz zgrubny obszar zamiast pozycji.",
              "Zrób ujęcie ponownie. Wcześniejszym ujęciom nie da się dodać lokalizacji po fakcie.",
            ),
            h("Przystanki dostaw w złym miejscu"),
            p(
              "Pozycja przystanku pochodzi z rozwiązania wpisanego adresu, a nie z telefonu. Popraw adres i wyszukaj ponownie albo ustaw pinezkę ręcznie.",
            ),
            warn(
              "Pozycji nie da się dodać ani zmienić po wykonaniu ujęcia. Właśnie to czyni ją dowodem — gdyby dało się ją później poprawić, niczego by nie dowodziła.",
            ),
            see("delivery-routes/geocoding-and-fixing-addresses", "verify/verify-results-explained"),
          ],
        },
      ],
    },
    {
      title: "Dostęp",
      articles: [
        {
          slug: "cant-sign-in",
          title: "Nie mogę się zalogować",
          summary: "Złe hasło, niezweryfikowany e-mail albo niewłaściwa metoda logowania.",
          keywords: [
            "logowanie",
            "zaloguj",
            "hasło",
            "reset",
            "weryfikacja",
            "google",
            "zablokowane",
          ],
          body: [
            p("Przejdź przez te punkty po kolei — przyczyną są zwykle pierwsze trzy."),
            h("Sprawdź podstawy"),
            steps(
              "Potwierdź adres e-mail. Adres służbowy i prywatny to dwa różne konta.",
              "Użyj tej samej metody, którą zakładałeś konto. Konto utworzone przez Google nie ma hasła do wpisania.",
              "Zresetuj hasło z ekranu logowania, jeśli nie masz pewności.",
              "Otwórz e-mail weryfikacyjny, jeśli nigdy nie potwierdziłeś adresu — niezweryfikowane konto nie może się zalogować.",
            ),
            h("Nic nie przychodzi po prośbie o reset"),
            ul(
              "Sprawdź spam i wiadomości-śmieci.",
              "Odczekaj dwie minuty. Powtarzane prośby mogą trafić na limit zapytań, co jeszcze bardziej spowalnia sprawę.",
              "Upewnij się, że adres istnieje — reset dla adresu bez konta nie wysyła nic.",
            ),
            h("Prosimy o potwierdzenie, że nie jesteś robotem"),
            p(
              "Powtarzane nieudane próby mogą wywołać test. Wykonaj go i kontynuuj. Jeśli pojawia się w kółko, spróbuj zwykłego okna przeglądarki zamiast prywatnego i wyłącz rozszerzenia blokujące skrypty.",
            ),
            h("Logujesz się, ale trafiasz w złe miejsce"),
            ul(
              "Jeśli należysz do więcej niż jednej przestrzeni roboczej, przełącz ją w menu konta.",
              "Członek terenowy widzi tylko przypisane mu projekty, więc pusto wyglądająca przestrzeń zwykle oznacza brak przypisań — poproś administratora.",
            ),
            note(
              "Usunięcie Cię z przestrzeni roboczej nie kasuje Twojego konta. Nadal możesz się zalogować; po prostu nie zobaczysz tej przestrzeni.",
            ),
            see("troubleshoot/two-factor-issues", "getting-started/create-your-account"),
          ],
        },
        {
          slug: "two-factor-issues",
          title: "Problemy z uwierzytelnianiem dwuskładnikowym",
          summary: "Odrzucane kody, zgubiony telefon i jak działają kody zapasowe.",
          keywords: [
            "2fa",
            "dwuskładnikowe",
            "totp",
            "aplikacja uwierzytelniająca",
            "kody zapasowe",
            "kod odrzucony",
          ],
          body: [
            p(
              "Uwierzytelnianie dwuskładnikowe jest opcjonalne i oferowane właścicielom oraz administratorom na stronie profilu. Ekipa terenowa celowo nie jest przepychana przez aplikację uwierzytelniającą, bo wspólny telefon w samochodzie czyni to udręką.",
            ),
            h("Kod jest odrzucany"),
            steps(
              "Sprawdź, czy odczytujesz wpis GeoCliks w aplikacji uwierzytelniającej, a nie innej usługi.",
              "Poczekaj na następny kod. Kody zmieniają się co 30 sekund, a ten, który zaraz wygaśnie, bywa odrzucany.",
              "Wpisz wszystkie sześć cyfr bez spacji.",
              "Sprawdź, czy zegar telefonu ustawia się automatycznie. Zegar urządzenia rozjechany o kilka minut generuje kody, których serwer nie przyjmie.",
            ),
            h("Zgubiłeś telefon z aplikacją uwierzytelniającą"),
            p(
              "Użyj jednego z kodów zapasowych, które dostałeś przy włączaniu uwierzytelniania dwuskładnikowego. Wybierz opcję kodu zapasowego na ekranie drugiego kroku i wpisz jeden. Każdy kod działa raz.",
            ),
            warn(
              "Jeśli straciłeś zarówno aplikację uwierzytelniającą, jak i kody zapasowe, nie odzyskamy konta z ekranu logowania. Napisz na support@geocliks.com z adresu przypisanego do konta i licz się z weryfikacją tożsamości — ta trudność jest właśnie sensem uwierzytelniania dwuskładnikowego.",
            ),
            h("Wyłączanie"),
            p(
              "Zaloguj się, otwórz profil i wyłącz uwierzytelnianie dwuskładnikowe. Zostaniesz poproszony o potwierdzenie. Jeśli jesteś właścicielem, rozważ pozostawienie go włączonego — to konto może zmieniać rozliczenia i usuwać ludzi.",
            ),
            note(
              "Uwierzytelnianie dwuskładnikowe dotyczy Twojego konta wszędzie. Po włączeniu zarówno strona, jak i aplikacja na telefonie proszą o drugi krok.",
            ),
            see("troubleshoot/cant-sign-in", "teamspace/roles-and-permissions"),
          ],
        },
        {
          slug: "invite-not-working",
          title: "Zaproszenie nie działa",
          summary: "Brak e-maila, wygasły link albo brak wolnych stanowisk w planie.",
          keywords: [
            "zaproszenie",
            "zaproś",
            "stanowisko",
            "wygasłe",
            "przyjęcie",
            "qr",
            "e-mail",
          ],
          body: [
            p("Problemy z zaproszeniami sprowadzają się do adresu, stanowisk albo planu."),
            h("Nigdy nie dostali e-maila"),
            steps(
              "Otwórz Zespół i sprawdź listę oczekujących — jeśli zaproszenie tam jest, zostało utworzone.",
              "Sprawdź adres pod kątem literówki. Zaproszenie jest powiązane z dokładnie tym adresem, na który je wysłano.",
              "Poproś, żeby sprawdzili spam.",
              "Użyj zamiast tego kodu QR: otwórz oczekujące zaproszenie, pokaż kod i poproś o zeskanowanie go telefonem.",
            ),
            h("Przyjęli zaproszenie, ale nic nie widzą"),
            p(
              "Członkowie terenowi widzą tylko przypisane im projekty. Przypisz ich w sekcji Zespół albo z poziomu samego projektu, a pojawi się to na ich telefonie w ciągu chwili.",
            ),
            h("W ogóle nie możesz wysłać zaproszenia"),
            ul(
              "Brak wolnych stanowisk: oczekujące zaproszenia też blokują stanowisko. Unieważnij nieaktualne zaproszenia, usuń osoby, które odeszły, albo przejdź na wyższy plan.",
              "Brak przestrzeni zespołu: zaproszenia zaczynają się od planu Business. Free i Plus są jednostanowiskowe.",
              "Niewłaściwa rola: zapraszanie wymaga roli administratora lub właściciela.",
            ),
            h("Przyjęli zaproszenie innym adresem e-mail"),
            p(
              "To nie zadziała — zaproszenie pasuje wyłącznie do adresu, na który je wysłano. Unieważnij je i wyślij nowe na adres, którego faktycznie używają.",
            ),
            note("Unieważnienie oczekującego zaproszenia zwalnia jego stanowisko natychmiast."),
            see("teamspace/invite-your-crew", "plans-billing/seats-and-billing"),
          ],
        },
      ],
    },
    {
      title: "Trasy, eksport i powiadomienia",
      articles: [
        {
          slug: "route-optimize-failed",
          title: "Trasa nie chce się zoptymalizować",
          summary: "Zwykle nierozwiązane adresy. Czasem plan.",
          keywords: [
            "optymalizacja",
            "trasa",
            "niepowodzenie",
            "współrzędne",
            "geokodowanie",
            "kolejność",
          ],
          body: [
            p("Optymalizator pracuje na pozycjach na mapie, a nie na wpisanych adresach."),
            h("„Żaden przystanek nie ma jeszcze współrzędnych”"),
            steps(
              "Otwórz trasę i wybierz Znajdź adresy.",
              "Spójrz na przystanki, których nie udało się rozwiązać.",
              "Popraw treść adresu albo ustaw pinezkę ręcznie na mapie.",
              "Zoptymalizuj ponownie.",
            ),
            h("Zoptymalizowało, ale część przystanków utknęła na końcu"),
            p(
              "Przystanków bez pozycji nie da się uporządkować, więc są odkładane na koniec listy, a nie usuwane z trasy. Rozwiąż je lub ustaw pinezkę i zoptymalizuj ponownie.",
            ),
            h("Prosiłeś o inteligentny optymalizator, a dostałeś standardowy"),
            p(
              "W planie bez inteligentnego optymalizatora GeoCliks uruchamia standardowy, zamiast odmówić. Nadal dostajesz uporządkowaną trasę. Historia trasy zapisuje, który optymalizator zadziałał.",
            ),
            h("Kolejność nadal wygląda źle"),
            ul(
              "Sprawdź, czy adres startowy jest ustawiony i czy powrót do bazy powinien być włączony.",
              "Sprawdź czas obsługi — mocno błędna wartość zniekształca każde szacowanie przyjazdu.",
              "Okna czasowe na przystankach ograniczają kolejność, a wąskie okno przeważy nad najkrótszą trasą.",
              "Przeciągnij przystanki ręcznie. Wiedza lokalna bije algorytm częściej, niż przyznają dostawcy.",
            ),
            see("delivery-routes/optimize-stop-order", "delivery-routes/geocoding-and-fixing-addresses"),
          ],
        },
        {
          slug: "export-or-report-failed",
          title: "Eksport lub raport się nie powiódł",
          summary: "Limity planu, zbyt duże zaznaczenia i formaty, których plan nie obejmuje.",
          keywords: [
            "eksport",
            "raport",
            "pdf",
            "excel",
            "zip",
            "kmz",
            "niepowodzenie",
            "pobieranie",
          ],
          body: [
            p("Większość nieudanych eksportów to limit planu, a nie usterka."),
            h("Format jest niedostępny"),
            ul(
              "Plan Free tworzy wyłącznie PDF, do 20 zdjęć.",
              "Excel, ZIP i KMZ zaczynają się od planu Plus.",
              "Dowiadujesz się o tym przed zbudowaniem pliku, a nie po, więc nic nie zostaje wygenerowane w połowie.",
            ),
            h("Eksport jest bardzo duży"),
            steps(
              "Zawęź zaznaczenie filtrem daty lub projektu.",
              "Eksportuj partiami — miesiąc naraz jest łatwiejszy zarówno do wysłania mailem, jak i do zbudowania.",
              "Przy tysiącach oryginałów wybierz ZIP zamiast PDF. PDF tej wielkości i tak jest bezużyteczny.",
            ),
            h("Plik nigdy się nie pobiera"),
            ul(
              "Raporty są budowane na serwerze, a potem trafiają na Twoją listę raportów — sprawdź tam i pobierz ponownie, zamiast budować od nowa.",
              "Sprawdź, czy przeglądarka nie zablokowała pobierania, i zajrzyj do folderu pobranych.",
              "Zanim to zgłosisz, spróbuj raz w innej przeglądarce.",
            ),
            h("KMZ się nie otwiera"),
            p(
              "KMZ wymaga Google Earth albo oprogramowania GIS. To nie jest format dokumentu i nie otworzy się w czytniku PDF ani w arkuszu kalkulacyjnym.",
            ),
            note(
              "Każdy wygenerowany raport zostaje na Twojej liście raportów, więc możesz pobrać go później bez budowania od nowa.",
            ),
            see("teamspace/reports-and-exports", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "notifications-not-arriving",
          title: "Powiadomienia nie docierają",
          summary: "Push na telefonie oraz e-maile, które powinni dostawać odbiorcy dostaw.",
          keywords: [
            "powiadomienia",
            "push",
            "e-mail",
            "alerty",
            "cisza",
            "odbiorca",
            "śledzenie",
          ],
          body: [
            p("To dwa różne systemy, więc sprawdź ten, który pasuje do tego, czego brakuje."),
            h("Powiadomienia push na telefonie"),
            steps(
              "Otwórz ustawienia telefonu, znajdź GeoCliks i zezwól na powiadomienia.",
              "Sprawdź tryb Nie przeszkadzać, Skupienie i wszelkie harmonogramy nocne.",
              "Otwórz raz aplikację, będąc zalogowanym — urządzenie rejestruje się do powiadomień push przy logowaniu, więc telefon, który nie otworzył aplikacji od ponownej instalacji, nie jest zarejestrowany.",
              "Wyślij sobie wiadomość z aplikacji webowej, żeby to przetestować.",
            ),
            h("Członek ekipy nic nie dostaje"),
            ul(
              "Musi być członkiem przestrzeni roboczej i być zalogowany na tym urządzeniu.",
              "Ogłoszenia trafiają do kontaktów przestrzeni roboczej — osoba usunięta z przestrzeni przestaje je otrzymywać.",
              "Telefon, który był offline przez wiele dni, odbiera zakolejkowane powiadomienia po ponownym połączeniu albo wcale, jeśli już wygasły.",
            ),
            h("Odbiorcy dostaw nie dostają e-maili"),
            ul(
              "Przystanek potrzebuje adresu e-mail odbiorcy. Bez niego żaden e-mail nie jest możliwy.",
              "Ustawienia powiadomień samej trasy sterują e-mailami z zapowiedzią i z dowodem dostawy.",
              "Nieudane przystanki nigdy nie wysyłają e-maila z dowodem dostawy — z założenia. Biuro obsługuje je ręcznie.",
              "Każdy odbiorca dostaje każdy e-mail raz, więc ponowna wysyłka nie pójdzie drugi raz.",
              "Wysyłka e-maili musi być skonfigurowana dla Twojej przestrzeni roboczej. Jeśli żaden odbiorca na żadnej trasie nigdy niczego nie dostał, to właśnie sprawdź w pierwszej kolejności.",
            ),
            warn(
              "Poproś odbiorcę o sprawdzenie spamu, zanim uznasz, że nic nie wysłano. E-mail transakcyjny ze zdjęciem trafia do śmieci częściej, niż byś chciał.",
            ),
            see("delivery-routes/tracking-links-and-notifications", "teamspace/messages-and-broadcasts"),
          ],
        },
      ],
    },
  ],
};
