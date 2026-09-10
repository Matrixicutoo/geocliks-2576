import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const verify: Category = {
  slug: "verify",
  title: "Weryfikacja",
  summary:
    "Każde ujęcie ma kod, który każdy może sprawdzić, oraz pieczęć pokazującą, czy plik był zmieniany.",
  icon: "ShieldCheck",
  sections: [
    {
      title: "Sprawdzanie ujęcia",
      articles: [
        {
          slug: "what-is-a-photo-code",
          title: "Czym jest kod zdjęcia?",
          summary:
            "Krótki kod nadrukowany na każdym ujęciu i publiczna strona, do której prowadzi.",
          keywords: ["code", "photo code", "verify", "public", "qr", "proof"],
          body: [
            p(
              "Każde ujęcie otrzymuje unikalny kod, nadrukowany w znaku wodnym i przenoszony do każdego raportu oraz eksportu. Wygląda tak:",
            ),
            ul("GC-4K7P-92XB-1DQ4"),
            p(
              "Kod jest uchwytem do tego jednego ujęcia. Każdy, kto go ma — klient, ubezpieczyciel, likwidator szkody, prawnik — może go sprawdzić na publicznej stronie weryfikacji, bez konta, bez aplikacji i bez proszenia Cię o cokolwiek.",
            ),
            h("Gdzie pojawia się kod"),
            ul(
              "Wypalony w znaku wodnym na zdjęciu lub filmie, jeśli Twój szablon go zawiera.",
              "Na każdej stronie raportu PDF.",
              "W eksporcie do Excela, jeden wiersz na ujęcie.",
              "Jako nazwa pliku każdego obrazu w eksporcie ZIP.",
              "W e-mailu z potwierdzeniem dostawy wysyłanym do odbiorcy.",
            ),
            h("Dlaczego to ma znaczenie"),
            p(
              "Samo zdjęcie niczego nie dowodzi — każdy może wpisać w obraz dowolną datę. Kod, który prowadzi do niezależnego zapisu na serwerze dostawcy, pokazującego ten sam czas, te same współrzędne i nienaruszoną pieczęć, to zupełnie inny rodzaj dowodu. Osoba sprawdzająca nie musi Ci ufać.",
            ),
            note(
              "Kody zapisuje się w formacie GC-XXXX-XXXX-XXXX, ale możesz je wpisywać małymi literami, ze spacjami, bez przedrostka albo wkleić cały link weryfikacyjny. Wszystko to prowadzi do tego samego ujęcia. Ujęcia wykonane przed zmianą nazwy mają kod TM-; weryfikują się dokładnie tak jak dotąd, a kody wydrukowane w starych raportach nadal działają.",
            ),
            see("verify/verify-a-photo", "verify/how-sealing-works"),
          ],
        },
        {
          slug: "verify-a-photo",
          title: "Zweryfikuj zdjęcie",
          summary: "Jak Ty lub Twój klient sprawdzacie kod i co pokazuje strona.",
          keywords: ["verify", "check", "lookup", "client", "public page", "scan"],
          body: [
            p(
              "Weryfikacja jest publiczna i zajmuje kilka sekund. Wyślij klientowi kod, a sprawdzi go sam.",
            ),
            h("Sprawdź kod"),
            steps(
              "Wejdź na geocliks.com/v i wpisz kod albo otwórz link bezpośrednio.",
              "Przeczytaj zapis: przestrzeń robocza będąca właścicielem ujęcia, kiedy je wykonano, gdzie oraz wynik integralności.",
              "Porównaj to ze znakiem wodnym na zdjęciu, które masz przed sobą. Powinny się dokładnie zgadzać.",
            ),
            h("Co pokazuje strona"),
            table(
              ["Pole", "Znaczenie"],
              [
                ["Właściciel", "Przestrzeń robocza, do której należy ujęcie."],
                ["Wykonano", "Czas urządzenia w momencie zwolnienia migawki."],
                [
                  "Zweryfikowano",
                  "Czas serwera w chwili dotarcia pliku. Nie da się go ustawić z telefonu.",
                ],
                ["Lokalizacja", "Współrzędne, dokładność i adres, na który się rozwiązują."],
                ["Integralność", "Czy pieczęć nadal zgadza się z plikiem i metadanymi."],
                ["Urządzenie", "Model i platforma, które wykonały ujęcie."],
                ["Suma kontrolna", "Odcisk palca bajtów obrazu."],
              ],
            ),
            h("Dlaczego sam obraz bywa ukryty"),
            p(
              "Zapis jest zawsze publiczny; obraz nie. Zdjęcie pokazuje się tylko wtedy, gdy Twoja przestrzeń robocza opublikowała aktywny link udostępniania obejmujący to ujęcie. To celowe — kod, który wycieknie z raportu, nie powinien pociągnąć za sobą fotografii. Odwołaj link, a obraz znów staje się prywatny, podczas gdy zapis pozostaje możliwy do sprawdzenia.",
            ),
            note(
              "Publiczne weryfikacje trafiają do historii samego ujęcia, więc widzisz, że kod był sprawdzany. Powtórne wczytania w ciągu pół godziny liczą się jako jedno, więc klient odświeżający stronę nie zasypie prawdziwych zdarzeń.",
            ),
            see("teamspace/share-links", "verify/verify-results-explained"),
          ],
        },
        {
          slug: "verify-results-explained",
          title: "Odczytywanie wyniku",
          summary:
            "Zweryfikowane, niezweryfikowane, zmanipulowane oraz co oznacza ostrzeżenie o rozjeździe zegara.",
          keywords: ["verified", "unverified", "tampered", "skew", "clock", "result", "warning"],
          body: [
            p("Każde ujęcie ma jeden z trzech wyników integralności."),
            table(
              ["Wynik", "Znaczenie"],
              [
                [
                  "Zweryfikowano",
                  "Pieczęć zgadza się z plikiem i metadanymi. Nic się nie zmieniło od czasu przesłania.",
                ],
                [
                  "Niezweryfikowane",
                  "Nie udało się potwierdzić pieczęci. Zwykle ujęcie ze starszej wersji aplikacji albo niedokończone przesyłanie — nie dowód nieuczciwości.",
                ],
                [
                  "Zmanipulowane",
                  "Pieczęć się nie zgadza. Plik lub jego metadane zostały zmienione po przesłaniu.",
                ],
              ],
            ),
            h("Źródło czasu i rozjazd zegara"),
            p(
              "GeoCliks zapisuje dwa czasy: czas urządzenia w chwili wykonania zdjęcia oraz czas serwera w chwili jego dotarcia. Różnica między nimi jest przechowywana.",
            ),
            ul(
              "W granicach około pięciu minut źródło czasu odczytywane jest jako sieciowe — normalnie i zgodnie z oczekiwaniem.",
              "Powyżej tego odczytywane jest jako urządzenie, a rozjazd pokazywany jest w zapisie.",
            ),
            p(
              "Duży rozjazd nie jest automatycznie podejrzany. Telefon, który przez dwa dni był offline, przesyła plik z prawdziwą luką, a rozjazd ją tłumaczy. Oznacza to natomiast, że zegar urządzenia i zegar serwera się nie zgadzają, i zapis mówi to wprost, zamiast po cichu wybierać jeden z nich.",
            ),
            h("Jak wytłumaczyć wynik klientowi"),
            ul(
              "Zweryfikowano: zapis jest nienaruszony i po to właśnie jest weryfikacja.",
              "Niezweryfikowane: zaproponuj oryginał ze swojej przestrzeni roboczej, który nadal ma pełną historię.",
              "Zmanipulowane: zatrzymaj się i sprawdź, gdzie ten plik był. Nie przesyłaj go dalej.",
            ),
            warn(
              "Edytowanie zdjęcia poza GeoCliks — kadrowanie, kompresja, przepuszczenie przez komunikator — zmienia bajty i łamie pieczęć. Wysyłaj oryginał ze swojej przestrzeni roboczej albo z raportu, nigdy wersję, która przeszła przez coś innego.",
            ),
            see("verify/how-sealing-works", "troubleshoot/photos-not-uploading"),
          ],
        },
        {
          slug: "how-sealing-works",
          title: "Jak działa pieczętowanie",
          summary: "Trzy rzeczy, których urządzenie nie podrobi samo, wyjaśnione po ludzku.",
          keywords: ["hash", "signature", "hmac", "sha-256", "seal", "tamper", "security"],
          body: [
            p(
              "Nie potrzebujesz tego artykułu, żeby korzystać z GeoCliks. Jest tu dla osoby po drugiej stronie sporu, która chce wiedzieć, dlaczego temu zapisowi należy wierzyć.",
            ),
            h("1. Dwa zegary, oba zapisane"),
            p(
              "Czas wykonania pochodzi z urządzenia. Czas weryfikacji stempluje serwer GeoCliks w chwili dotarcia pliku i żadne ustawienie telefonu nie ma na niego wpływu. Oba są zachowane wraz z różnicą. Zmiana zegara w telefonie przesuwa czas wykonania i natychmiast ujawnia się jako luka względem czasu serwera.",
            ),
            h("2. Odcisk palca pliku"),
            p(
              "Wraz z zapisem przechowywana jest suma SHA-256 przesłanych bajtów obrazu. Zmień jeden piksel, a suma przestanie się zgadzać. To odcisk palca, nie kopia — nie mówi nic o zawartości zdjęcia.",
            ),
            h("3. Podpis obejmujący cały zapis"),
            p(
              "Kod zdjęcia, przestrzeń robocza będąca właścicielem, użytkownik wykonujący ujęcie, miejsce zapisu pliku, oba znaczniki czasu, współrzędne i suma kontrolna są łączone w ustalonej kolejności i podpisywane tajnym kluczem, który ma wyłącznie serwer. Zmień potem którąkolwiek z tych wartości, a podpis przestanie pasować — i właśnie to daje wynik Zmanipulowane.",
            ),
            h("Co to dowodzi, a czego nie"),
            ul(
              "Dowodzi, że plik i jego metadane nie zmieniły się od chwili, gdy GeoCliks je otrzymał.",
              "Dowodzi czasu dotarcia niezależnie od urządzenia.",
              "Nie dowodzi, że telefon był wycelowany w coś prawdziwego. Żaden system tego nie potrafi. Usuwa natomiast możliwość cichej zmiany zapisu po fakcie.",
            ),
            note(
              "Porównanie podpisu wykonywane jest w stałym czasie, więc samego sprawdzenia nie da się sondować, by wyliczyć klucz.",
            ),
            see("verify/verify-results-explained", "legal/data-ownership"),
          ],
        },
      ],
    },
  ],
};
