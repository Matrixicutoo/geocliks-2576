import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const legal: Category = {
  slug: "legal",
  title: "Prywatność i kwestie prawne",
  summary:
    "Do kogo należy materiał dowodowy, jak długo jest przechowywany i co naprawdę mówią Polityka prywatności oraz Regulamin.",
  icon: "Scale",
  sections: [
    {
      title: "Twoje dane",
      articles: [
        {
          slug: "data-ownership",
          title: "Do kogo należą Twoje ujęcia",
          summary:
            "Zdjęcia i filmy pozostają Twoje. Co GeoCliks może z nimi robić, a czego nie.",
          keywords: [
            "własność",
            "prawa",
            "licencja",
            "treści",
            "trenowanie",
            "ownership",
          ],
          body: [
            p(
              "Wszystko, co przesyłasz, należy do Ciebie: zdjęcia, filmy, dane projektów, notatki. GeoCliks to przechowuje i dowodzi, że nic się nie zmieniło. Przesłanie pliku nie czyni go naszą własnością.",
            ),
            h("Co wolno nam z tym zrobić"),
            p(
              "Regulamin daje GeoCliks wąską licencję — hostowanie, przechowywanie, przesyłanie, zmianę rozmiaru, indeksowanie i wyświetlanie Twoich ujęć — i tylko po to, żeby produkt działał dla Ciebie i dla osób, którym udostępniasz materiały. To cały zakres.",
            ),
            ul(
              "Nie sprzedajemy Twoich treści.",
              "Nie używamy ich do trenowania modeli uczenia maszynowego dla podmiotów trzecich.",
              "Nie pokazujemy ich nikomu, komu sam ich nie udostępniłeś.",
            ),
            h("Zapis należy do przestrzeni roboczej, nie do osoby"),
            p(
              "Ujęcia należą do przestrzeni roboczej, w której powstały, a nie do członka ekipy, który nacisnął spust migawki. Jest to zamierzone i właśnie to sprawia, że zapis dowodowy się trzyma:",
            ),
            ul(
              "Usunięcie członka zespołu zachowuje wszystkie zrobione przez niego zdjęcia oraz jego wpisy w historii ujęć.",
              "Usunięcie projektu nie usuwa jego ujęć.",
              "Osoba, która odchodzi, traci dostęp do treści przestrzeni roboczej, ale nie zabiera ich ze sobą.",
            ),
            note(
              "Jeśli jesteś w przestrzeni roboczej, której nie jesteś właścicielem, i chcesz zmienić coś w swoich ujęciach, poproś najpierw właściciela przestrzeni. W przypadku tych treści GeoCliks działa zgodnie z instrukcjami przestrzeni roboczej.",
            ),
            h("Za co odpowiadasz"),
            p(
              "Potwierdzasz, że masz prawo wykonać i przesłać to, co przesyłasz — łącznie z każdą zgodą wymaganą od osób, właścicieli nieruchomości lub zarządców terenu widocznych w kadrze. GeoCliks tego za Ciebie nie sprawdza.",
            ),
            h("Co potwierdza pieczęć, a czego nie"),
            p(
              "Kod, skrót i podpis przy każdym ujęciu sprawiają, że niewykryta manipulacja jest trudna, i pozwalają każdemu sprawdzić, że plik nie zmienił się od momentu dostarczenia. Nie czynią one z GeoCliks notariusza, geodety ani usługi prawnej i żaden sąd, ubezpieczyciel czy klient nie ma obowiązku przyjąć takiego zapisu. Ta decyzja zawsze należy do nich.",
            ),
            see("verify/how-sealing-works", "legal/data-retention", "legal/terms-summary"),
          ],
        },
        {
          slug: "data-retention",
          title: "Jak długo przechowujemy Twoje dane",
          summary:
            "Co przetrwa usunięcie projektu, usunięcie członka zespołu, anulowanie planu i zamknięcie przestrzeni roboczej.",
          keywords: [
            "przechowywanie",
            "usuwanie",
            "usuń",
            "magazyn",
            "anulowanie",
            "zamknięcie konta",
            "skasować",
            "retention",
          ],
          body: [
            p(
              "W skrócie: treści przestrzeni roboczej są przechowywane tak długo, jak długo istnieje ta przestrzeń. Prawie nic innego ich nie usuwa.",
            ),
            table(
              ["Co robisz", "Co dzieje się z ujęciami"],
              [
                ["Usuwasz projekt", "Ujęcia zostają. Zapis dowodowy nie jest powiązany z projektem."],
                ["Usuwasz członka zespołu", "Jego zdjęcia i wpisy w historii zostają w przestrzeni roboczej."],
                ["Usuwasz własne konto", "Znika Twój profil i dane logowania. Ujęcia wykonane w cudzej przestrzeni roboczej zostają w tej przestrzeni."],
                ["Anulujesz płatny plan", "Nic nie zostaje usunięte. Przestrzeń robocza przechodzi na plan bezpłatny, a płatne funkcje przestają działać."],
                ["Zamykasz przestrzeń roboczą", "Znika wszystko i nie da się tego cofnąć."],
              ],
            ),
            h("Anulowanie to nie usunięcie"),
            p(
              "Obniżenie planu ani jego anulowanie nigdy nie niszczy ujęć. Zachowujesz historię, a każdy kod zdjęcia przekazany już klientowi nadal działa na publicznej stronie weryfikacji. Tracisz natomiast funkcje powyżej bezpłatnych limitów — dodatkowe stanowiska, linki do udostępniania, bogatsze formaty eksportu.",
            ),
            h("Zamykanie przestrzeni roboczej na dobre"),
            p(
              "Celowo nie ma samoobsługowego przycisku usuwania całej przestrzeni roboczej — zbyt łatwo byłoby przez przypadek zniszczyć zapis dowodowy.",
            ),
            steps(
              "Właściciel przestrzeni roboczej pisze na support@geocliks.com z adresu przypisanego do konta właściciela.",
              "Najpierw wyeksportuj wszystko, co chcesz zachować — PDF, Excel, ZIP lub KMZ.",
              "Potwierdzamy prośbę, a następnie usuwamy przestrzeń roboczą i jej ujęcia.",
            ),
            warn(
              "Usunięcie przestrzeni roboczej jest nieodwracalne. Znikają ujęcia, projekty, raporty i kody zdjęć, a każdy link weryfikacyjny przekazany klientowi przestaje działać. Najpierw wyeksportuj dane.",
            ),
            h("Kopie zapasowe i dzienniki"),
            p(
              "Kopie zapasowe i dzienniki bezpieczeństwa są przechowywane przez ograniczony czas, a potem rotowane, więc usunięcie danych może chwilę potrwać, zanim obejmie każdą kopię.",
            ),
            h("Prośba o własne dane"),
            p(
              "Możesz poprosić nas o dostęp do swoich danych osobowych, ich poprawienie, wyeksportowanie lub usunięcie. Większość z nich zmienisz sam w profilu i ustawieniach rozliczeń. W pozostałych sprawach napisz na support@geocliks.com z adresu przypisanego do konta.",
            ),
            see("legal/data-ownership", "plans-billing/cancel-or-downgrade", "legal/privacy-summary"),
          ],
        },
      ],
    },
    {
      title: "Dokumenty prawne",
      articles: [
        {
          slug: "privacy-summary",
          title: "Polityka prywatności prostymi słowami",
          summary:
            "Co GeoCliks zbiera, po co, kto jeszcze to widzi i jakie masz wybory. Streszczenie, nie zamiennik.",
          keywords: [
            "prywatność",
            "polityka",
            "rodo",
            "dane osobowe",
            "lokalizacja",
            "pliki cookie",
            "prawa",
          ],
          body: [
            p(
              "To jest proste odczytanie Polityki prywatności, żebyś wiedział, co się w niej znajduje. Liczy się sam dokument, dostępny pod adresem geocliks.com/privacy.",
            ),
            h("Co zbieramy"),
            ul(
              "Dane konta: imię i nazwisko, e-mail, skrót hasła (nigdy samo hasło), zdjęcie profilowe, język, motyw oraz sekret uwierzytelniania dwuskładnikowego, jeśli je włączysz.",
              "Dane przestrzeni roboczej: nazwy przestrzeni i projektów, klienci, lokalizacje, role, zaproszenia, szablony i raporty.",
              "Ujęcia: zdjęcie lub film wraz ze znacznikiem czasu, współrzędnymi, ustalonym adresem, czasem wykonania na urządzeniu, kodem zdjęcia, skrótem treści i podpisem.",
              "Wiadomości: wiadomości bezpośrednie i ogłoszenia wewnątrz przestrzeni roboczej, w tym załączone obrazy.",
              "Dane urządzenia: wersja aplikacji, platforma, adres IP, token powiadomień push, dzienniki błędów i podstawowe zdarzenia użycia.",
              "Dane rozliczeniowe: Twój plan, status subskrypcji i identyfikatory zwracane przez operatora płatności. Numery kart nigdy do nas nie trafiają.",
            ),
            note(
              "GeoCliks nie chce numerów dokumentów tożsamości, informacji o zdrowiu ani innych danych wrażliwych. Nie umieszczaj ich w nazwach projektów, notatkach i wiadomościach.",
            ),
            h("Lokalizacja i aparat"),
            p(
              "Aplikacja prosi o dostęp do aparatu i lokalizacji, ponieważ ujęcie to zdjęcie plus miejsce i czas. Możesz odmówić każdego z tych uprawnień i aplikacja nadal będzie działać — ale ujęcie bez lokalizacji nie ma współrzędnych ani adresu, a to właśnie w największym stopniu czyni je dowodem. Lokalizacja jest odczytywana w chwili wykonania ujęcia i po to, by umieścić pinezki na mapie. Nie ma śledzenia w tle.",
            ),
            h("Kto jeszcze to widzi"),
            p(
              "Twoje dane nie są sprzedawane i nigdy nie są udostępniane na potrzeby reklamy. Przetwarza je na nasze polecenie niewielka grupa dostawców: hosting i magazyn w chmurze, operator płatności (oraz Apple w przypadku zakupów w aplikacji), dostawca poczty, usługa powiadomień push i dostawca map ustalający adresy.",
            ),
            h("Linki do udostępniania są naprawdę publiczne"),
            p(
              "Linki do udostępniania i strony weryfikacji działają dla każdego, kto ma link, bez logowania. O to w nich chodzi. Unieważnienie linku blokuje przyszły dostęp, ale nie cofnie kopii, którą ktoś już pobrał.",
            ),
            h("Twoje prawa"),
            p(
              "Z zastrzeżeniem prawa miejscowego możesz żądać dostępu do swoich danych osobowych, ich poprawienia, wyeksportowania lub usunięcia, ograniczenia niektórych operacji przetwarzania lub sprzeciwu wobec nich, a także wycofania zgody. Napisz na support@geocliks.com z adresu przypisanego do konta. W Kanadzie możesz też złożyć skargę do Biura Komisarza ds. Prywatności, a w EOG lub Wielkiej Brytanii — do swojego organu nadzorczego.",
            ),
            h("Pliki cookie"),
            p(
              "Tylko to, czego produkt potrzebuje: utrzymanie zalogowania, zapamiętanie języka i motywu oraz przechowywanie ujęć w kolejce, gdy jesteś offline. Żadnych plików cookie reklamowych ani śledzących między witrynami.",
            ),
            note(
              "Polityka prywatności i Regulamin są celowo publikowane wyłącznie po angielsku. Maszynowe tłumaczenie tekstu prawnego może zmienić jego znaczenie.",
            ),
            see("legal/data-retention", "teamspace/share-links", "legal/terms-summary"),
          ],
        },
        {
          slug: "terms-summary",
          title: "Regulamin prostymi słowami",
          summary:
            "Obowiązki obu stron, ograniczenia, o których GeoCliks mówi wprost, i co się dzieje, gdy przestaniesz płacić.",
          keywords: [
            "regulamin",
            "warunki",
            "umowa",
            "odpowiedzialność",
            "dozwolone użycie",
            "rozliczenia",
            "stanowiska",
            "terms",
          ],
          body: [
            p(
              "Proste odczytanie Regulaminu. Wiążący jest dokument pod adresem geocliks.com/terms; to streszczenie jest po to, żeby nic w nim Cię nie zaskoczyło.",
            ),
            h("Kto może korzystać"),
            p(
              "Musisz mieć ukończone 16 lat. Jeśli rejestrujesz się w imieniu firmy, potwierdzasz, że wolno Ci zaakceptować Regulamin w jej imieniu.",
            ),
            h("Ograniczenia, o których GeoCliks mówi otwarcie"),
            p(
              "Regulamin niezwykle bezpośrednio opisuje, czego produkt nie może obiecać, i warto tę listę przeczytać, zamiast zakładać:",
            ),
            ul(
              "GeoCliks nie jest notariuszem, geodetą, laboratorium ani usługą prawną, a nic, co tworzy, nie jest poradą prawną.",
              "Znacznik czasu zweryfikowany przez sieć oznacza, że nasz serwer zapisał moment dotarcia przesyłki — a nie że zegar urządzenia był prawidłowy.",
              "Gdy zegar urządzenia różni się od naszego o więcej niż kilka minut, ujęcie jest oznaczane jako mierzone czasem urządzenia.",
              "Dokładność lokalizacji zależy od telefonu i otoczenia; w budynkach i między wysokimi budynkami potrafi być mocno niedokładna.",
              "Ujęcia wykonane offline są zapieczętowane jako zweryfikowane dopiero po dotarciu na nasze serwery.",
              "Żaden sąd, ubezpieczyciel, klient ani organ nie ma obowiązku przyjąć zapisu GeoCliks.",
            ),
            h("Na co się nie zgadzasz"),
            ul(
              "Korzystanie z Usługi niezgodnie z prawem albo w celu nękania, inwigilowania lub zastraszania kogokolwiek.",
              "Przesyłanie treści, do których nie masz praw.",
              "Zmienianie, fałszowanie lub usuwanie stempla, skrótu, podpisu albo kodu zdjęcia, ani podawanie zmienionych materiałów za zapis GeoCliks.",
              "Sondowanie, przeciążanie lub zakłócanie Usługi albo obchodzenie limitów zapytań i limitów planu.",
              "Odsprzedaż Usługi lub dzielenie jednego stanowiska między kilka osób.",
            ),
            warn(
              "Stanowiska są na osobę, nie na urządzenie. Jeden członek ekipy może zalogować się na telefonie, tablecie i w przeglądarce — ale dwie osoby dzielące jeden login naruszają Regulamin i czynią historię ujęć bezużyteczną, bo każde zdjęcie jest przypisywane właścicielowi stanowiska.",
            ),
            h("Rozliczenia"),
            p(
              "Płatne plany odnawiają się automatycznie do momentu anulowania. Subskrypcje internetowe rozlicza nasz operator płatności; subskrypcje kupione w aplikacji na iOS rozlicza Apple i podlegają one procedurze zwrotów Apple. Ceny nie zawierają podatku. Zapłacone już opłaty nie podlegają zwrotowi, chyba że wymaga tego prawo.",
            ),
            p(
              "Jeśli płatność się nie powiedzie albo anulujesz plan, przestrzeń robocza przechodzi na plan bezpłatny, a płatne funkcje przestają działać. Twoje ujęcia zostają.",
            ),
            h("Zawieszenie"),
            p(
              "Możemy zawiesić lub zakończyć dostęp w razie naruszenia Regulaminu, przy korzystaniu zagrażającym Usłudze lub innym klientom, albo gdy wymaga tego prawo. Tam, gdzie jest to rozsądne, uprzedzamy wcześniej i dajemy szansę na wyeksportowanie danych.",
            ),
            h("Dostępność i odpowiedzialność"),
            p(
              "Nie ma umownej gwarancji dostępności, chyba że podpisałeś z nami odrębną pisemną umowę. Usługa jest świadczona w stanie, w jakim jest, a łączna odpowiedzialność za jakiekolwiek roszczenie jest ograniczona do kwoty zapłaconej w ciągu dwunastu miesięcy przed jego powstaniem. Niektóre jurysdykcje nie dopuszczają części tych zapisów i tam obowiązują one tylko w zakresie dozwolonym przez prawo.",
            ),
            h("Zmiany"),
            p(
              "Istotne zmiany Regulaminu lub Polityki prywatności są ogłaszane w aplikacji albo e-mailem, zanim zaczną obowiązywać. Pytania o oba dokumenty kieruj na support@geocliks.com.",
            ),
            see("legal/data-ownership", "plans-billing/seats-and-billing", "verify/verify-results-explained"),
          ],
        },
      ],
    },
  ],
};
