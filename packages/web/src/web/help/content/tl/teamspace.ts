import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const teamspace: Category = {
  slug: "teamspace",
  title: "Teamspace",
  summary:
    "Ang pinagsasaluhang workspace kung saan dumadating ang mga kuha ng crew, at kung saan ginagawa ng opisina ang mga ito bilang proyekto, report at share link.",
  icon: "Users",
  sections: [
    {
      title: "Ang workspace mo",
      articles: [
        {
          slug: "teamspace-overview",
          title: "Pangkalahatang tanaw ng Teamspace",
          summary:
            "Ano ang workspace, ano ang dumadating dito, at sino ang nakakakita ng aling bahagi nito.",
          keywords: ["workspace", "organisation", "org", "dashboard", "shared", "pinagsasaluhan"],
          body: [
            p(
              "Ang teamspace ay isang pinagsasaluhang workspace para sa isang kompanya. Bawat litrato at video na kinukuha ng crew mo sa telepono ay naka-upload dito, at ang lahat ng may akses ay nakakakita ng parehong library mula sa web app, sa desktop app o sa telepono nila.",
            ),
            p(
              "Hindi mo kailangang ilipat nang manu-mano ang anumang bagay sa teamspace. Pagkatapos mag-upload ng isang kuha, naroon na ito, kasama ang na-verify na oras, posisyon ng GPS at address nito.",
            ),
            h("Ano ang nasa isang teamspace"),
            ul(
              "Ang library ng litrato at video, pinakabago ang nauuna.",
              "Mga proyekto — ang mga trabaho, site o kliyenteng pinagsasama-sama ng mga kuha.",
              "Ang crew mo: mga miyembro, ang kanilang role, at kung anong proyekto ang nakikita ng bawat isa.",
              "Mga watermark template, para pareho ang pagtatatak ng bawat telepono.",
              "Mga report at export na nabuo mo, at anumang share link na naipamigay mo.",
              "Mga delivery route, kung gumagamit ka ng Delivery.",
            ),
            h("Sino ang nakakakita ng ano"),
            p(
              "Ang Owner, Admin at Manager ay nakakakita ng buong workspace. Ang mga Field member ay nakakakita lang ng mga proyektong itinalaga sa kanila — ang sariling kuha nila kasama ang lahat ng iba pa sa mga proyektong iyon. Iyon ang pangunahing dahilan para ilagay ang trabaho sa mga proyekto kaysa iwan itong maluwag.",
            ),
            note(
              "Bahagi ang Teamspace ng Business plan at pataas. Sa Free at Plus, nakukuha mo pa rin ang buong pagkuha, watermarking at beripikasyon, ngunit ikaw lang ang nasa workspace.",
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
          title: "Gumawa ng proyekto",
          summary:
            "Pagsama-samahin ang mga kuha ayon sa trabaho, site o kliyente para magtugma ang mga filter, report at akses ng crew.",
          keywords: ["project", "proyekto", "job", "trabaho", "site", "client", "kliyente", "folder"],
          body: [
            p(
              "Ang proyekto ay lalagyan ng mga kuha — kadalasan isang trabaho, isang site o isang kliyente. Ang mga proyekto ang pinagbubuuan ng mga report, ang binibigyan ng akses sa mga Field member, at ang pinagsasama-samahan ng mapa at ng tanaw na bago-at-pagkatapos.",
            ),
            h("Gumawa ng isa"),
            steps(
              "Sa web app, buksan ang Mga proyekto at piliin ang Bagong proyekto.",
              "Bigyan ito ng pangalan. Iyon lang ang kailangang field.",
              "Kung gusto mo, magdagdag ng job code, pangalan ng kliyente, label ng lokasyon at street address.",
              "Magdagdag ng kategorya at panloob na note kung ginagamit ito ng team mo.",
              "I-save. Agad na makukuha ang proyekto sa project picker ng mobile app.",
            ),
            h("Mga field at ang gamit nila"),
            table(
              ["Field", "Ano ang ginagawa nito"],
              [
                ["Pangalan", "Kung paano lumalabas ang proyekto kahit saan. Hanggang 90 karakter."],
                ["Code", "Ang sariling numero ng trabaho o work order mo. Nahahanap sa search."],
                ["Kliyente", "Para kanino ang trabaho. Kapaki-pakinabang kapag nag-e-export ka."],
                ["Label ng lokasyon", 'Isang pangalang pantao para sa site, gaya ng "North yard".'],
                ["Address", "Ang address ng site. Ginagamit para isentro ang proyekto sa mapa."],
                ["Kategorya", 'Ang sariling pagpapangkat mo, gaya ng "Roofing" o "Inspeksyon".'],
                ["Mga note", "Panloob na konteksto. Hindi kailanman ipinapakita sa share link."],
              ],
            ),
            h("Status ng proyekto"),
            p(
              "Ang bawat proyekto ay Active, On hold, Complete o Archived. Walang binabago ang status sa akses o storage — nariyan ito para hindi na dumagsa sa listahan ang tapos nang trabaho. Mag-filter ayon sa status sa itaas ng pahinang Mga proyekto.",
            ),
            note(
              "Ang paggawa ng proyekto ay nangangailangan ng Manager role o pataas. Maaaring kumuha ang mga Field member sa mga proyektong itinalaga sa kanila ngunit hindi sila makakagawa ng bago.",
            ),
            warn(
              "May takdang bilang ng proyekto ang bawat plano. Kung maabot mo ang limitasyon, hihilingin sa iyong mag-upgrade kaysa payagang gumawa ng proyektong hindi masasaklaw.",
            ),
            see("teamspace/invite-your-crew", "mobile-app/assign-capture-to-project"),
          ],
        },
        {
          slug: "browse-and-filter-photos",
          title: "Tingnan at i-filter ang mga litrato",
          summary:
            "Paliitin ang libo-libong kuha hanggang sa ilan na lang na kailangan mo ayon sa proyekto, tao, tag, petsa o teksto.",
          keywords: ["search", "hanapin", "filter", "library", "gallery", "tag", "find"],
          body: [
            p(
              "Ipinapakita ng photo library ang bawat kuha sa workspace, pinakabago ang nauuna. Nagsasalansan ang mga filter — magtakda ng kahit ilan at magkakasamang gagana ang lahat.",
            ),
            h("Ang mga filter"),
            ul(
              "Proyekto — mga kuha lang na itinalaga sa proyektong iyon.",
              "Miyembro — mga kuha lang na ginawa ng isang tao.",
              "Tag — general, before, after, issue, arrival, departure, pickup o delivery.",
              "Saklaw ng petsa — mga kuhang ginawa sa pagitan ng dalawang petsa, batay sa oras ng pagkuha, hindi sa oras ng pag-upload.",
              "Search — tumutugma sa address, sa note sa kuha, at sa photo code.",
            ),
            h("Paghahanap ayon sa photo code"),
            p(
              "Kung may photo code na binanggit sa iyo ang kliyente mula sa isang watermark, i-paste ito sa search box. Mahahanap nito ang eksaktong kuhang iyon, na mas mabilis kaysa mag-scroll hanggang sa petsa.",
            ),
            h("Pagtatrabaho sa isang pinili"),
            p(
              "Pumili ng maraming kuha para ilipat sila sa isang proyekto, i-tag sila, bumuo ng report mula lang sa kanila, o burahin sila. Ang pagbura ay nangangailangan ng Manager o pataas.",
            ),
            note(
              "Ginagamit ng mga filter ng petsa ang oras ng pagkuha ng litrato. Ang kuhang dalawang araw na nakapila offline ay nasa filter pa rin ng araw na nasa site ang crew.",
            ),
            see("teamspace/map-view", "teamspace/reports-and-exports", "verify/verify-a-photo"),
          ],
        },
        {
          slug: "map-view",
          title: "Tanaw ng mapa",
          summary:
            "Tingnan ang bawat kuha bilang pin, at tiyaking nasa sinasabi ng papeles ang crew.",
          keywords: ["map", "mapa", "gps", "pins", "location", "lokasyon", "coordinates"],
          body: [
            p(
              "Ipinapakita ng tanaw ng mapa ang mga kuha mo ayon sa naitalang posisyon ng GPS. Sinasagot nito ang tanong na hindi kayang sagutin ng grid ng litrato: ginawa ba ang trabaho kung saan dapat itong ginawa?",
            ),
            h("Paggamit nito"),
            steps(
              "Buksan ang Mapa mula sa navigation ng workspace.",
              "Ilapat ang parehong filter ng proyekto, miyembro, tag at petsa na ginagamit mo sa library.",
              "I-click ang isang pin para makita ang kuha, ang address nito at ang eksaktong oras.",
              "Mag-zoom sa isang kumpol para ihiwalay ang mga pin na magkalapit sa loob ng ilang metro.",
            ),
            h("Kapag mukhang mali ang pin"),
            ul(
              "Sa loob ng gusali, sa basement o sa pagitan ng matataas na gusali, bumababa ang kawastuhan ng GPS. Maaaring sampu-sampung metro ang lihis ng pin kahit tunay ang litrato.",
              "Ang address ay tinutumbas mula sa mga coordinate, kaya ang maling fix ay gumagawa ng kapani-panipala ngunit maling pangalan ng kalye.",
              "Ang mga kuhang ginawa nang tinanggihan ang pahintulot sa lokasyon ay walang pin at hindi lalabas sa mapa.",
            ),
            note(
              "Maaari mong i-export ang kasalukuyang pinili sa mapa bilang KMZ file at buksan ito sa Google Earth, na madalas hinihingi ng mga utility at kliyenteng munisipal.",
            ),
            see("troubleshoot/gps-or-address-wrong", "teamspace/reports-and-exports"),
          ],
        },
        {
          slug: "before-after-compare",
          title: "Paghahambing ng bago at pagkatapos",
          summary:
            "Ilagay ang dalawang kuha nang magkatabi para ipakita ang pagbabagong binayaran sa iyo.",
          keywords: ["before", "bago", "after", "pagkatapos", "compare", "progress", "slider"],
          body: [
            p(
              "Pinagpapares ng tanaw ng paghahambing ang dalawang kuha mula sa parehong proyekto at ipinapakita silang magkasama, bawat isa may sariling na-verify na oras at address. Ito ang pinakamabilis na paraan para ipangatwiran ang natapos na trabaho.",
            ),
            h("Pag-set up nito"),
            steps(
              "I-tag ang unang kuha bilang Before sa app o sa web library.",
              "I-tag ang kuha ng tapos nang kalagayan bilang After.",
              "Buksan ang proyekto at piliin ang tanaw na Bago at pagkatapos.",
              "Piliin ang pares na gusto mo kung mahigit isa ang na-tag.",
            ),
            h("Pagkuha ng malinis na pares"),
            ul(
              "Tumayo nang halos sa parehong lugar at hawakan ang telepono sa parehong taas para sa dalawang kuha.",
              "Isama sa frame ang isang hindi natitinag na sanggunian — isang pinto, poste o sulok — sa dalawa.",
              "Kunin ang After mula sa parehong distansya; ang pag-zoom kaysa paglapit ay nagbabago ng pananaw.",
            ),
            note(
              "Ang layout na bago-at-pagkatapos ay isa sa mga layout ng report, kaya kapag na-tag na ang pares, maaari mo na itong ilagay nang diretso sa PDF para sa kliyente.",
            ),
            see("teamspace/reports-and-exports", "mobile-app/take-a-photo"),
          ],
        },
      ],
    },
    {
      title: "Ibahagi ang trabaho",
      articles: [
        {
          slug: "reports-and-exports",
          title: "Mga report at export",
          summary:
            "Gawing PDF, Excel sheet, ZIP o KMZ ang isang nasalang grupo ng mga kuha.",
          keywords: ["pdf", "excel", "xlsx", "zip", "kmz", "export", "report", "download"],
          body: [
            p(
              "Ang report ay larawan ng isang grupo ng mga kuha sa isang file na maipapadala mo. Buuin muna ang grupo gamit ang mga filter, pagkatapos ay mag-export — anuman ang nasa screen ang napupunta sa file.",
            ),
            h("Bumuo ng report"),
            steps(
              "I-filter ang library sa mga kuhang gusto mo, o buksan ang isang proyekto.",
              "Piliin ang Export, pagkatapos bigyan ng pamagat ang report.",
              "Pumili ng layout: grid, detalyado, bago-at-pagkatapos, o mapa.",
              "Pumili ng format: PDF, Excel, ZIP o KMZ.",
              "I-generate. Binubuo ang file sa server at lumalabas sa listahan ng report mo para i-download o i-download muli mamaya.",
            ),
            h("Aling format ang gagamitin"),
            table(
              ["Format", "Gamitin ito para sa"],
              [
                [
                  "PDF",
                  "Dokumentasyong para sa kliyente. May-watermark na litrato, nailatag at may pahina.",
                ],
                [
                  "Excel",
                  "Isang hilera kada kuha kasama ang oras, coordinate, address, tag at note.",
                ],
                ["ZIP", "Ang orihinal na mga image file, para ipasa sa ibang sistema."],
                ["KMZ", "Pagbukas ng mga lokasyon ng kuha sa Google Earth o GIS software."],
              ],
            ),
            h("Mga layout"),
            ul(
              "Grid — maraming litrato kada pahina, mainam sa dami.",
              "Detalyado — isang kuha kada pahina kasama ang buong bloke ng metadata.",
              "Bago at pagkatapos — magkatabing na-tag na pares.",
              "Mapa — nakaguhit na mga lokasyon ng kuha, kasama ang index ng litrato.",
            ),
            warn(
              "Nakadepende sa plano mo ang mga format ng export. Ang Free plan ay gumagawa ng PDF na hanggang 20 litrato; ang Excel, ZIP at KMZ ay nagsisimula sa Plus. Kung hindi saklaw ang isang format, sasabihin sa iyo bago buuin ang file, hindi pagkatapos.",
            ),
            see("plans-billing/compare-plans", "troubleshoot/export-or-report-failed"),
          ],
        },
        {
          slug: "share-links",
          title: "Mga share link",
          summary:
            "Magpadala ng kuha sa taong walang account, at bawiin ang link kapag tapos ka na.",
          keywords: [
            "share",
            "ibahagi",
            "link",
            "url",
            "client",
            "public",
            "pampubliko",
            "revoke",
            "expiry",
          ],
          body: [
            p(
              "Ang share link ay isang web address na nagpapakita ng isang kuha — ang media, ang na-verify na oras, ang posisyon ng GPS at ang address nito — sa kahit sinong magbukas nito. Walang account, walang app, walang sign-in.",
            ),
            h("Gumawa ng link"),
            steps(
              "Buksan ang kuha sa web app.",
              "Piliin ang Ibahagi.",
              "Kung gusto mo, magtakda ng pag-expire sa araw. Iwan itong blangko para sa link na hindi nag-e-expire.",
              "Kopyahin ang link at ipadala.",
            ),
            h("Pangangasiwa ng mga link"),
            ul(
              "Bawat link ay nakalista sa workspace kasama ang kung kailan ito ginawa at ilang beses nang binuksan.",
              "Bawiin ang link anumang oras. Agad itong hihinto sa paggana para sa lahat ng may hawak nito.",
              "Ang paghiling na ibahagi ang kuhang may buhay nang link ay ibinibigay sa iyo ang umiiral nang link kaysa gumawa ng pangalawa.",
            ),
            h("Ano ang hindi ipinapakita ng share link"),
            ul(
              "Ang iba mong kuha, proyekto o crew.",
              "Mga panloob na note ng proyekto.",
              "Anuman tungkol sa workspace, plano o billing mo.",
            ),
            warn(
              "Ituring na pampubliko ang link. Kahit sinong mapagpasahan nito ay makakabukas dito hanggang bawiin mo o mag-expire ito.",
            ),
            note(
              "Ang mga share link ay feature ng bayad na plano. Kung hindi makukuha ang Ibahagi, tingnan ang plano mo.",
            ),
            see("verify/verify-a-photo", "plans-billing/compare-plans"),
          ],
        },
      ],
    },
    {
      title: "Ang crew mo",
      articles: [
        {
          slug: "invite-your-crew",
          title: "Imbitahin ang crew mo",
          summary:
            "Magdagdag ng tao sa email o QR code, at ilagay sila sa tamang proyekto mula sa unang araw.",
          keywords: ["invite", "imbitahin", "add member", "seat", "qr", "onboard", "crew"],
          body: [
            p(
              "Sumasali ang mga miyembro sa pamamagitan ng imbitasyon. Magpapadala ka, tatanggapin nila, at magsisimulang dumating ang mga kuha nila sa teamspace mo.",
            ),
            h("Magpadala ng imbitasyon"),
            steps(
              "Buksan ang Team at piliin ang Mag-imbita.",
              "Ilagay ang email nila sa trabaho.",
              "Pumili ng role. Ang Field ang default at tama para sa karamihan ng crew.",
              "I-tsek ang mga proyektong dapat nang may akses sila pagkaunang sign in.",
              "Ipadala. Makakakuha sila ng email na may link na magdadagdag sa kanila sa workspace mo.",
            ),
            h("Pag-imbita sa taong katabi mo"),
            p(
              "Ang bawat nakabinbing imbitasyon ay may QR code din. Ipakita ito sa screen mo, ipa-scan sa kamera ng telepono nila, at mapupunta sila sa pahina ng pagtanggap nang hindi mo kailangang i-type ang address nila. Kapaki-pakinabang para sa crew na kasama mo sa site.",
            ),
            h("Mga seat"),
            p(
              "May kasamang bilang ng seat ang bawat plano. Ang nakabinbing imbitasyon ay may hawak na seat, kaya ang limang imbitasyon laban sa tatlong seat ay tatanggihan kaysa hayaang tumanggap ang lahat at lumampas sa plano. Kung wala nang seat, bawiin ang imbitasyong hindi naman tatanggapin, alisin ang miyembrong umalis na, o mag-upgrade.",
            ),
            h("Kung hindi dumating ang imbitasyon"),
            ul(
              "Ipatingin sa kanila ang spam, at tiyakin ang address na ginamit mo.",
              "Tingnan ang nakabinbing listahan — kung nariyan ang imbitasyon, ipadala muli o gamitin ang QR code.",
              "Nakakabit ang imbitasyon sa email address na pinadalhan nito; hindi gagana ang pagtanggap sa ibang address.",
            ),
            note(
              "Ang pag-imbita at pag-alis ng miyembro ay nangangailangan ng Admin role o pataas.",
            ),
            see("teamspace/roles-and-permissions", "troubleshoot/invite-not-working"),
          ],
        },
        {
          slug: "roles-and-permissions",
          title: "Mga role at permiso",
          summary:
            "Owner, Admin, Manager at Field — ano ang kaya ng bawat isa, at sino ang dapat gawing ano.",
          keywords: [
            "role",
            "permission",
            "permiso",
            "admin",
            "manager",
            "field",
            "access",
            "akses",
            "owner",
          ],
          body: [
            p(
              "Apat ang role. Ang bawat miyembro ay may isa lang, at ito ang nagtatakda ng nakikita nila at ng maaari nilang baguhin.",
            ),
            table(
              ["Role", "Ang kaya nito"],
              [
                [
                  "Owner",
                  "Lahat, kasama ang billing at pagbabago ng plano. Isa kada workspace, at hindi ito maaaring alisin.",
                ],
                [
                  "Admin",
                  "Mag-imbita at mag-alis ng miyembro, magbago ng role, mangasiwa ng proyekto, template at export.",
                ],
                [
                  "Manager",
                  "Gumawa at mag-edit ng proyekto, magbura ng kuha, magpadala ng broadcast, bumuo ng report. Walang pangangasiwa ng miyembro.",
                ],
                [
                  "Field",
                  "Kumuha, at makita lang ang mga proyektong itinalaga sa kanila. Walang akses sa team, imbitasyon o billing.",
                ],
              ],
            ),
            note(
              "Nananatiling Ingles ang pangalan ng mga role sa app — Owner, Admin, Manager, Field — kaya pareho ang makikita mo sa screen.",
            ),
            h("Ano ang ibibigay sa mga tao"),
            ul(
              "Crew na nasa kagamitan: Field.",
              "Foreman o site lead na nag-oorganisa ng trabaho: Manager.",
              "Staff sa opisinang nag-o-onboard ng tao at humahawak ng dokumentasyon ng kliyente: Admin.",
              "Iwan ang Owner sa taong nagbabayad ng bill.",
            ),
            h("Pagbabago ng role"),
            steps(
              "Buksan ang Team.",
              "Piliin ang miyembro.",
              "Piliin ang bagong role. Magkakabisa ito sa susunod na pagkausap ng app nila sa server.",
            ),
            h("Pag-alis ng isang tao"),
            p(
              "Ang pag-alis ng miyembro ay kinukuha ang akses nila. Hindi nito binubura ang trabaho nila: ang mga litrato, video at ang audit trail sa likod nila ay nananatili sa teamspace, na ang punto ng pagtatago ng ebidensya sa workspace kaysa sa telepono.",
            ),
            warn(
              "Hindi mo maaaring alisin ang Owner ng workspace, at hindi mo maaaring alisin ang sarili mo. Ang Owner lang ang makakaalis ng ibang Admin, kaya hindi maaaring alisin ng dalawang Admin ang isa't isa.",
            ),
            see("teamspace/invite-your-crew", "plans-billing/seats-and-billing"),
          ],
        },
        {
          slug: "messages-and-broadcasts",
          title: "Mga mensahe at broadcast",
          summary:
            "Makipag-usap sa isang miyembro ng crew, o magpadala ng isang anunsyo sa lahat nang sabay.",
          keywords: [
            "message",
            "mensahe",
            "chat",
            "broadcast",
            "announcement",
            "anunsyo",
            "notify",
            "push",
          ],
          body: [
            p(
              "Ang mga mensahe ay isa-sa-isang thread sa pagitan ng mga taong nasa parehong workspace. Dumadating ito bilang push notification sa telepono, kaya hindi mo hinahabol ang crew sa personal na chat app.",
            ),
            h("Mag-mensahe sa isang tao"),
            steps(
              "Buksan ang Mga mensahe.",
              "Piliin ang tao mula sa mga contact sa workspace mo.",
              "I-type at ipadala. Maaari kang magkabit ng kuhang bago para maliwanag ang pinag-uusapan mo.",
            ),
            h("Mga broadcast"),
            p(
              "Ang broadcast ay nagpapadala ng parehong mensahe sa lahat sa workspace nang sabay. Ipinapadala ito bilang normal na mensahe sa sariling thread ng bawat tao, kaya ang mga sagot ay dumadating sa iyo nang pribado kaysa maging pagtatalo ng grupo.",
            ),
            steps(
              "Buksan ang Mga mensahe at piliin ang Broadcast.",
              "Kung gusto mo, magkabit ng proyekto, para malaman ng mga tao kung aling trabaho ang tinutukoy.",
              "Isulat ang mensahe at ipadala. Makikita mo kung ilang tao ang napadalhan.",
            ),
            note(
              "Ang pagpapadala ng broadcast ay nangangailangan ng Manager role o pataas. Ang isa-sa-isang pagmemensahe ay bukas sa lahat sa workspace.",
            ),
            see("mobile-app/notifications", "troubleshoot/notifications-not-arriving"),
          ],
        },
      ],
    },
    {
      title: "Mga pamantayan",
      articles: [
        {
          slug: "watermark-template-library",
          title: "Library ng watermark template",
          summary:
            "Itakda ang tatak na ginagamit ng bawat telepono sa workspace, para magkatugma ang mga kuhang dumarating.",
          keywords: ["watermark", "template", "brand", "logo", "stamp", "tatak", "default"],
          body: [
            p(
              "Ang watermark template ang nagtatakda ng nakakabit sa sulok ng bawat kuha: aling field ang lumalabas, saan nakalagay ang bloke, at kung nasa loob nito ang logo mo. Ang mga template ay nasa workspace, hindi sa device, kaya ang itinakda mo rito ang itinatatak ng buong crew.",
            ),
            h("Gumawa ng template"),
            steps(
              "Buksan ang Mga template sa mga setting ng workspace.",
              'Piliin ang Bagong template at pangalanan ito ayon sa gamit, hindi sa kliyente — mas tumatagal ang "Progreso sa site" kaysa "Trabaho sa Northline".',
              "I-tsek ang mga field na ipapakita: petsa at oras, coordinate, address, proyekto, pangalan ng miyembro, photo code, panahon, isang custom na linya.",
              "Piliin ang sulok at ang laki, at mag-upload ng logo kung gusto mo.",
              "I-save.",
            ),
            h("Ang default na template"),
            p(
              "Isang template ang default ng workspace. Kusang nakukuha ito ng mga bagong miyembro, at ito ang ginagamit ng telepono hanggang may magpalit. Magtakda ng ibang default anumang oras; hindi nagagalaw ang mga umiiral nang kuha.",
            ),
            h("Pag-aayos"),
            ul(
              "Ang pagbura ng template ay hindi nagbabago sa mga kuhang natatakan na nito.",
              "Hindi mangyayaring mawalan ka ng default — ang pag-angat sa isang template ay ibinababa ang dating default sa parehong hakbang.",
              "Maaaring magpalit ang crew sa pagitan ng mga template ng workspace sa telepono nila ngunit hindi nila maaaring i-edit ang mga ito.",
            ),
            warn(
              "Kasama sa Free plan ang dalawang template. Pinapayagan ka ng mga bayad na plano na bumuo ng sariling set kasama ang logo.",
            ),
            see("mobile-app/watermark-templates", "mobile-app/switch-template"),
          ],
        },
      ],
    },
  ],
};
