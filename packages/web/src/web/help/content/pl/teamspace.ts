import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const teamspace: Category = {
  slug: "teamspace",
  title: "Przestrzeń zespołu",
  summary:
    "Wspólna przestrzeń robocza, do której trafiają ujęcia ekipy i w której biuro zamienia je w projekty, raporty i linki do udostępniania.",
  icon: "Users",
  sections: [
    {
      title: "Twoja przestrzeń robocza",
      articles: [
        {
          slug: "teamspace-overview",
          title: "Przestrzeń zespołu — przegląd",
          summary:
            "Czym jest przestrzeń robocza, co w niej ląduje i kto widzi którą jej część.",
          keywords: [
            "przestrzeń robocza",
            "organizacja",
            "firma",
            "pulpit",
            "wspólna",
            "workspace",
          ],
          body: [
            p(
              "Przestrzeń zespołu to jedna wspólna przestrzeń robocza dla jednej firmy. Każde zdjęcie i każdy film, który ekipa zrobi telefonem, przesyła się do niej, a wszyscy z dostępem widzą tę samą bibliotekę w aplikacji internetowej, w aplikacji na komputer albo w telefonie.",
            ),
            p(
              "Nie musisz nic przenosić do przestrzeni zespołu ręcznie. Ujęcie jest w niej, jak tylko skończy się przesyłanie — razem ze zweryfikowaną godziną, pozycją GPS i adresem.",
            ),
            h("Co znajduje się w przestrzeni zespołu"),
            ul(
              "Biblioteka zdjęć i filmów, od najnowszego ujęcia.",
              "Projekty — zlecenia, lokalizacje lub klienci, według których grupujesz ujęcia.",
              "Twoja ekipa: członkowie, ich role i to, które projekty widzi każdy z nich.",
              "Szablony znaku wodnego, żeby każdy telefon znaczył ujęcia tak samo.",
              "Wygenerowane raporty i eksporty oraz wszystkie rozdane linki do udostępniania.",
              "Trasy dostaw, jeśli korzystasz z modułu dostaw.",
            ),
            h("Kto co widzi"),
            p(
              "Właściciele, administratorzy i menedżerowie widzą całą przestrzeń roboczą. Członkowie terenowi widzą tylko projekty, do których są przypisani — własne ujęcia plus wszystko inne w tych projektach. To główny powód, żeby wkładać pracę w projekty, a nie zostawiać ją luzem.",
            ),
            note(
              "Przestrzeń zespołu jest częścią planu Business i wyższych. W planach Free i Plus nadal masz pełne robienie zdjęć, znak wodny i weryfikację, ale w przestrzeni roboczej jesteś sam.",
            ),
            see(
              "teamspace/create-a-project",
              "teamspace/roles-and-permissions",
              "plans-billing/compare-plans",
            ),
          ],
        },
        {
          slug: "create-a-project",
          title: "Utwórz projekt",
          summary:
            "Grupuj ujęcia według zlecenia, lokalizacji lub klienta, żeby filtry, raporty i dostęp ekipy się zgadzały.",
          keywords: ["projekt", "zlecenie", "lokalizacja", "klient", "folder", "project"],
          body: [
            p(
              "Projekt to pojemnik na ujęcia — zwykle jedno zlecenie, jedna lokalizacja albo jeden klient. Z projektów budowane są raporty, do projektów dostają dostęp członkowie terenowi i według nich grupuje mapa oraz widok „Przed / Po”.",
            ),
            h("Utwórz projekt"),
            steps(
              "W aplikacji internetowej otwórz „Projekty” i wybierz „Nowy projekt”.",
              "Nadaj mu nazwę. To jedyne wymagane pole.",
              "Opcjonalnie dodaj kod zlecenia, nazwę klienta, etykietę lokalizacji i adres.",
              "Dodaj branżę i notatki wewnętrzne, jeśli Twój zespół z nich korzysta.",
              "Zapisz. Projekt jest od razu dostępny w wyborze projektu w aplikacji mobilnej.",
            ),
            h("Pola i ich zastosowanie"),
            table(
              ["Pole", "Do czego służy"],
              [
                ["Nazwa projektu", "Tak projekt wygląda wszędzie. Do 90 znaków."],
                ["Kod zlecenia", "Twój własny numer zlecenia lub zamówienia roboczego. Można go wyszukać."],
                ["Klient", "Dla kogo jest praca. Przydaje się przy eksporcie."],
                ["Etykieta lokalizacji", "Ludzka nazwa miejsca, na przykład „Plac północny”."],
                ["Adres lokalizacji", "Adres miejsca. Służy do wyśrodkowania projektu na mapie."],
                ["Branża", "Twoje własne grupowanie, na przykład „Dachy” albo „Przeglądy”."],
                ["Notatki o zakresie", "Kontekst wewnętrzny. Nigdy nie pokazuje się w linku do udostępniania."],
              ],
            ),
            h("Status projektu"),
            p(
              "Każdy projekt jest aktywny, wstrzymany, ukończony albo zarchiwizowany. Status nie zmienia nic w dostępie ani w przechowywaniu — jest po to, żeby zakończone zlecenie przestało zaśmiecać listę. Filtruj według statusu u góry strony „Projekty”.",
            ),
            note(
              "Utworzenie projektu wymaga roli Manager lub wyższej. Członkowie terenowi mogą robić zdjęcia w projektach, do których są przypisani, ale nie mogą tworzyć nowych.",
            ),
            warn(
              "Każdy plan obejmuje określoną liczbę projektów. Po osiągnięciu limitu zobaczysz prośbę o zmianę planu, zamiast móc utworzyć projekt, który nie byłby objęty.",
            ),
            see("teamspace/invite-your-crew", "mobile-app/assign-capture-to-project"),
          ],
        },
        {
          slug: "browse-and-filter-photos",
          title: "Przeglądaj i filtruj zdjęcia",
          summary:
            "Zawęź tysiące ujęć do tych kilku, których potrzebujesz — według projektu, osoby, znacznika, daty lub tekstu.",
          keywords: [
            "szukaj",
            "filtruj",
            "biblioteka",
            "galeria",
            "znacznik",
            "znajdź",
            "search",
            "tag",
          ],
          body: [
            p(
              "Biblioteka zdjęć pokazuje każde ujęcie w przestrzeni roboczej, od najnowszego. Filtry się kumulują — ustaw ich tyle, ile chcesz, i wszystkie działają razem.",
            ),
            h("Filtry"),
            ul(
              "Filtr projektu — tylko ujęcia przypisane do tego projektu.",
              "Członek — tylko ujęcia zrobione przez jedną osobę.",
              "Znacznik — Praca, Przed, Po, Problem, Przyjazd, Wyjazd, Odbiór lub Dostawa.",
              "Zakres dat — ujęcia zrobione między dwiema datami, według godziny zdjęcia, nie godziny przesłania.",
              "Szukaj — dopasowuje adres, notatkę przy ujęciu i kod zdjęcia.",
            ),
            h("Szukanie po kodzie zdjęcia"),
            p(
              "Jeśli klient poda Ci kod zdjęcia ze znaku wodnego, wklej go w pole „Szukaj kodu, adresu, notatki”. Znajdzie dokładnie to ujęcie, co jest szybsze niż przewijanie do właściwej daty.",
            ),
            h("Praca na zaznaczeniu"),
            p(
              "Zaznacz kilka ujęć, aby przenieść je do projektu, oznaczyć znacznikiem, zbudować raport tylko z nich albo je usunąć. Usuwanie wymaga roli Manager lub wyższej.",
            ),
            note(
              "Filtry daty korzystają z godziny zrobienia zdjęcia. Ujęcie, które dwa dni czekało w kolejce offline, i tak trafia na dzień, w którym ekipa była na miejscu.",
            ),
            see("teamspace/map-view", "teamspace/reports-and-exports", "verify/verify-a-photo"),
          ],
        },
        {
          slug: "map-view",
          title: "Widok mapy",
          summary:
            "Zobacz każde ujęcie jako pinezkę i potwierdź, że ekipa była tam, gdzie mówią dokumenty.",
          keywords: ["mapa", "gps", "pinezki", "lokalizacja", "współrzędne", "map"],
          body: [
            p(
              "Widok mapy nanosi ujęcia według zapisanej pozycji GPS. Odpowiada na pytanie, na które siatka zdjęć nie potrafi: czy praca została wykonana tam, gdzie miała być wykonana?",
            ),
            h("Jak z niego korzystać"),
            steps(
              "Otwórz „Mapa” w nawigacji przestrzeni roboczej.",
              "Zastosuj te same filtry projektu, członka, znacznika i daty, których używasz w bibliotece.",
              "Kliknij pinezkę, aby zobaczyć ujęcie, jego adres i dokładną godzinę.",
              "Przybliż skupisko, aby rozdzielić pinezki leżące kilka metrów od siebie.",
            ),
            h("Kiedy pinezka wygląda źle"),
            ul(
              "W pomieszczeniach, w piwnicy albo między wysokimi budynkami dokładność GPS spada. Pinezka może być o dziesiątki metrów obok, choć zdjęcie jest prawdziwe.",
              "Adres jest wyliczany ze współrzędnych, więc zły odczyt daje wiarygodną, ale błędną nazwę ulicy.",
              "Ujęcia zrobione z odmówionym dostępem do lokalizacji nie mają pinezki i nie pojawią się na mapie.",
            ),
            note(
              "Bieżący wybór z mapy możesz wyeksportować jako plik KMZ i otworzyć w Google Earth — o to często proszą zakłady komunalne i klienci samorządowi.",
            ),
            see("troubleshoot/gps-or-address-wrong", "teamspace/reports-and-exports"),
          ],
        },
        {
          slug: "before-after-compare",
          title: "Porównanie przed i po",
          summary: "Ustaw dwa ujęcia obok siebie, aby pokazać zmianę, za którą Ci zapłacono.",
          keywords: ["przed", "po", "porównanie", "postęp", "suwak", "before", "after"],
          body: [
            p(
              "Widok porównania łączy dwa ujęcia z tego samego projektu i pokazuje je razem, każde z własną zweryfikowaną godziną i adresem. To najszybszy sposób, aby udowodnić wykonaną pracę.",
            ),
            h("Przygotowanie"),
            steps(
              "Oznacz pierwsze ujęcie znacznikiem „Przed” w aplikacji lub w bibliotece internetowej.",
              "Oznacz ujęcie stanu końcowego znacznikiem „Po”.",
              "Otwórz projekt i wybierz widok „Przed / Po”.",
              "Wybierz parę, jeśli oznaczona jest więcej niż jedna.",
            ),
            h("Jak uzyskać czystą parę"),
            ul(
              "Stań mniej więcej w tym samym miejscu i trzymaj telefon na tej samej wysokości przy obu zdjęciach.",
              "Ujmij w kadrze stały punkt odniesienia — drzwi, słupek, narożnik — na obu zdjęciach.",
              "Zrób zdjęcie „po” z tej samej odległości; przybliżanie zamiast podejścia zmienia perspektywę.",
            ),
            note(
              "Układ „Przed / po” jest jednym z układów raportu, więc jak tylko para jest oznaczona, możesz wstawić ją prosto do klienckiego PDF-a.",
            ),
            see("teamspace/reports-and-exports", "mobile-app/take-a-photo"),
          ],
        },
      ],
    },
    {
      title: "Udostępnianie pracy",
      articles: [
        {
          slug: "reports-and-exports",
          title: "Raporty i eksporty",
          summary:
            "Zamień przefiltrowany zestaw ujęć w plik PDF, arkusz Excela, archiwum ZIP albo plik KMZ.",
          keywords: [
            "pdf",
            "excel",
            "xlsx",
            "zip",
            "kmz",
            "eksport",
            "raport",
            "pobieranie",
            "export",
          ],
          body: [
            p(
              "Raport to zrzut zestawu ujęć w pliku, który możesz wysłać. Najpierw zbuduj zestaw filtrami, potem eksportuj — do pliku trafia to, co widzisz na ekranie.",
            ),
            h("Zbuduj raport"),
            steps(
              "Przefiltruj bibliotekę do ujęć, których chcesz użyć, albo otwórz projekt.",
              "Wybierz „Zbuduj pakiet” i nadaj raportowi tytuł.",
              "Wybierz układ: siatka zdjęć, jedno na stronę, przed / po albo mapa z dziennikiem.",
              "Wybierz format: PDF, Excel, ZIP lub KMZ.",
              "Wybierz „Wygeneruj raport”. Plik powstaje na serwerze i pojawia się na liście raportów, skąd pobierzesz go teraz albo później.",
            ),
            h("Którego formatu użyć"),
            table(
              ["Format", "Kiedy go użyć"],
              [
                ["PDF", "Dokumentacja dla klienta. Zdjęcia ze znakiem wodnym, rozłożone i ponumerowane."],
                ["Excel", "Jeden wiersz na ujęcie: godzina, współrzędne, adres, znacznik i notatka."],
                ["ZIP", "Oryginalne pliki zdjęć, do przekazania innemu systemowi."],
                ["KMZ", "Otwarcie miejsc ujęć w Google Earth lub oprogramowaniu GIS."],
              ],
            ),
            h("Układy"),
            ul(
              "Siatka zdjęć — wiele zdjęć na stronę, najlepsza przy dużej liczbie.",
              "Jedno na stronę — jedno ujęcie na stronę z pełnym blokiem metadanych.",
              "Przed / po — oznaczone pary obok siebie.",
              "Mapa + dziennik — naniesione miejsca ujęć wraz ze spisem zdjęć.",
            ),
            warn(
              "Formaty eksportu zależą od planu. Plan Free tworzy PDF do 20 zdjęć; Excel, ZIP i KMZ zaczynają się od planu Plus. Jeśli format nie jest objęty planem, dowiesz się o tym przed zbudowaniem pliku, a nie po.",
            ),
            see("plans-billing/compare-plans", "troubleshoot/export-or-report-failed"),
          ],
        },
        {
          slug: "share-links",
          title: "Linki do udostępniania",
          summary:
            "Wyślij ujęcie komuś, kto nie ma konta, i odbierz link, gdy skończysz.",
          keywords: [
            "udostępnianie",
            "link",
            "adres",
            "klient",
            "publiczny",
            "unieważnij",
            "wygaśnięcie",
            "share",
          ],
          body: [
            p(
              "Link do udostępniania to adres internetowy, który pokazuje ujęcie — plik, jego zweryfikowaną godzinę, pozycję GPS i adres — każdemu, kto go otworzy. Bez konta, bez aplikacji, bez logowania.",
            ),
            h("Utwórz link"),
            steps(
              "Otwórz ujęcie w aplikacji internetowej.",
              "Wybierz „Udostępnij”.",
              "Opcjonalnie ustaw wygaśnięcie w dniach. Zostaw „Nigdy”, aby link nie wygasał.",
              "Skopiuj link i wyślij go.",
            ),
            h("Zarządzanie linkami"),
            ul(
              "Każdy link jest wypisany w przestrzeni roboczej razem z datą utworzenia i liczbą wyświetleń.",
              "Link możesz w każdej chwili unieważnić. Natychmiast przestaje działać dla wszystkich, którzy go mają.",
              "Prośba o udostępnienie ujęcia, które ma już działający link, daje Ci ten istniejący link, a nie drugi nowy.",
            ),
            h("Czego link do udostępniania nie pokazuje"),
            ul(
              "Twoich pozostałych ujęć, projektów ani ekipy.",
              "Wewnętrznych notatek o zakresie projektu.",
              "Niczego o Twojej przestrzeni roboczej, planie ani rozliczeniach.",
            ),
            warn(
              "Traktuj link jak publiczny. Każdy, komu zostanie przesłany dalej, może go otworzyć, dopóki go nie unieważnisz albo dopóki nie wygaśnie.",
            ),
            note(
              "Linki do udostępniania są funkcją planów płatnych. Jeśli „Udostępnij” jest niedostępne, sprawdź swój plan.",
            ),
            see("verify/verify-a-photo", "plans-billing/compare-plans"),
          ],
        },
      ],
    },
    {
      title: "Twoja ekipa",
      articles: [
        {
          slug: "invite-your-crew",
          title: "Zaproś swoją ekipę",
          summary:
            "Dodawaj osoby e-mailem lub kodem QR i od pierwszego dnia przypisuj je do właściwych projektów.",
          keywords: [
            "zaproszenie",
            "dodaj członka",
            "stanowisko",
            "qr",
            "wdrożenie",
            "ekipa",
            "invite",
          ],
          body: [
            p(
              "Członkowie dołączają na zaproszenie. Ty je wysyłasz, oni je przyjmują, a ich ujęcia zaczynają trafiać do Twojej przestrzeni zespołu.",
            ),
            h("Wyślij zaproszenie"),
            steps(
              "Otwórz „Zespół” i wybierz „Zaproś członka ekipy”.",
              "Wpisz jego służbowy e-mail.",
              "Wybierz rolę. Field jest domyślna i odpowiednia dla większości ekipy.",
              "Zaznacz projekty, do których ma mieć dostęp już przy pierwszym zalogowaniu.",
              "Wybierz „Wyślij zaproszenie”. Osoba dostanie e-mail z linkiem, który doda ją do Twojej przestrzeni roboczej.",
            ),
            h("Zaproszenie kogoś, kto stoi obok Ciebie"),
            p(
              "Każde oczekujące zaproszenie ma też kod QR. Pokaż go na ekranie, niech osoba zeskanuje go kamerą telefonu i wejdzie na stronę przyjęcia zaproszenia bez wpisywania adresu. Przydaje się przy ekipie, która jest z Tobą na miejscu.",
            ),
            h("Stanowiska"),
            p(
              "Każdy plan obejmuje pewną liczbę stanowisk. Oczekujące zaproszenie zajmuje stanowisko, więc pięć zaproszeń przy trzech stanowiskach zostanie odrzucone, zamiast pozwolić wszystkim przyjąć zaproszenie i przekroczyć plan. Jeśli nie masz wolnych stanowisk, unieważnij zaproszenie, które nie zostanie przyjęte, usuń członka, który odszedł, albo zmień plan.",
            ),
            h("Jeśli zaproszenie nie dotarło"),
            ul(
              "Poproś, aby sprawdziła spam, i potwierdź użyty adres.",
              "Sprawdź listę „Oczekujące zaproszenia” — jeśli zaproszenie tam jest, wyślij je ponownie albo użyj kodu QR.",
              "Zaproszenie jest powiązane z adresem e-mail, na który zostało wysłane; przyjęcie go z innego adresu nie zadziała.",
            ),
            note("Zapraszanie i usuwanie członków wymaga roli Admin lub wyższej."),
            see("teamspace/roles-and-permissions", "troubleshoot/invite-not-working"),
          ],
        },
        {
          slug: "roles-and-permissions",
          title: "Role i uprawnienia",
          summary:
            "Owner, Admin, Manager i Field — co może każda z nich i komu którą nadać.",
          keywords: [
            "rola",
            "uprawnienia",
            "administrator",
            "menedżer",
            "teren",
            "dostęp",
            "właściciel",
            "role",
          ],
          body: [
            p(
              "Są cztery role. Każdy członek ma dokładnie jedną i to ona decyduje, co widzi i co może zmienić. W aplikacji nazwy ról są pokazywane po angielsku.",
            ),
            table(
              ["Rola", "Co może"],
              [
                [
                  "Owner",
                  "Wszystko, w tym rozliczenia i zmiany planu. Jeden na przestrzeń roboczą i nie można mu tej roli odebrać.",
                ],
                [
                  "Admin",
                  "Zaprasza i usuwa członków, zmienia role, zarządza projektami, szablonami i eksportami.",
                ],
                [
                  "Manager",
                  "Tworzy i edytuje projekty, usuwa ujęcia, wysyła wiadomości do całej ekipy, buduje raporty. Bez zarządzania członkami.",
                ],
                [
                  "Field",
                  "Robi zdjęcia i widzi tylko przypisane projekty. Bez dostępu do zespołu, zaproszeń i rozliczeń.",
                ],
              ],
            ),
            h("Co komu nadać"),
            ul(
              "Ekipa pracująca w terenie: Field.",
              "Brygadzista albo kierownik miejsca, który organizuje zlecenia: Manager.",
              "Biuro, które wdraża ludzi i przygotowuje dokumentację dla klienta: Admin.",
              "Rolę Owner zostaw osobie, która płaci rachunki.",
            ),
            h("Zmiana roli"),
            steps(
              "Otwórz „Zespół”.",
              "Wybierz członka.",
              "Wybierz nową rolę. Zadziała, gdy jego aplikacja następnym razem połączy się z serwerem.",
            ),
            h("Usuwanie osoby"),
            p(
              "Usunięcie członka odbiera mu dostęp. Nie usuwa jego pracy: jego zdjęcia, filmy i stojący za nimi ślad audytowy zostają w przestrzeni zespołu — o to właśnie chodzi w trzymaniu dowodów w przestrzeni roboczej, a nie w telefonie.",
            ),
            warn(
              "Nie możesz usunąć właściciela przestrzeni roboczej ani siebie samego. Tylko właściciel może usunąć innego administratora, więc dwóch administratorów nie może usunąć się wzajemnie.",
            ),
            see("teamspace/invite-your-crew", "plans-billing/seats-and-billing"),
          ],
        },
        {
          slug: "messages-and-broadcasts",
          title: "Wiadomości i ogłoszenia",
          summary:
            "Napisz do jednego członka ekipy albo wyślij jedno ogłoszenie do wszystkich naraz.",
          keywords: [
            "wiadomość",
            "czat",
            "ogłoszenie",
            "powiadomienie",
            "push",
            "message",
            "broadcast",
          ],
          body: [
            p(
              "Wiadomości to rozmowy jeden na jeden między osobami z tej samej przestrzeni roboczej. Docierają jako powiadomienie push na telefon, więc nie musisz szukać ekipy w prywatnym komunikatorze.",
            ),
            h("Napisz do kogoś"),
            steps(
              "Otwórz „Wiadomości”.",
              "Wybierz osobę z kontaktów swojej przestrzeni roboczej.",
              "Napisz i wyślij. Możesz dołączyć ostatnie ujęcie, aby było jasne, o czym mówisz.",
            ),
            h("Wiadomość do całej ekipy"),
            p(
              "Wiadomość do całej ekipy wysyła tę samą treść wszystkim w przestrzeni roboczej naraz. Dostarczana jest jako zwykła wiadomość w rozmowie każdej osoby, więc odpowiedzi wracają do Ciebie prywatnie, zamiast zamieniać się w kłótnię grupową.",
            ),
            steps(
              "Otwórz „Wiadomości” i wybierz „Wiadomość do całej ekipy”.",
              "Opcjonalnie powiąż projekt, aby ludzie wiedzieli, którego zlecenia dotyczy.",
              "Napisz wiadomość i wyślij. Zobaczysz, do ilu osób trafiła.",
            ),
            note(
              "Wysłanie wiadomości do całej ekipy wymaga roli Manager lub wyższej. Rozmowy jeden na jeden są dostępne dla wszystkich w przestrzeni roboczej.",
            ),
            see("mobile-app/notifications", "troubleshoot/notifications-not-arriving"),
          ],
        },
      ],
    },
    {
      title: "Standardy",
      articles: [
        {
          slug: "watermark-template-library",
          title: "Biblioteka szablonów znaku wodnego",
          summary:
            "Ustaw pieczęć, której używa każdy telefon w przestrzeni roboczej, aby ujęcia wracały spójne.",
          keywords: [
            "znak wodny",
            "szablon",
            "marka",
            "logo",
            "pieczęć",
            "domyślny",
            "watermark",
            "template",
          ],
          body: [
            p(
              "Szablon znaku wodnego decyduje o tym, co jest wypalane w narożniku każdego ujęcia: które pola się pojawiają, gdzie siedzi blok i czy jest na nim Twoje logo. Szablony żyją w przestrzeni roboczej, a nie na urządzeniu, więc to, co tu ustawisz, znaczy całą ekipę.",
            ),
            h("Utwórz szablon"),
            steps(
              "Otwórz „Szablony znaku wodnego” w ustawieniach przestrzeni roboczej.",
              "Wybierz „Nowy szablon” i nazwij go od zastosowania, nie od klienta — „Postęp na budowie” starzeje się lepiej niż „Zlecenie Northline”.",
              "Zaznacz pola do pokazania: data i godzina, współrzędne, adres, projekt, nazwa członka, kod zdjęcia, pogoda, własny wiersz.",
              "Wybierz układ i rozmiar, a jeśli chcesz, wgraj logo.",
              "Zapisz szablon.",
            ),
            h("Szablon domyślny"),
            p(
              "Jeden szablon jest domyślny dla przestrzeni roboczej. Nowi członkowie dostają go automatycznie i telefon używa go, dopóki ktoś nie przełączy. Domyślny możesz zmienić w każdej chwili; istniejące ujęcia zostają nietknięte.",
            ),
            h("Porządki"),
            ul(
              "Usunięcie szablonu nie zmienia ujęć już nim oznaczonych.",
              "Nie możesz zostać bez szablonu domyślnego — ustawienie jednego jako domyślnego w tym samym kroku odbiera tę rolę poprzedniemu.",
              "Ekipa może przełączać się między szablonami przestrzeni roboczej w telefonie, ale nie może ich edytować.",
            ),
            warn(
              "Plan Free obejmuje dwa szablony. Plany płatne pozwalają zbudować własny zestaw z logo.",
            ),
            see("mobile-app/watermark-templates", "mobile-app/switch-template"),
          ],
        },
      ],
    },
  ],
};
