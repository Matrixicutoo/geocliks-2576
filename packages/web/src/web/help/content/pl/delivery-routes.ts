import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const deliveryRoutes: Category = {
  slug: "delivery-routes",
  title: "Trasy dostaw",
  summary:
    "Zaplanuj dzień kierowcy, wyślij go w trasę i zamknij każdy przystanek zdjęciem, które odbiorca może zobaczyć.",
  icon: "Route",
  sections: [
    {
      title: "Zaplanuj dzień",
      articles: [
        {
          slug: "delivery-overview",
          title: "Jak działają dostawy",
          summary:
            "Jak wygląda dzień dostaw w GeoCliks: zbuduj trasę, przypisz kierowcę, zamknij każdy przystanek dowodem.",
          keywords: [
            "dostawa",
            "trasy",
            "dyspozytor",
            "kierowca",
            "dowód dostawy",
            "delivery",
            "pod",
          ],
          body: [
            p(
              "Trasy dostaw biorą ten sam pomysł ze zweryfikowanym zdjęciem i stosują go do dnia pracy kierowcy. W biurze budujesz listę przystanków, przekazujesz ją kierowcy, a kierowca zamyka każdy przystanek, fotografując dostawę. Zdjęcie nosi zweryfikowaną godzinę, pozycję GPS i adres, więc spór o dostawę ma odpowiedź.",
            ),
            h("Dzień od początku do końca"),
            steps(
              "Biuro tworzy trasę na konkretną datę i wkleja adresy z tego dnia.",
              "GeoCliks zamienia adresy na pozycje na mapie, a Ty poprawiasz te, których nie udało się umieścić.",
              "Ustawiasz kolejność przystanków — ręcznie albo optymalizatorem.",
              "Przypisujesz trasę kierowcy, który widzi ją w swoim telefonie.",
              "Kierowca schodzi w dół listy, fotografując każdą dostawę.",
              "Odbiorcy, którzy mają adres e-mail, dostają wiadomość z dowodem dostawy i zdjęciem.",
              "Biuro na bieżąco patrzy, jak trasa się domyka, i zachowuje ślad audytowy.",
            ),
            h("Dwa rodzaje trasy"),
            table(
              ["Typ trasy", "Kiedy go użyć"],
              [
                [
                  "Zaplanowana",
                  "Znasz cały dzień z góry. Zbuduj trasę, zoptymalizuj ją i wyślij w drogę.",
                ],
                [
                  "Dyspozytorska",
                  "Zlecenia przychodzą w trakcie zmiany i trafiają między pozostałe przystanki kierowcy.",
                ],
              ],
            ),
            h("Każdy przystanek kończy się jednym z czterech stanów"),
            ul(
              "Dostarczony — zamknięty zdjęciem jako dowodem.",
              "Nieudany — kierowca nie mógł dostarczyć; z powodem i ze zdjęciem.",
              "Pominięty — nie było tu czego dostarczać. Jedyne zamknięcie bez zdjęcia.",
              "Oczekujący — jeszcze nieosiągnięty.",
            ),
            note(
              "Dostawy są osobną funkcją niż dokumentacja dowodowa. Twój miesięczny limit przystanków wynika z planu, a plany Delivery Lite, Pro, Fleet, Fleet 30, Fleet 200 i Fleet 500 istnieją dla firm, które głównie jeżdżą.",
            ),
            see("delivery-routes/create-a-route", "plans-billing/delivery-plans"),
          ],
        },
        {
          slug: "create-a-route",
          title: "Utwórz trasę",
          summary:
            "Ustaw datę, miejsce załadunku, godzinę startu i to, ile zwykle zajmuje jeden przystanek.",
          keywords: [
            "nowa trasa",
            "utwórz",
            "magazyn",
            "godzina startu",
            "minuty na przystanek",
            "podpis",
            "route",
          ],
          body: [
            p(
              "Trasa to praca jednego kierowcy na jeden dzień. Najpierw ją utwórz, potem wypełnij przystankami.",
            ),
            h("Utwórz ją"),
            steps(
              "Otwórz „Trasy dostaw” i wybierz „Nowa trasa”.",
              "Nazwij ją tak, aby dyspozytor rozpoznał ją w zabiegany poranek — „Wtorek północ” jest lepsze niż „Trasa 4”.",
              "Ustaw datę.",
              "Wybierz typ trasy: zaplanowana albo dyspozytorska.",
              "Opcjonalnie powiąż ją z projektem, aby zdjęcia dostaw trafiły do dowodów tego zlecenia.",
              "Wpisz adres startowy — zwykle Twój magazyn lub plac.",
              "Wybierz „Utwórz trasę”.",
            ),
            h("Ustawienia, które kształtują plan"),
            table(
              ["Ustawienie", "Do czego służy"],
              [
                [
                  "Adres startowy",
                  "Miejsce, w którym zaczyna się dzień. Optymalizator planuje trasę od tego punktu.",
                ],
                ["Powrót na start", "Uwzględnia w planie przejazd powrotny do magazynu."],
                ["Godzina startu", "Kiedy kierowca rusza. Domyślnie 08:00."],
                [
                  "Minuty na przystanek",
                  "Ile minut zajmuje przeciętny przystanek. Domyślnie 5. Na tym opierają się szacowane godziny przyjazdu.",
                ],
                ["Wymagaj podpisu", "Prosi kierowcę o podpis obok zdjęcia."],
              ],
            ),
            h("Warto dobrze ustawić minuty na przystanek"),
            p(
              "Z tej wartości liczona jest szacowana godzina przyjazdu dla każdego dalszego przystanku. Pięć minut pasuje do paczki pod drzwiami. Przystanek, który oznacza rozładunek palet, to bliżej dwudziestu — a na pojedynczych przystankach, o których wiesz, że idą wolno, możesz nadpisać tę wartość.",
            ),
            note(
              "Utworzenie trasy wymaga roli Manager lub wyższej. Kierowcy nie budują własnych tras.",
            ),
            warn(
              "Tryb dyspozytorski wymaga planu Delivery Pro lub wyższego. Jeśli Twój plan obejmuje tylko trasy zaplanowane, dowiesz się o tym przy wyborze typu trasy, a nie po zbudowaniu całego dnia.",
            ),
            see("delivery-routes/add-stops-by-pasting-a-list", "delivery-routes/live-dispatch"),
          ],
        },
        {
          slug: "add-stops-by-pasting-a-list",
          title: "Dodaj przystanki, wklejając listę lub wgrywając plik CSV",
          summary:
            "Wklej kolumnę z arkusza, e-mail od klienta albo wgraj plik CSV — GeoCliks tak samo odczyta kolumny.",
          keywords: [
            "przystanki",
            "wklej",
            "import",
            "wgraj",
            "plik",
            "arkusz",
            "csv",
            "hurtowo",
            "adresy",
            "paste",
          ],
          body: [
            p(
              "Przystanki wchodzą na dwa sposoby: wklejasz adresy albo wgrywasz plik CSV. Jedno i drugie kończy w tym samym polu i przechodzi przez ten sam czytnik, więc wszystko poniżej dotyczy obu. Nie musisz wcześniej przeformatowywać listy.",
            ),
            h("Wklej listę"),
            steps(
              "Otwórz trasę i znajdź pole „Dodaj przystanki”.",
              "Wklej blok tekstu. Jeden przystanek na wiersz.",
              "Przeczytaj podsumowanie nad polem: ile przystanków znaleziono, jakiego separatora użyto, które kolumny rozpoznano i ile wierszy pominięto.",
              "Popraw w źródle to, co wygląda źle, i wklej ponownie — albo dodaj przystanki i edytuj je pojedynczo.",
              "Wybierz „Dodaj przystanki”.",
            ),
            h("Wgraj plik CSV"),
            steps(
              "Wyeksportuj listę z arkusza lub systemu zamówień jako plik CSV.",
              "Otwórz trasę i znajdź pole „Dodaj przystanki”.",
              "Wybierz „Wgraj plik CSV” i wskaż plik.",
              "Treść pliku wpada do pola, gdzie możesz przeczytać podsumowanie i poprawić każdy wiersz, zanim cokolwiek powstanie.",
              "Wybierz „Dodaj przystanki”.",
            ),
            note(
              "Wgranie pliku samo nie tworzy przystanków — tylko wypełnia pole. Do trasy nic nie zostanie dodane, dopóki nie wybierzesz „Dodaj przystanki”, więc zły plik nic Cię nie kosztuje. Plik musi być w formacie CSV lub zwykłym tekstem i mieć poniżej 1 MB.",
            ),
            h("Co rozumie czytnik"),
            ul(
              "Rozdzielanie tabulatorami, przecinkami lub średnikami. Sam ustala, którego użyłeś.",
              "Pola w cudzysłowach, więc adres z przecinkiem w środku zostaje jednym adresem.",
              "Wiersz nagłówka, jeśli jest. Kolumny są wtedy dopasowywane po nazwie, w dowolnej kolejności.",
              "Nazwy kolumn po polsku, angielsku, francusku, portugalsku, niemiecku lub włosku — adres/ulica/miasto/kod pocztowy/address/adresse, odbiorca/nazwisko/klient/name, e-mail/email, telefon/komórka/phone, referencja/numer zamówienia/reference, uwagi/notatki/notes. Ogonki i kreski są opcjonalne, więc „zamowienie” i „komorka” działają tak samo.",
              "Adres rozbity na kilka kolumn arkusza — ulica, miasto, województwo, kod pocztowy — sklejony z powrotem w jeden wiersz.",
              "Adresy e-mail i numery telefonów rozpoznawane po samym kształcie, nawet bez wiersza nagłówka.",
            ),
            h("Pola przy przystanku"),
            table(
              ["Pole", "Dlaczego ma znaczenie"],
              [
                ["Adres", "Wymagany. Wszystko inne jest opcjonalne."],
                ["Nazwa odbiorcy", "Pokazywana kierowcy i używana w e-mailu z dowodem dostawy."],
                ["E-mail odbiorcy", "Bez niego ten odbiorca nie dostanie ani śledzenia, ani dowodu dostawy."],
                ["Telefon odbiorcy", "Aby kierowca mógł zadzwonić przed przyjazdem."],
                ["Numer referencyjny", "Twój numer zamówienia, faktury lub przesyłki. Można go wyszukać."],
                ["Uwagi", "Kod do bramy, numer domofonu, gdzie zostawić."],
                ["Okno czasowe", "Najwcześniejsza i najpóźniejsza akceptowalna godzina przyjazdu."],
                ["Minuty na przystanek", "Nadpisanie wartości trasy dla przystanku, o którym wiesz, że idzie wolno."],
              ],
            ),
            h("Dlaczego kod pocztowy nigdy nie jest brany za nazwisko"),
            p(
              "Kanadyjska lista wklejona jako „12 Main St, Moncton NB, E1A 4H2” tworzyła kiedyś odbiorcę o nazwie E1A 4H2. Czytnik rozpoznaje teraz słowa oznaczające ulicę, kody prowincji oraz kształt kodu pocztowego i ZIP, a końcowe pole bierze za nazwisko dopiero wtedy, gdy naprawdę na nie wygląda.",
            ),
            note(
              "W jednym wklejeniu możesz dodać do 300 przystanków. Przy większym dniu wklej listę partiami — dołączają do tej samej trasy.",
            ),
            warn(
              "Każdy przystanek wlicza się do miesięcznego limitu dostaw. Jeśli wklejenie przekroczyłoby limit planu, zostaje odrzucone w całości, więc nigdy nie zostajesz z połową trasy.",
            ),
            see(
              "delivery-routes/geocoding-and-fixing-addresses",
              "plans-billing/delivery-plans",
            ),
          ],
        },
        {
          slug: "geocoding-and-fixing-addresses",
          title: "Znajdowanie adresów i poprawianie błędnych",
          summary:
            "Zamień wpisane adresy na pozycje na mapie i ustaw punkt ręcznie, gdy adresu nie da się znaleźć.",
          keywords: [
            "geokodowanie",
            "adres",
            "punkt",
            "współrzędne",
            "nie znaleziono",
            "mapa",
            "geocode",
          ],
          body: [
            p(
              "Wklejony adres to tylko tekst. Zanim trasę można uporządkować albo policzyć jej czasy, każdy przystanek potrzebuje pozycji na mapie. Ten krok to znajdowanie adresów i uruchamiasz go z poziomu trasy.",
            ),
            h("Znajdź adresy przystanków"),
            steps(
              "Otwórz trasę.",
              "Wybierz „Znajdź adresy”. Przetwarzane są tylko przystanki, których jeszcze nie znaleziono.",
              "Przeczytaj wynik: ile udało się umieścić i ile wymaga sprawdzenia.",
              "Zajmij się nieudanymi, zanim zaczniesz optymalizować.",
            ),
            h("Każdy przystanek ma swój status lokalizacji"),
            table(
              ["Status", "Znaczenie"],
              [
                ["Bez lokalizacji", "Jeszcze nieszukany."],
                ["Zlokalizowany", "Umieszczony na mapie, z uporządkowanym adresem."],
                ["Nie znaleziono", "Nie udało się go znaleźć. Potrzebuje Twojej pomocy."],
                [
                  "Punkt ręczny",
                  "Sam ustawiłeś punkt. Nigdy nie jest nadpisywany przy ponownym szukaniu.",
                ],
              ],
            ),
            h("Poprawianie nieudanego przystanku"),
            ul(
              "Popraw adres i poszukaj ponownie — zwykłą przyczyną jest brakujące miasto lub województwo.",
              "Albo otwórz mapę i sam ustaw punkt w właściwym miejscu. Przystanek staje się punktem ręcznym i jest traktowany jako umieszczony.",
              "Punkt ręczny jest odpowiedzią na nowe osiedle, działkę na wsi albo miejsce bez adresu.",
            ),
            h("Ponowne szukanie"),
            p(
              "Wymuszone ponowne szukanie sprawdza każdy przystanek od nowa, także te już zlokalizowane. Celowo nie rusza punktów ręcznych, bo punkt ustawiony ręką to lepsza informacja niż cokolwiek, co zwróci wyszukiwanie.",
            ),
            note(
              "Wyszukiwanie adresów jest nastawione na Kanadę, więc krótki adres w rodzaju „12 Main St, Moncton” znajdzie się bez podawania kraju.",
            ),
            warn(
              "Przystanków bez pozycji optymalizator nie może uporządkować. Są odkładane na koniec trasy, a nie usuwane, więc zanim wyślesz kierowcę, sprawdź końcówkę listy.",
            ),
            see("delivery-routes/optimize-stop-order", "troubleshoot/gps-or-address-wrong"),
          ],
        },
      ],
    },
    {
      title: "Wyślij w drogę",
      articles: [
        {
          slug: "optimize-stop-order",
          title: "Ustaw kolejność przystanków",
          summary:
            "Zmień kolejność ręcznie albo pozwól optymalizatorowi ułożyć kolejność przejazdu za Ciebie.",
          keywords: [
            "optymalizuj",
            "kolejność",
            "sekwencja",
            "przestaw",
            "najkrótsza",
            "planowanie trasy",
            "optimize",
          ],
          body: [
            p(
              "Przystanki zaczynają w kolejności, w której je dodałeś. To rzadko jest kolejność, w której chcesz je przejechać.",
            ),
            h("Ręcznie"),
            p(
              "Przeciągnij przystanki w kolejność, jakiej chcesz, albo użyj przycisków „W górę” i „W dół”. Przydaje się, gdy kierowca zna okolicę lepiej niż jakikolwiek algorytm albo gdy jeden klient musi być pierwszy.",
            ),
            h("Optymalizatorem"),
            steps(
              "Najpierw znajdź adresy — przystanku bez pozycji nie da się uporządkować.",
              "Wybierz „Optymalizuj kolejność”.",
              "Przejrzyj wynik: nową kolejność, łączny dystans i szacowany czas jazdy.",
              "Popraw potem ręcznie, jeśli chcesz. Optymalizacja jest podpowiedzią, którą możesz odrzucić.",
            ),
            h("Dwa optymalizatory"),
            table(
              ["Optymalizator", "Co robi"],
              [
                [
                  "Standardowy",
                  "Działa w GeoCliks, bez usługi zewnętrznej i bez licznika. Dobra kolejność na zwykły dzień.",
                ],
                [
                  "Inteligentny",
                  "Korzysta z prawdziwych danych o sieci drogowej, aby ciaśniej ułożyć gęste lub niewygodne trasy. Delivery Pro i wyżej.",
                ],
              ],
            ),
            note(
              "Jeśli poprosisz o inteligentny optymalizator w planie, który go nie obejmuje, GeoCliks uruchomi standardowy, zamiast zgłosić błąd. Trasa i tak zostanie uporządkowana — sprawdź w historii trasy, który optymalizator zadziałał.",
            ),
            h("Co optymalizator respektuje"),
            ul(
              "Twój adres startowy oraz ustawienie „Powrót na start”, jeśli jest włączone.",
              "Minuty na przystanek ustawione przy przystanku albo domyślne dla trasy.",
              "Przystanki bez pozycji, które zachowują swoje miejsce na końcu listy.",
            ),
            see("delivery-routes/assign-a-driver", "troubleshoot/route-optimize-failed"),
          ],
        },
        {
          slug: "assign-a-driver",
          title: "Przypisz kierowcę",
          summary: "Przekaż trasę komuś ze swojej przestrzeni roboczej i rozpocznij dzień.",
          keywords: [
            "przypisz",
            "kierowca",
            "start",
            "status",
            "dyspozytor",
            "odepnij",
            "assign",
          ],
          body: [
            p(
              "Trasa musi do kogoś należeć, zanim można ją przejechać. Kierowca musi być członkiem Twojej przestrzeni roboczej — rola Field jest właściwa dla ekipy, która tylko jeździ i robi zdjęcia.",
            ),
            h("Przypisz ją"),
            steps(
              "Otwórz trasę.",
              "W polu „Kierowca” wybierz osobę.",
              "Trasa pojawia się w jej telefonie, na liście tras na tę datę.",
              "Rozpocznij trasę, gdy kierowca rusza, albo pozwól mu ją rozpocząć, zamykając pierwszy przystanek.",
            ),
            h("Status trasy"),
            table(
              ["Status", "Znaczenie"],
              [
                ["Szkic", "W budowie. Jeszcze bez kierowcy."],
                ["Przypisana", "Kierowca ją ma, jeszcze nie zaczął."],
                ["W trakcie", "Właśnie jest przejeżdżana."],
                ["Zakończona", "Każdy przystanek jest zamknięty."],
                ["Anulowana", "Odwołana. Przystanków nie można już zamykać."],
              ],
            ),
            h("Gdy zmienisz zdanie"),
            ul(
              "Odepnij trasę, aby wróciła do szkicu i przekaż ją komuś innemu.",
              "Kierowca, który sfotografuje pierwszą dostawę bez rozpoczynania trasy, i tak wprowadza ją w stan „W trakcie”.",
              "Anulowanie trasy blokuje zamykanie dalszych przystanków i zachowuje wszystko, co już zapisano.",
            ),
            note(
              "Twój plan określa, na ile kierowców przewidziana jest firma. Delivery Lite obejmuje dwóch, Pro pięciu, Fleet piętnastu, Fleet 30 trzydziestu, Fleet 200 dwustu, Fleet 500 pięciuset.",
            ),
            see(
              "delivery-routes/driver-run-and-proof-of-delivery",
              "teamspace/roles-and-permissions",
            ),
          ],
        },
        {
          slug: "live-dispatch",
          title: "Dyspozytorka na żywo",
          summary:
            "Wstaw zlecenie, które przyszło w środku zmiany, między pozostałe przystanki kierowcy.",
          keywords: [
            "dyspozytor",
            "na żywo",
            "dodaj przystanek",
            "w trakcie zmiany",
            "na żądanie",
            "wstaw",
            "dispatch",
          ],
          body: [
            p(
              "Tryb dyspozytorski jest dla pracy, która nie istnieje na początku dnia: telefon dzwoni o 14:00 i ktoś musi to wziąć. Dodajesz przystanek do trasy, która jest już przejeżdżana, a GeoCliks wstawia go w odpowiednie miejsce.",
            ),
            h("Dodaj przystanek na żywo"),
            steps(
              "Otwórz trasę w stanie „W trakcie”.",
              "Wybierz „Dodaj zlecenie teraz”.",
              "Wpisz adres dostawy i dane odbiorcy.",
              "Wybierz „Dodaj do trasy”. Przystanek trafia w tę część trasy, do której kierowca jeszcze nie dojechał, i pojawia się w jego telefonie.",
            ),
            h("Co nigdy się nie przesuwa"),
            ul(
              "Przystanki już dostarczone, nieudane albo pominięte.",
              "Przystanek, do którego kierowca właśnie jedzie.",
            ),
            p(
              "Nowy przystanek jest wstawiany w najtańszym miejscu pozostałej listy. To celowo nie jest ponowna optymalizacja: narzędzie, które przetasowuje plan pod jadącym kierowcą, zostaje porzucone przez ludzi, którzy z niego korzystają, a wielokrotna ponowna optymalizacja zabieganego wieczoru kosztowałaby Cię też pieniądze przy każdym przeliczeniu.",
            ),
            note(
              "Wstawianie działa lokalnie i jest bezpłatne, niezależnie od tego, ile razy zrobisz to w ciągu zmiany.",
            ),
            warn(
              "Dyspozytorka na żywo wymaga planu Delivery Pro lub wyższego. W planie tylko z trasami zaplanowanymi nadal możesz dodawać przystanki do trasy, zanim ta się rozpocznie.",
            ),
            see("delivery-routes/create-a-route", "plans-billing/delivery-plans"),
          ],
        },
      ],
    },
    {
      title: "W trasie",
      articles: [
        {
          slug: "driver-run-and-proof-of-delivery",
          title: "Przejazd kierowcy i dowód dostawy",
          summary: "Co widzi kierowca i jak przystanek zamyka się dowodem.",
          keywords: [
            "kierowca",
            "przejazd",
            "dowód",
            "zdjęcie",
            "podpis",
            "dostarczono",
            "offline",
            "driver",
          ],
          body: [
            p(
              "W telefonie kierowca dostaje jeden ekran: przystanek, na którym jest, adres, odbiorcę, ewentualne uwagi i to, ile przystanków zostało. Wszystko inne jest schowane.",
            ),
            h("Zamykanie przystanku"),
            steps(
              "Dotknij przystanku.",
              "Zrób zdjęcie dostawy — paczka pod drzwiami, paleta w doku, cokolwiek dowodzi, że dotarła.",
              "Potwierdź albo popraw nazwę odbiorcy.",
              "Zbierz podpis, jeśli trasa o niego prosi.",
              "Oznacz przystanek jako dostarczony. Pojawia się następny.",
            ),
            h("Zdjęcie nie jest opcjonalne"),
            p(
              "Przystanek dostarczony albo nieudany musi zostać zamknięty prawdziwym zdjęciem z Twojej przestrzeni roboczej. Nie da się oznaczyć przystanku jako dostarczonego bez załącznika — o to właśnie chodzi w używaniu GeoCliks do dostaw zamiast aplikacji z listą zadań.",
            ),
            h("Bez zasięgu"),
            ul(
              "Przejazd działa bez zasięgu. Zdjęcia i zamknięcia przystanków czekają w kolejce na urządzeniu.",
              "Zapisana godzina zamknięcia to moment zrobienia zdjęcia, a nie moment przesłania, więc trasa przejechana przez martwą strefę czyta się poprawnie.",
              "Jeśli kolejka opróżni się dwa razy, druga próba jest rozpoznawana i pomijana, a nie zamyka przystanku po raz drugi.",
            ),
            note(
              "Biuro widzi każde zamknięcie przystanku, gdy tylko dotrze, więc dyspozytor patrzący na trasę wie, gdzie jest kierowca, bez dzwonienia do niego.",
            ),
            see(
              "delivery-routes/failed-and-skipped-stops",
              "mobile-app/offline-capture-and-queue",
            ),
          ],
        },
        {
          slug: "failed-and-skipped-stops",
          title: "Przystanki nieudane i pominięte",
          summary:
            "Zapisz, dlaczego dostawa się nie odbyła, w sposób, na którym biuro może działać.",
          keywords: [
            "nieudany",
            "pominięty",
            "nikogo nie było",
            "odmowa",
            "błędny adres",
            "wyjątek",
            "failed",
          ],
          body: [
            p(
              "Nie każdy przystanek się udaje. Nieudany przystanek to nadal zamknięty przystanek z dowodem — to zapis, że kierowca tam pojechał i co zastał.",
            ),
            h("Oznacz przystanek jako nieudany"),
            steps(
              "Dotknij przystanku i zrób zdjęcie tego, co kierowca widzi — zamkniętych drzwi, zablokowanego wjazdu, złego budynku.",
              "Wybierz „Nieudany”.",
              "Wybierz powód.",
              "Dodaj uwagę, jeśli biuro musi coś wiedzieć.",
              "Zapisz.",
            ),
            h("Powody"),
            table(
              ["Powód", "Kiedy go użyć"],
              [
                ["Nikogo nie było", "Nie było nikogo, kto mógłby odebrać."],
                ["Odmowa przyjęcia", "Odbiorca nie chciał przyjąć przesyłki."],
                ["Błędny adres", "Adres nie zgadza się z odbiorcą."],
                ["Zamknięte", "Firma, która była zamknięta."],
                ["Brak dostępu", "Fizycznie nie dało się dojechać — brama, śnieg, budowa."],
                ["Inne", "Cokolwiek innego. Opisz to w uwadze."],
              ],
            ),
            h("Pominięcie zamiast tego"),
            p(
              "Pominięcie to co innego: kierowca zgłasza, że nie było tu w ogóle czego dostarczać. To jedyne zamknięcie, które nie wymaga zdjęcia, i jest zapisywane jako pominięcie, aby biuro czytało w historii dokładnie to, a nie niepowodzenie, którego nie było.",
            ),
            warn(
              "Nieudany przystanek nigdy nie wysyła odbiorcy e-maila z dowodem dostawy. Takie sprawy biuro prowadzi ręcznie, bo radosne „Twoja przesyłka dotarła” przy nieudanej dostawie jest gorsze niż brak wiadomości.",
            ),
            note(
              "Każde zamknięcie, niepowodzenie i pominięcie zapisuje się w historii trasy razem z tym, kto i kiedy to zrobił, a historii nie da się edytować.",
            ),
            see(
              "delivery-routes/tracking-links-and-notifications",
              "delivery-routes/driver-run-and-proof-of-delivery",
            ),
          ],
        },
        {
          slug: "tracking-links-and-notifications",
          title: "Linki do śledzenia i e-maile do odbiorców",
          summary:
            "Trzy e-maile, które może dostać odbiorca, i dokładnie to, co pokazuje strona śledzenia.",
          keywords: [
            "śledzenie",
            "powiadomienie",
            "e-mail",
            "odbiorca",
            "przewidywana godzina",
            "link",
            "prywatność",
            "tracking",
          ],
          body: [
            p(
              "Odbiorcę, który ma adres e-mail przy swoim przystanku, można informować automatycznie. Sterujesz tym osobno dla każdej trasy, a odbiorca bez adresu e-mail po prostu nigdy nie jest kontaktowany.",
            ),
            h("Trzy e-maile"),
            table(
              ["E-mail", "Kiedy wychodzi"],
              [
                ["W drodze", "Trasa się rozpoczęła i kierowca jest w drodze."],
                ["Jesteś następny", "Kierowca jest o ustaloną liczbę dostaw dalej."],
                [
                  "Dostarczono",
                  "Przystanek został zamknięty. Zawiera zdjęcie jako dowód i jego kod.",
                ],
              ],
            ),
            h("Ustawienia"),
            ul(
              "Włącz lub wyłącz dla trasy e-mail z zapowiedzią.",
              "Ustaw, ile przystanków wcześniej wychodzi — jeden daje mało czasu, pięć daje szerokie okno.",
              "Włącz lub wyłącz e-mail z dowodem dostawy.",
            ),
            h("Co pokazuje strona śledzenia"),
            p(
              "Każdy e-mail prowadzi do strony śledzenia tego jednego przystanku, dostępnej przez link, którego nie da się odgadnąć. Odbiorca widzi nazwę Twojej firmy, własny adres, ile dostaw jest jeszcze przed jego, a po zamknięciu przystanku — zdjęcie jako dowód wraz ze zweryfikowaną godziną i lokalizacją.",
            ),
            h("Czego celowo nie pokazuje"),
            ul(
              "Żadnego innego przystanku, adresu ani odbiorcy z trasy.",
              "Nazwiska kierowcy, jego telefonu ani pozycji na żywo.",
              "Nazwy trasy ani łącznej liczby przystanków — co pozwoliłoby konkurencji rozrysować Twój obchód.",
            ),
            note(
              "Każdy odbiorca dostaje każdy e-mail najwyżej raz, a postęp kierowcy jest sprawdzany ponownie bezpośrednio przed wysłaniem, więc nikt nie dostaje „jesteś następny” dla przystanku, który właśnie dostarczono.",
            ),
            warn(
              "E-maile do odbiorców wychodzą tylko wtedy, gdy dla Twojej przestrzeni roboczej skonfigurowano wysyłanie poczty. Jeśli odbiorcy zgłaszają, że nic nie dostają, to pierwsza rzecz do sprawdzenia.",
            ),
            see(
              "delivery-routes/failed-and-skipped-stops",
              "troubleshoot/notifications-not-arriving",
            ),
          ],
        },
      ],
    },
  ],
};
