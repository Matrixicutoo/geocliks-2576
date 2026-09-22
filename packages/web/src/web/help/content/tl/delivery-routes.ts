import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const deliveryRoutes: Category = {
  slug: "delivery-routes",
  title: "Mga Ruta ng Delivery",
  summary:
    "Planuhin ang araw ng driver, ipadala siya, at isara ang bawat hinto sa litrato ng patunay na kita ng tatanggap.",
  icon: "Route",
  sections: [
    {
      title: "Planuhin ang araw",
      articles: [
        {
          slug: "delivery-overview",
          title: "Paano gumagana ang Delivery",
          summary:
            "Ang anyo ng araw ng delivery sa GeoCliks: bumuo ng ruta, mag-assign ng driver, isara ang bawat hinto sa ebidensya.",
          keywords: [
            "delivery",
            "ruta",
            "dispatch",
            "driver",
            "patunay ng delivery",
            "pod",
            "routes",
            "proof of delivery",
          ],
          body: [
            p(
              "Kinukuha ng Mga Ruta ng Delivery ang parehong ideya ng litratong beripikado at ikinakapit ito sa araw ng isang driver. Bumubuo ka ng listahan ng hinto sa opisina, iniaabot mo iyon sa driver, at isinasara ng driver ang bawat hinto sa pagkuha ng litrato ng inihatid. Dala ng litrato ang beripikadong oras, posisyon sa GPS at address, kaya may sagot ang anumang pagtatalo tungkol sa delivery.",
            ),
            h("Ang araw, mula simula hanggang dulo"),
            steps(
              "Gumagawa ang opisina ng ruta para sa isang petsa at ipinapaste ang mga address ng araw.",
              "Ni-resolve ng GeoCliks ang mga address tungo sa posisyon sa mapa, at inaayos mo ang hindi nito mailagay.",
              "Sinusunod-sunod mo ang mga hinto, kamay man o sa optimizer.",
              "Ina-assign mo ang ruta sa driver, na nakikita iyon sa telepono niya.",
              "Sinusundan ng driver ang listahan, kinukuhanan ng litrato ang bawat inihatid.",
              "Nakakakuha ang mga tatanggap na may email address ng mensaheng patunay ng delivery kasama ang litrato.",
              "Pinapanood ng opisina ang pagsara ng ruta sa totoong oras at iniingatan ang audit trail.",
            ),
            h("Dalawang uri ng ruta"),
            table(
              ["Mode", "Gamitin kapag"],
              [
                [
                  "Planned",
                  "Alam mo nang buo ang araw bago pa magsimula. Buuin, i-optimize, ipadala.",
                ],
                [
                  "Dispatch",
                  "Dumarating ang order sa gitna ng shift at isinisingit sa natitirang hinto ng driver.",
                ],
              ],
            ),
            h("Nagtatapos ang bawat hinto sa isa sa apat na estado"),
            ul(
              "Delivered — nasara kasama ang litrato ng patunay.",
              "Failed — hindi naideliver ng driver, may dahilan at litrato.",
              "Skipped — walang idi-deliver dito. Ito lang ang pagsara na walang litrato.",
              "Pending — hindi pa naabot.",
            ),
            note(
              "Hiwalay na kakayahan ang Delivery sa pagkuha ng ebidensya. Mula sa plano mo ang alawans ng hintong padeliver kada buwan, at umiiral ang Delivery Lite, Pro, Fleet, Fleet 30, Fleet 200 at Fleet 500 na plano para sa operasyong halos pagmamaneho lang.",
            ),
            see("delivery-routes/create-a-route", "plans-billing/delivery-plans"),
          ],
        },
        {
          slug: "create-a-route",
          title: "Gumawa ng ruta",
          summary:
            "Itakda ang petsa, ang depot, ang oras ng simula at gaano katagal karaniwang tumatagal ang isang hinto.",
          keywords: [
            "bagong ruta",
            "gumawa",
            "depot",
            "oras ng simula",
            "oras ng serbisyo",
            "lagda",
            "new route",
            "start time",
            "service time",
            "signature",
          ],
          body: [
            p(
              "Ang ruta ay trabaho ng isang driver para sa isang petsa. Gawin mo iyon muna, pagkatapos ay punuin ng hinto.",
            ),
            h("Gawin ito"),
            steps(
              "Buksan ang Mga ruta at piliin ang New route.",
              'Pangalanan ito ng makikilala ng dispatcher sa abalang umaga — mas mabuti ang "Martes sa hilaga" kaysa "Ruta 4".',
              "Itakda ang petsa.",
              "Piliin ang Planned o Dispatch mode.",
              "Kung gusto mo, iugnay ito sa proyekto, para dumaong ang litrato ng delivery kasama ang ebidensya ng trabahong iyon.",
              "Ilagay ang address ng simula — karaniwan ang depot o bakuran mo.",
              "I-save.",
            ),
            h("Ang mga setting na humuhubog sa plano"),
            table(
              ["Setting", "Ano ang ginagawa nito"],
              [
                [
                  "Address ng simula",
                  "Kung saan nagsisimula ang araw. Mula rito palabas nagpaplano ang optimizer.",
                ],
                ["Return to start", "Isama sa plano ang pagbalik pauwi sa depot."],
                ["Oras ng simula", "Kailan umaalis ang driver. Nakatakda sa 08:00."],
                [
                  "Oras ng serbisyo",
                  "Minutong gugugol sa karaniwang hinto. Nakatakda sa 5. Ito ang nagtutulak ng tantiya ng pagdating.",
                ],
                ["Require signature", "Humingi sa driver ng lagda bukod sa litrato."],
              ],
            ),
            h("Sulit na maitama ang oras ng serbisyo"),
            p(
              "Ang oras ng serbisyo ang pinagbabatayan ng tantiyang pagdating sa lahat ng susunod na hinto. Bagay ang limang minuto sa parcel na inilalapag sa pintuan. Ang hintong may pagbababa ng pallet ay malapit sa dalawampu, at maaari mong palitan ang oras ng serbisyo sa mga hintong alam mong mabagal.",
            ),
            note(
              "Kailangan ng manager role o mas mataas para makagawa ng ruta. Hindi ang mga driver ang bumubuo ng sarili nilang ruta.",
            ),
            warn(
              "Kailangan ng Dispatch mode ang Delivery Pro o mas mataas. Kung planned route lang ang saklaw ng plano mo, sasabihin sa iyo kapag pinili mo ang mode, hindi pagkatapos mong buuin ang araw.",
            ),
            see("delivery-routes/add-stops-by-pasting-a-list", "delivery-routes/live-dispatch"),
          ],
        },
        {
          slug: "add-stops-by-pasting-a-list",
          title: "Magdagdag ng hinto sa pagpaste ng listahan o pag-upload ng CSV",
          summary:
            "I-paste ang isang column ng spreadsheet, isang email mula sa kostumer, o mag-upload ng CSV — binabasa ng GeoCliks ang mga column sa alinmang paraan.",
          keywords: [
            "hinto",
            "paste",
            "import",
            "upload",
            "file",
            "spreadsheet",
            "csv",
            "maramihan",
            "address",
            "stops",
            "bulk",
            "addresses",
          ],
          body: [
            p(
              "Dalawa ang pasukan ng hinto: ipaste ang mga address, o mag-upload ng CSV file. Pareho silang dumadaong sa parehong kahon at dumadaan sa parehong mambabasa, kaya lahat ng nasa ibaba ay bagay sa dalawa. Hindi kailangang i-format muli ang listahan.",
            ),
            h("I-paste ang listahan"),
            steps(
              "Buksan ang ruta at hanapin ang kahong Add stops.",
              "I-paste ang bloke. Isang hinto kada linya.",
              "Basahin ang buod sa itaas ng kahon: ilang hinto ang nahanap nito, anong separator ang ginamit nito, anong mga column ang nakilala nito, at ilang linya ang ibinagsak nito.",
              "Ayusin ang anumang mukhang mali sa pinagmulan at i-paste muli, o idagdag ang mga hinto at i-edit isa-isa.",
              "Piliin ang Add stops.",
            ),
            h("Mag-upload ng CSV"),
            steps(
              "I-export ang listahan mula sa spreadsheet o sistema ng order mo bilang CSV.",
              "Buksan ang ruta at hanapin ang kahong Add stops.",
              "Piliin ang Upload a CSV at piliin ang file.",
              "Bumabagsak ang nilalaman ng file sa kahon, kung saan mababasa mo ang buod at ma-e-edit ang alinmang linya bago pa may magawa.",
              "Piliin ang Add stops.",
            ),
            note(
              "Hindi gumagawa ng hinto ang pag-upload sa sarili nito — pinupuno nito ang kahon. Walang naidadagdag sa ruta hanggang hindi mo pinili ang Add stops, kaya walang gastos sa iyo ang maling file. Dapat CSV o plain text ang file at mas mababa sa 1 MB.",
            ),
            h("Ano ang nauunawaan ng parser"),
            ul(
              "Hinati ng tab, kuwit o semicolon. Natutukoy nito kung alin ang ginamit mo.",
              "Naka-quote na field, kaya nananatiling isang address ang address na may kuwit sa loob ng quote.",
              "Header row, kung meron. Itinutugma na ang mga column ayon sa pangalan sa anumang pagkakasunod.",
              "Pangalan ng header sa Ingles, Pranses, Portuges o Aleman — address/adresse/endereço/Adresse, name/nom/nome/Empfänger, email/courriel/e-mail, phone/téléphone/telefone/Telefon, reference/commande/pedido/Referenz, notes/remarques/observações/Notizen. Opsyonal ang tuldik, kaya gumagana rin ang endereco, observacoes at Empfaenger.",
              "Address na hinati sa iba't ibang column ng spreadsheet — kalye, lungsod, probinsya, postal code — pinagdudugtong pabalik sa isang linya.",
              "Email address at numero ng telepono na nahuhuli sa hubog nila, kahit walang header row.",
            ),
            h("Mga field kada hinto"),
            table(
              ["Field", "Bakit mahalaga"],
              [
                ["Address", "Kailangan. Opsyonal ang lahat ng iba."],
                [
                  "Pangalan ng tatanggap",
                  "Ipinapakita sa driver at ginagamit sa email ng patunay.",
                ],
                [
                  "Email ng tatanggap",
                  "Kung wala ito, walang tracking o email ng patunay ang tatanggap na iyon.",
                ],
                ["Telepono ng tatanggap", "Para makatawag muna ang driver."],
                ["Reference", "Ang numero ng order, invoice o tracking mo. Mahahanap."],
                ["Notes", "Code ng gate, numero ng buzzer, saan ilalapag."],
                ["Time window", "Pinakamaaga at pinakahuling tanggap na pagdating."],
                [
                  "Oras ng serbisyo",
                  "Palitan ang default ng ruta para sa hintong alam mong mabagal.",
                ],
              ],
            ),
            h("Bakit hindi kailanman itinatrato ang postal code bilang pangalan"),
            p(
              'Ang listahang Canadian na naipaste bilang "12 Main St, Moncton NB, E1A 4H2" ay dating gumagawa ng tatanggap na E1A 4H2. Nakikilala na ngayon ng parser ang mga salitang pangkalye, code ng probinsya at hubog ng postal code at ZIP, at pinuputol lang nito ang huling field bilang pangalan ng tao kapag talagang mukha itong pangalan.',
            ),
            note(
              "Makakadagdag ka ng hanggang 300 hinto sa isang paste. Para sa mas malaking araw, ipaste ito nang pahati-hati — idinudugtong sila sa parehong ruta.",
            ),
            warn(
              "Nabibilang ang bawat hinto sa buwanang alawans mo ng delivery. Kung ang isang paste ay magdadala sa iyo lampas sa hangganan ng plano, tinatanggihan ito nang buo, kaya hindi ka kailanman mauuwi sa kalahating ruta.",
            ),
            see("delivery-routes/geocoding-and-fixing-addresses", "plans-billing/delivery-plans"),
          ],
        },
        {
          slug: "geocoding-and-fixing-addresses",
          title: "Pag-resolve ng address at pag-ayos ng masama",
          summary:
            "Gawing posisyon sa mapa ang mga nakasulat na address, at maglapag ng pin sa kamay kapag hindi mahanap ang isa.",
          keywords: [
            "geocode",
            "address",
            "pin",
            "koordinada",
            "nabigo",
            "resolve",
            "mapa",
            "coordinates",
            "failed",
            "map",
          ],
          body: [
            p(
              "Teksto lang ang naipasteng address. Bago masunod-sunod o matiyempo ang isang ruta, kailangan ng bawat hinto ng posisyon sa mapa. Tinatawag na pag-resolve ang hakbang na iyon, at mula sa ruta mo iyon pinapatakbo.",
            ),
            h("I-resolve ang mga hinto"),
            steps(
              "Buksan ang ruta.",
              "Piliin ang Resolve addresses. Ang mga hintong hindi pa nare-resolve lang ang pinoproseso.",
              "Basahin ang resulta: ilan ang nailagay at ilan ang nabigo.",
              "Harapin ang mga nabigo bago ka mag-optimize.",
            ),
            h("May resolve status ang bawat hinto"),
            table(
              ["Status", "Kahulugan"],
              [
                ["Pending", "Hindi pa hinanap."],
                ["OK", "Nailagay sa mapa, may pinalinis na address."],
                ["Failed", "Hindi mahanap. Kailangan ng tulong mo."],
                [
                  "Manual",
                  "Ikaw ang naglapag ng pin. Hindi kailanman sinusulatan ng muling pag-resolve.",
                ],
              ],
            ),
            h("Pag-ayos ng nabigong hinto"),
            ul(
              "I-edit ang address at i-resolve muli — karaniwang dahilan ang nawawalang lungsod o probinsya.",
              "O buksan ang mapa at ilapag mo mismo ang pin sa tamang puwesto. Nagiging Manual ang hinto at itinatrato bilang nailagay.",
              "Ang manual na pin ang sagot sa bagong subdivision, sa ari-arian sa bukid o sa lugar na walang civic address.",
            ),
            h("Muling pag-resolve"),
            p(
              "Hinahanap muli ng sapilitang muling pag-resolve ang bawat hinto, pati ang mga OK na. Sadyang hindi nito ginagalaw ang manual na pin, dahil mas mabuting impormasyon ang pinlapag ng kamay kaysa anumang ibabalik ng paghahanap.",
            ),
            note(
              'Nakahilig sa Canada ang paghahanap ng address, kaya nare-resolve ang maikling address na "12 Main St, Moncton" nang hindi mo binabaybay ang bansa.',
            ),
            warn(
              "Hindi kayang sunod-sunurin ng optimizer ang mga hintong walang posisyon. Ipinaparada sila sa dulo ng ruta kaysa ibagsak, kaya tingnan ang buntot ng listahan mo bago mo palabasin ang driver.",
            ),
            see("delivery-routes/optimize-stop-order", "troubleshoot/gps-or-address-wrong"),
          ],
        },
      ],
    },
    {
      title: "Ipadala ito",
      articles: [
        {
          slug: "optimize-stop-order",
          title: "Sunod-sunurin ang mga hinto",
          summary:
            "Muling isunod-sunod sa kamay, o hayaang ang optimizer ang tumukoy ng sunod-sunod sa pagmamaneho para sa iyo.",
          keywords: [
            "optimize",
            "sunod-sunod",
            "pagkakasunod",
            "muling isunod-sunod",
            "pinakamaikli",
            "pagpaplano ng ruta",
            "order",
            "sequence",
            "route planning",
          ],
          body: [
            p(
              "Nagsisimula ang mga hinto sa pagkakasunod na idinagdag mo sila. Bihirang iyon ang pagkakasunod na gusto mong imaneho.",
            ),
            h("Sa kamay"),
            p(
              "Hilahin ang mga hinto sa pagkakasunod na gusto mo. Kapaki-pakinabang kapag mas kilala ng driver ang lugar kaysa anumang algoritmo, o kapag may kostumer na kailangang mauna.",
            ),
            h("Sa optimizer"),
            steps(
              "I-resolve muna ang mga address — hindi masusunod-sunod ang hintong walang posisyon.",
              "Piliin ang Optimize.",
              "Suriin ang resulta: ang bagong pagkakasunod, ang kabuuang distansya at ang tantiyang oras ng pagmamaneho.",
              "Ayusin sa kamay pagkatapos kung gusto mo. Mungkahi lang ang pag-optimize na kaya mong baliin.",
            ),
            h("Dalawang optimizer"),
            table(
              ["Optimizer", "Ano ang ginagawa nito"],
              [
                [
                  "Standard",
                  "Tumatakbo sa GeoCliks, walang panlabas na serbisyo, walang metering. Mabuting pagkakasunod para sa normal na araw.",
                ],
                [
                  "Smart",
                  "Gumagamit ng totoong datos ng network ng kalsada para sa mas masikip na pagkakasunod sa matao o pasikot-sikot na ruta. Delivery Pro at pataas.",
                ],
              ],
            ),
            note(
              "Kung hihingin mo ang smart optimizer sa planong hindi ito kasama, pinapatakbo ng GeoCliks ang standard kaysa mabigo. Nakakakuha pa rin ka ng nakasunod-sunod na ruta — tingnan sa kasaysayan ng ruta kung aling optimizer ang tumakbo.",
            ),
            h("Ano ang iginagalang ng optimizer"),
            ul(
              "Ang address ng simula mo, at ang setting na return-to-depot kung bukas ito.",
              "Ang oras ng serbisyo sa bawat hinto, o ang default ng ruta.",
              "Ang mga hintong walang posisyon, na pinapanatili ang puwesto nila sa dulo ng listahan.",
            ),
            see("delivery-routes/assign-a-driver", "troubleshoot/route-optimize-failed"),
          ],
        },
        {
          slug: "assign-a-driver",
          title: "Mag-assign ng driver",
          summary: "Iabot ang ruta sa isang tao sa workspace mo at simulan ang araw.",
          keywords: [
            "assign",
            "driver",
            "simulan",
            "status",
            "dispatch",
            "unassign",
            "start",
          ],
          body: [
            p(
              "Kailangang may nagmamay-ari sa isang ruta bago iyon maimaneho. Dapat miyembro ng workspace mo ang driver — ang Field role ang tama para sa crew na nagmamaneho at nangunguha lang.",
            ),
            h("I-assign ito"),
            steps(
              "Buksan ang ruta.",
              "Piliin ang Assign, at piliin ang driver.",
              "Lumilitaw ang ruta sa telepono niya sa ilalim ng mga ruta niya para sa petsang iyon.",
              "Piliin ang Start kapag umaalis na sila, o hayaang simulan ng driver iyon sa pagsara ng unang hinto niya.",
            ),
            h("Status ng ruta"),
            table(
              ["Status", "Kahulugan"],
              [
                ["Draft", "Binubuo. Wala pang driver."],
                ["Assigned", "May driver na, hindi pa nagsimula."],
                ["Active", "Minamaneho ngayon."],
                ["Completed", "Sarado na ang bawat hinto."],
                ["Cancelled", "Kinansela. Hindi na maisasara ang mga hinto."],
              ],
            ),
            h("Kapag nagbago ang isip mo"),
            ul(
              "I-unassign ang ruta para ibalik iyon sa draft at iabot sa iba.",
              "Ang driver na kumukuha ng litrato ng unang inihatid nang hindi tinatapik ang Start ay ginagawa pa ring aktibo ang ruta.",
              "Pinipigilan ng pagkansela ng ruta ang pagsara ng anumang karagdagang hinto laban doon, at iniingatan ang lahat ng naitala na.",
            ),
            note(
              "Ang plano mo ang nagtatakda kung ilang driver ang sinukat para sa operasyon. Dalawa ang saklaw ng Delivery Lite, lima ng Pro, labinlima ng Fleet, tatlumpu ng Fleet 30, dalawandaan ng Fleet 200, limandaan ng Fleet 500.",
            ),
            see(
              "delivery-routes/driver-run-and-proof-of-delivery",
              "teamspace/roles-and-permissions",
            ),
          ],
        },
        {
          slug: "live-dispatch",
          title: "Live dispatch",
          summary:
            "Isingit sa natitirang hinto ng driver ang order na dumating sa gitna ng shift.",
          keywords: [
            "dispatch",
            "live",
            "magdagdag ng hinto",
            "gitna ng shift",
            "on demand",
            "isingit",
            "add stop",
            "insert",
          ],
          body: [
            p(
              "Para sa trabahong wala pa noong nagsimula ang araw ang Dispatch mode: may tumatawag nang 14:00 at may kailangang humawak doon. Idinadagdag mo ang hinto sa rutang minamaneho na at isinisingit iyon ng GeoCliks.",
            ),
            h("Magdagdag ng live na hinto"),
            steps(
              "Buksan ang aktibong ruta.",
              "Piliin ang Add live stop.",
              "Ilagay ang address at ang detalye ng tatanggap.",
              "Kumpirmahin. Naisisingit ang hinto sa bahagi ng rutang hindi pa naabot ng driver, at lumilitaw iyon sa telepono niya.",
            ),
            h("Ano ang hindi kailanman gumagalaw"),
            ul(
              "Ang mga hintong nadeliver, nabigo o nalaktawan na.",
              "Ang hintong pinapatunguhan ng driver ngayon.",
            ),
            p(
              "Naisisingit ang bagong hinto sa pinakamurang puwesto sa natitirang listahan. Sadyang hindi ito muling pag-optimize: ang kasangkapang nagsasalansan muli ng plano sa ilalim ng gumagalaw na driver ay iniiwan ng mga taong gumagamit nito, at ang paulit-ulit na muling pag-optimize sa abalang gabi ay magagastos rin sa iyo sa bawat pagkuwenta.",
            ),
            note("Lokal na tumatakbo ang pagsingit at libre iyon, ilang beses man gawin sa shift."),
            warn(
              "Kailangan ng live dispatch ang Delivery Pro o mas mataas. Sa planong planned route lang, makakadagdag pa rin ka ng hinto sa ruta bago iyon magsimula.",
            ),
            see("delivery-routes/create-a-route", "plans-billing/delivery-plans"),
          ],
        },
      ],
    },
    {
      title: "Sa kalsada",
      articles: [
        {
          slug: "driver-run-and-proof-of-delivery",
          title: "Ang takbo ng driver at ang patunay ng delivery",
          summary: "Ano ang nakikita ng driver, at paano isinasara ang hinto sa ebidensya.",
          keywords: [
            "driver",
            "takbo",
            "patunay",
            "litrato",
            "lagda",
            "nadeliver",
            "offline",
            "run",
            "proof",
            "photo",
            "signature",
            "delivered",
          ],
          body: [
            p(
              "Sa telepono, isang screen ang nakukuha ng driver: ang hintong kinakasalukuyan niya, ang address, ang tatanggap, anumang nota, at ilang hinto ang natitira. Nasa tabi ang lahat ng iba.",
            ),
            h("Pagsara ng hinto"),
            steps(
              "Tapikin ang hinto.",
              "Kunin ang litrato ng delivery — ang parcel sa pintuan, ang pallet sa bay, anumang nagpapatunay na nakarating iyon.",
              "Kumpirmahin o itama ang pangalan ng tatanggap.",
              "Kumuha ng lagda, kung hinihingi iyon ng ruta.",
              "Markahan itong Delivered. Lumilitaw ang susunod na hinto.",
            ),
            h("Hindi opsyonal ang litrato"),
            p(
              "Dapat isara ang nadeliver o nabigong hinto sa totoong litrato mula sa workspace mo. Walang paraang markahan ang hinto bilang nadeliver nang walang nakakabit — iyon ang buong punto ng paggamit ng GeoCliks para sa delivery kaysa sa checklist app.",
            ),
            h("Offline"),
            ul(
              "Gumagana ang takbo kahit walang signal. Nakapila sa device ang mga litrato at pagsara ng hinto.",
              "Ang naitalang oras ng pagtapos ay kung kailan kinuha ang litrato, hindi kung kailan ito nag-upload, kaya tama pa ring nababasa ang rutang inimaneho sa patay na sona.",
              "Kung dalawang beses maubos ang pila, nakikilala at hindi pinapansin ang pangalawang pagtatangka kaysa doblehin ang pagsara ng hinto.",
            ),
            note(
              "Nakikita ng opisina ang bawat pagsara ng hinto habang dumadaong iyon, kaya alam ng dispatcher na nagmamatyag sa ruta kung nasaan ang driver nang hindi tinatawagan siya.",
            ),
            see(
              "delivery-routes/failed-and-skipped-stops",
              "mobile-app/offline-capture-and-queue",
            ),
          ],
        },
        {
          slug: "failed-and-skipped-stops",
          title: "Nabigo at nalaktawang hinto",
          summary:
            "Itala kung bakit hindi nangyari ang delivery, sa paraang kayang kilusan ng opisina.",
          keywords: [
            "nabigo",
            "nalaktawan",
            "walang tao",
            "tinanggihan",
            "maling address",
            "eksepsyon",
            "failed",
            "skipped",
            "nobody home",
            "refused",
            "wrong address",
          ],
          body: [
            p(
              "Hindi lahat ng hinto ay umaayos. Sarado pa ring hintong may ebidensya ang nabigong hinto — ito ang talang nakarating doon ang driver at ang kanyang nakita.",
            ),
            h("Markahan ang hinto bilang nabigo"),
            steps(
              "Tapikin ang hinto at kunan ng litrato ang tinitingnan ng driver — ang saradong pinto, ang baradong daan, ang maling gusali.",
              "Piliin ang Failed.",
              "Pumili ng dahilan.",
              "Magdagdag ng nota kung may kailangang malaman ang opisina.",
              "I-save.",
            ),
            h("Ang mga dahilan"),
            table(
              ["Dahilan", "Gamitin para sa"],
              [
                ["Nobody home", "Walang taong makakatanggap."],
                ["Refused", "Ayaw tanggapin ng tatanggap."],
                ["Wrong address", "Hindi tugma ang address sa tatanggap."],
                ["Closed", "Negosyong sarado."],
                [
                  "Inaccessible",
                  "Hindi pisikal na maabot — gate, niyebe, konstruksyon.",
                ],
                ["Other", "Anumang iba. Isulat iyon sa nota."],
              ],
            ),
            h("Ang paglaktaw naman"),
            p(
              "Iba ang paglaktaw: ito ang pag-uulat ng driver na wala talagang idi-deliver dito. Ito ang tanging pagsarang walang kailangang litrato, at naitatala ito bilang laktaw para mabasa ng opisina nang eksakto iyon sa kasaysayan kaysa isang pagkabigong hindi nangyari.",
            ),
            warn(
              'Hindi kailanman nagpapaandar ang nabigong hinto ng email ng patunay ng delivery sa tatanggap. Ang opisina ang humahawak sa mga iyon sa kamay, dahil ang masayang "dumating na ang parcel mo" para sa nabigong inihatid ay mas masama pa kaysa walang mensahe.',
            ),
            note(
              "Isinusulat sa kasaysayan ng ruta ang bawat pagsara, pagkabigo at laktaw kasama ang sino ang gumawa at kailan, at hindi kayang i-edit ang kasaysayan.",
            ),
            see(
              "delivery-routes/tracking-links-and-notifications",
              "delivery-routes/driver-run-and-proof-of-delivery",
            ),
          ],
        },
        {
          slug: "tracking-links-and-notifications",
          title: "Mga tracking link at email sa tatanggap",
          summary:
            "Ang tatlong email na makukuha ng tatanggap, at kung ano nang eksakto ang ipinapakita ng tracking page.",
          keywords: [
            "tracking",
            "notification",
            "email",
            "tatanggap",
            "eta",
            "link",
            "privacy",
            "recipient",
          ],
          body: [
            p(
              "Ang tatanggap na may email address sa hinto niya ay maaaring panatilihing may alam nang awtomatiko. Kontrolado mo ito kada ruta, at ang tatanggap na walang email address ay basta hindi kinakausap.",
            ),
            h("Ang tatlong email"),
            table(
              ["Email", "Kailan napapadala"],
              [
                ["On the way", "Nagsimula na ang ruta at nasa labas ang driver."],
                ["You're next", "Nakatakdang bilang na ng inihahatid ang lapit ng driver."],
                [
                  "Delivered",
                  "Sarado na ang hinto nila. Kasama ang litrato ng patunay at ang code nito.",
                ],
              ],
            ),
            h("Mga setting"),
            ul(
              "Buksan o isara ang email na paunawa para sa ruta.",
              "Itakda kung ilang hinto pa ang layo bago iyon lumabas — kaunting abiso ang isa, malawak na bintana ang lima.",
              "Buksan o isara ang email ng patunay ng delivery.",
            ),
            h("Ano ang ipinapakita ng tracking page"),
            p(
              "Iniuugnay ng bawat email ang tracking page para sa isang hintong iyon, na naaabot sa hindi mahuhulaang link. Nakikita ng tatanggap ang pangalan ng kompanya mo, ang sarili niyang address, ilang inihahatid pa ang nauuna sa kanya, at kapag sarado na ang hinto, ang litrato ng patunay kasama ang beripikadong oras at lokasyon nito.",
            ),
            h("Ano ang sadyang hindi nito ipinapakita"),
            ul(
              "Anumang ibang hinto, address o tatanggap sa ruta.",
              "Ang pangalan, telepono o buhay na posisyon ng driver.",
              "Ang pangalan ng ruta, o ang kabuuang bilang ng hinto — na magpapahintulot sa kakompetensya na imapa ang ronda mo.",
            ),
            note(
              'Nakakakuha ang bawat tatanggap ng bawat email nang isang beses lang, at tinitingnan muli ang pag-usad ng driver bago pa magpadala, kaya walang nakakakuha ng "you\'re next" para sa hintong kaka-deliver lang.',
            ),
            warn(
              "Lumalabas lang ang email sa tatanggap kapag naka-configure ang pagpapadala ng email para sa workspace mo. Kung nag-uulat ang mga tatanggap na walang nakukuha, iyon ang unang titingnan.",
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
