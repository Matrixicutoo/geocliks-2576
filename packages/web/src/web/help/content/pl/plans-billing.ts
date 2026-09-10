import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const plansBilling: Category = {
  slug: "plans-billing",
  title: "Plany i rozliczenia",
  summary: "Co obejmuje każdy plan, jak go zmienić i gdzie znaleźć fakturę.",
  icon: "CreditCard",
  sections: [
    {
      title: "Wybór planu",
      articles: [
        {
          slug: "compare-plans",
          title: "Porównanie planów",
          summary: "Co dostajesz w planach Free, Plus, Business, Crew 10, Crew 25 i Enterprise.",
          keywords: [
            "plany",
            "cennik",
            "porównanie",
            "free",
            "plus",
            "business",
            "crew",
            "limity",
          ],
          body: [
            p(
              "Istnieją dwie rodziny planów. Opisane niżej plany dowodowe służą do dokumentowania pracy. Plany Delivery są dla działalności opartej głównie na jeździe i mają własny artykuł.",
            ),
            p(
              "Aktualne ceny znajdziesz w sekcji cennika na geocliks.com. Ta strona opisuje, na co każdy plan faktycznie pozwala — bo to właśnie ta część zaskakuje ludzi najczęściej.",
            ),
            h("Plany dowodowe"),
            table(
              ["Plan", "Dla kogo", "Stanowiska"],
              [
                ["Free", "Wypróbowanie produktu albo okazjonalna dokumentacja w pojedynkę.", "1"],
                ["Plus", "Jedna osoba pracująca na pełen etat i udostępniająca materiały klientom.", "1"],
                ["Business", "Mała ekipa ze wspólną przestrzenią zespołu.", "5"],
                ["Crew 10", "Rosnący zespół.", "10"],
                ["Crew 25", "Większa organizacja.", "25"],
                ["Enterprise", "Indywidualne wolumeny i warunki. Porozmawiaj z nami.", "Indywidualnie"],
              ],
            ),
            h("Co zmienia się wraz z wyższym planem"),
            table(
              ["Funkcja", "Od którego planu"],
              [
                ["Zweryfikowane ujęcia, znaki wodne, kody zdjęć", "Free"],
                ["Nielimitowane ujęcia miesięcznie", "Plus"],
                ["Eksport do Excela, ZIP i KMZ", "Plus"],
                ["Linki do udostępniania", "Plus"],
                ["Nielimitowane projekty i szablony znaków wodnych", "Plus"],
                ["Twoje logo na znakach wodnych", "Plus"],
                ["Filmy pełnej długości", "Plus"],
                ["Przestrzeń zespołu z zaproszonymi członkami", "Business"],
                ["Role i dostęp do wybranych projektów", "Business"],
              ],
            ),
            h("Plan Free w szczegółach"),
            ul(
              "300 ujęć miesięcznie.",
              "Wideo ograniczone do 30-sekundowych klipów i tylko przez pierwsze trzy dni.",
              "Trzy projekty, jedno stanowisko, dwa szablony znaków wodnych.",
              "Eksport PDF do 20 zdjęć. Bez Excela, ZIP-a i KMZ.",
              "Brak przestrzeni zespołu, więc brak zaproszonych członków i linków do udostępniania.",
              "Brak tras dostaw.",
            ),
            note(
              "Każdy plan, łącznie z Free, daje tę samą weryfikację: te same dane znaku wodnego, ten sam kod zdjęcia, tę samą pieczęć. Weryfikacja nie jest płatnym dodatkiem.",
            ),
            h("Dostawy w planach dowodowych"),
            p(
              "Plus i wyższe zawierają miesięczny limit przystanków, więc możesz prowadzić trasy bez przechodzenia na plan Delivery: skromny limit w Plus, większy w Business i stopniowo większe w Crew 10 oraz Crew 25. Jeśli jeździsz codziennie, plany Delivery wychodzą taniej w przeliczeniu na przystanek.",
            ),
            see("plans-billing/delivery-plans", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "delivery-plans",
          title: "Plany Delivery",
          summary:
            "Delivery Lite, Pro, Fleet, Fleet 30, Fleet 200 i Fleet 500 — dobierane według liczby przystanków miesięcznie i kierowców.",
          keywords: [
            "dostawy",
            "lite",
            "pro",
            "fleet",
            "przystanki",
            "kierowcy",
            "dyspozytornia",
          ],
          body: [
            p(
              "Plany Delivery są dla firm, w których jeżdżenie jest istotą działalności, a nie jej skutkiem ubocznym. Zawierają wszystko to, co plany dowodowe, plus znacznie większy miesięczny limit przystanków.",
            ),
            table(
              ["Plan", "Przystanki miesięcznie", "Kierowcy", "Dyspozytornia na żywo", "Inteligentny optymalizator"],
              [
                ["Delivery Lite", "500", "2", "Nie", "Nie"],
                ["Delivery Pro", "2000", "5", "Tak", "Tak"],
                ["Delivery Fleet", "6000", "15", "Tak", "Tak"],
                ["Delivery Fleet 30", "12 000", "30", "Tak", "Tak"],
                ["Delivery Fleet 200", "80 000", "200", "Tak", "Tak"],
                ["Delivery Fleet 500", "200 000", "500", "Tak", "Tak"],
              ],
            ),
            h("Czym są te dwie funkcje z ograniczeniem"),
            ul(
              "Dyspozytornia na żywo — dodawanie przystanków do trasy, która jest już realizowana. Pro, Fleet, Fleet 30, Fleet 200 i Fleet 500.",
              "Inteligentny optymalizator — układanie kolejności trasy na podstawie sieci drogowej zamiast standardowego solvera. Pro, Fleet, Fleet 30, Fleet 200 i Fleet 500. W planach bez niego działa standardowy optymalizator, więc i tak otrzymujesz uporządkowaną trasę.",
            ),
            h("Jak go kupić"),
            p(
              "Każdy plan Delivery kupisz samodzielnie na stronie planu: wybierz plan, przejdź przez bezpieczną płatność i podaj dane karty. Nowe limity zaczynają obowiązywać od razu po zakończeniu. Plan Delivery startuje z bezpłatnym okresem próbnym, więc jego przycisk to „Bezpłatny okres próbny”. Jeśli Twoja przestrzeń robocza jest już na planie Delivery, przejście na inny obciąża kartę od razu, a przycisk brzmi „Przejdź na” — okres próbny przysługuje raz na przestrzeń roboczą, a nie raz na plan.",
            ),
            steps(
              "Otwórz Plan w ustawieniach przestrzeni roboczej.",
              "Wybierz plan Delivery odpowiadający Twoim wolumenom.",
              "Dokończ płatność. Wracasz do GeoCliks z już aktywnym limitem przystanków.",
            ),
            warn(
              "Enterprise to jedyny plan niedostępny samoobsługowo. Jego karta pokazuje „Skontaktuj się” zamiast przycisku płatności i otwiera wypełniony e-mail na sales@geocliks.com. Nikt nie jest obciążany automatycznie i nic nie zmienia się w Twojej przestrzeni roboczej, dopóki nie ustawimy tego razem z Tobą.",
            ),
            note(
              "Tylko właściciel przestrzeni roboczej może zmienić plan. Administratorzy zarządzają ludźmi, a nie subskrypcją.",
            ),
            h("Który pasuje"),
            p(
              "Policz przystanki, które faktycznie obsługujesz w normalnym miesiącu, i dodaj trochę zapasu na najbardziej pracowity tydzień. Przekroczenie limitu wstrzymuje tworzenie tras do następnego miesiąca, więc plan powinien pokrywać Twój szczyt, a nie średnią.",
            ),
            note(
              "Przystanki liczone są w miesiącach kalendarzowych i zerują się pierwszego dnia miesiąca. Przystanek liczy się w chwili dodania do trasy, niezależnie od tego, czy ostatecznie zostanie dostarczony.",
            ),
            see("delivery-routes/delivery-overview", "plans-billing/compare-plans"),
          ],
        },
      ],
    },
    {
      title: "Zarządzanie subskrypcją",
      articles: [
        {
          slug: "upgrade-or-change-plan",
          title: "Ulepsz lub zmień plan",
          summary: "Zmiana planu na stronie planu — robi to właściciel.",
          keywords: [
            "ulepszenie",
            "zmiana planu",
            "płatność",
            "obniżenie planu",
            "przełączenie",
          ],
          body: [
            p(
              "Plany zmienia się w sekcji Plan w ustawieniach przestrzeni roboczej. Może to zrobić wyłącznie właściciel przestrzeni — administratorzy zarządzają ludźmi, a nie subskrypcją.",
            ),
            h("Zmiana planu"),
            steps(
              "Otwórz Plan.",
              "Wybierz plan, który Cię interesuje.",
              "W przypadku samoobsługowego planu płatnego trafiasz do bezpiecznej płatności, żeby podać dane karty, i wracasz do GeoCliks po jej zakończeniu.",
              "W przypadku Enterprise dostajesz zamiast tego wypełniony e-mail do naszego zespołu.",
              "Nowe limity obowiązują od chwili wprowadzenia zmiany.",
            ),
            h("Przejście na większy plan"),
            ul(
              "Nowe limity działają natychmiast.",
              "Nic z tego, co już uchwyciłeś, nie zostaje naruszone.",
              "Dodatkowe stanowiska stają się dostępne od razu, więc możesz zapraszać ludzi zaraz po zmianie.",
            ),
            h("Przejście na niższy plan"),
            p(
              "Obniżenie planu jest odrzucane, dopóki Twoja przestrzeń robocza jest większa niż plan docelowy. Jeśli masz ośmiu członków i przechodzisz na plan z pięcioma stanowiskami, zostaniesz poproszony o usunięcie części osób. Jest to zamierzone — alternatywą byłoby ciche odcięcie trzech osób.",
            ),
            note(
              "Wybranie planu Free albo ponowne wybranie planu, na którym już jesteś, w ogóle nie przechodzi przez płatność.",
            ),
            see("plans-billing/seats-and-billing", "plans-billing/cancel-or-downgrade"),
          ],
        },
        {
          slug: "seats-and-billing",
          title: "Stanowiska",
          summary: "Czym jest stanowisko, co je zajmuje i co zrobić, gdy się skończą.",
          keywords: [
            "stanowiska",
            "członkowie",
            "zaproszenie",
            "limit",
            "pojemność",
            "użytkownicy",
          ],
          body: [
            p(
              "Stanowisko to jedna osoba, która może zalogować się do Twojej przestrzeni roboczej. Twój plan zawiera ich określoną liczbę, a właściciel liczy się jako jedno z nich.",
            ),
            h("Co zajmuje stanowisko"),
            ul(
              "Każdy członek przestrzeni roboczej, niezależnie od roli. Członek terenowy kosztuje takie samo stanowisko jak administrator.",
              "Każde oczekujące zaproszenie, dopóki nie zostanie przyjęte lub unieważnione.",
            ),
            p(
              "Oczekujące zaproszenia celowo blokują stanowisko. Inaczej można by wysłać dziesięć zaproszeń przy dwóch stanowiskach i każdy, kto by je przyjął, wykraczałby poza plan.",
            ),
            h("Brak wolnych stanowisk"),
            steps(
              "Otwórz Zespół i przejrzyj oczekujące zaproszenia. Unieważnij te, które nie zostaną przyjęte.",
              "Usuń członków, którzy odeszli. Ich ujęcia i historia zostają w przestrzeni roboczej.",
              "Jeśli naprawdę potrzebujesz więcej osób, przejdź na wyższy plan.",
            ),
            note(
              "Usunięcie członka zwalnia jego stanowisko natychmiast i nigdy nie kasuje jego pracy.",
            ),
            see("teamspace/invite-your-crew", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "payment-and-invoices",
          title: "Płatności i faktury",
          summary: "Gdzie przechowywane są dane karty, jak je zmienić i skąd wziąć potwierdzenie.",
          keywords: [
            "faktura",
            "potwierdzenie",
            "karta",
            "płatność",
            "vat",
            "podatek",
            "panel rozliczeń",
          ],
          body: [
            p(
              "Płatnościami zajmuje się nasz operator płatności, a nie GeoCliks. Numer Twojej karty nigdy nie jest przechowywany na naszych serwerach.",
            ),
            h("Zmiana karty"),
            steps(
              "Otwórz Plan w ustawieniach przestrzeni roboczej.",
              "Otwórz panel rozliczeń.",
              "Zaktualizuj tam metodę płatności.",
            ),
            h("Faktury i potwierdzenia"),
            ul(
              "Każda płatność generuje fakturę dostępną w panelu rozliczeń.",
              "Faktury wysyłane są na adres rozliczeniowy przypisany do subskrypcji, który nie zawsze jest adresem logowania właściciela — sprawdź go, jeśli potwierdzenia trafiają do niewłaściwej osoby.",
              "Dodaj w panelu nazwę firmy i dane podatkowe, a pojawią się na przyszłych fakturach.",
            ),
            h("Nieudana płatność"),
            p(
              "Operator ponawia nieudaną płatność, zanim cokolwiek zmieni się w Twojej przestrzeni roboczej. Jeśli płatność nadal się nie udaje, przestrzeń spada do limitów planu Free — Twoje ujęcia nie są usuwane, ale eksport, linki do udostępniania i przestrzeń zespołu przestają działać do czasu udanej płatności.",
            ),
            warn(
              "Jeśli Twoja przestrzeń robocza jest na planie, który ustawiliśmy dla Ciebie ręcznie, panel samoobsługowy może nie istnieć. Napisz na support@geocliks.com, a zajmiemy się fakturą.",
            ),
            see("plans-billing/cancel-or-downgrade", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "cancel-or-downgrade",
          title: "Anulowanie lub obniżenie planu",
          summary: "Jak przestać płacić i co dokładnie dzieje się z Twoim materiałem dowodowym.",
          keywords: [
            "anulowanie",
            "obniżenie planu",
            "usunięcie",
            "zwrot",
            "eksport",
            "odejście",
            "dane",
          ],
          body: [
            p(
              "Możesz przestać płacić, kiedy tylko chcesz. Ważniejsze pytanie brzmi, co dzieje się z pracą — więc mówimy to wprost.",
            ),
            h("Anulowanie"),
            steps(
              "Najpierw wyeksportuj wszystko, czego będziesz potrzebować poza GeoCliks. Zrób to przed anulowaniem, bo formaty eksportu są ograniczone w planie Free.",
              "Zmniejsz przestrzeń roboczą tak, by mieściła się w planie docelowym, jeśli przechodzisz na mniejszą liczbę stanowisk.",
              "Otwórz Plan i przejdź na plan Free albo anuluj subskrypcję w panelu rozliczeń.",
            ),
            h("Co dzieje się z Twoimi danymi"),
            ul(
              "Twoje ujęcia nie są usuwane przy obniżeniu planu ani anulowaniu.",
              "Weryfikacja działa dalej. Kody zdjęć nadal się rozwiązują, a pieczęcie nadal się zgadzają.",
              "Płatne funkcje przestają działać: eksport do Excela, ZIP i KMZ, linki do udostępniania, przestrzeń zespołu i trasy dostaw.",
              "Istniejące linki do udostępniania przestają działać na czas, gdy Twój plan ich nie obejmuje.",
              "Członkowie ponad nową liczbę stanowisk tracą dostęp — dlatego obniżenie planu prosi o wcześniejsze ich usunięcie.",
            ),
            warn(
              "Eksportuj przed anulowaniem, a nie po. W planie Free jesteś ograniczony do PDF-a z maksymalnie 20 zdjęciami, co nie jest sposobem na wyciągnięcie rocznej pracy.",
            ),
            h("Całkowite usunięcie przestrzeni roboczej"),
            p(
              "Anulowanie to nie usunięcie. Jeśli chcesz, by przestrzeń robocza i jej materiały zniknęły na dobre, napisz na support@geocliks.com z adresu właściciela i poproś o usunięcie. Nie da się tego cofnąć i potwierdzimy prośbę przed wykonaniem.",
            ),
            see("legal/data-retention", "teamspace/reports-and-exports"),
          ],
        },
      ],
    },
  ],
};
