import { type Category, h, note, p, see, steps, ul } from "../../types";

export const gettingStarted: Category = {
  slug: "getting-started",
  title: "Pagsisimula",
  summary: "Bago sa GeoCliks? Piliin ang landas na tugma sa papel mo sa trabaho.",
  icon: "Rocket",
  sections: [
    {
      title: "Mga pangunahing bagay",
      articles: [
        {
          slug: "what-is-geocliks",
          title: "Ano ang GeoCliks?",
          summary:
            "Ebidensyang mapapatunayan mo: bawat litrato ay may beripikadong oras, posisyon sa GPS at address sa kalye.",
          keywords: [
            "pangkalahatang-ideya",
            "tungkol",
            "produkto",
            "panimula",
            "overview",
            "about",
            "product",
            "introduction",
          ],
          body: [
            p(
              "Ang GeoCliks ay kasangkapan sa pagdokumento sa litrato at video para sa mga tauhang nasa field. Kinukuha mo ang trabaho sa telepono, at bawat kuha ay may tatak ng oras kung kailan ito kinuha, kung saan ito kinuha, at ang address sa kalye kung saan tumutukoy ang posisyong iyon. Nakasunog ang tatak sa loob ng litrato at nakatala rin ito nang hiwalay para matsek pa sa bandang huli.",
            ),
            p(
              "Hindi mas magandang litrato ang punto nito. Ang punto ay kapag tinanong ka ng kliyente, ng insurance o ng korte kung totoo ba ang litratong sinasabi mo, may sagot ka na hindi nakasalalay sa salita mo lang.",
            ),
            h("Ano ang makukuha mo"),
            ul(
              "Mga litrato at video na may watermark kasama ang beripikadong oras, koordinado ng GPS at address.",
              "Isang natatanging photo code sa bawat kuha na matsek ninuman kahit walang account.",
              "Teamspace: isang pinagsasaluhang workspace kung saan nakikita agad ng opisina ang mga kuha ng crew habang nag-a-upload.",
              "Mga proyekto, map view, paghahambing ng bago at pagkatapos, at eksport sa PDF, Excel, ZIP at KMZ sa isang click.",
              "Delivery Routes: iplano ang maghapon ng driver, ipadala siya, at isara ang bawat hinto sa pamamagitan ng litratong pruweba.",
            ),
            h("Sino ang gumagamit nito"),
            ul(
              "Mga crew sa konstruksyon at mga trade na nagdodokumento ng progreso at turnover.",
              "Restoration at trabahong may insurance, kung saan ang takbo ng panahon ang buong argumento.",
              "Mga tim sa utility, telecom at inspeksyon na kailangang may lokasyon sa bawat rekord.",
              "Mga operasyon sa delivery na kailangang may pruweba na talagang nakarating ang parcel.",
            ),
            note(
              "Gumagana ang GeoCliks kahit offline. Pumipila ang mga kuha sa device at sila na mismo ang nag-a-upload pagbalik ng signal, buo pa rin ang orihinal na oras ng pagkuha.",
            ),
            see("getting-started/create-your-account", "verify/what-is-a-photo-code"),
          ],
        },
        {
          slug: "create-your-account",
          title: "Gumawa ng account",
          summary: "Mag-sign up sa app o sa web — isang account lang, gamit kahit saan.",
          keywords: [
            "mag-sign up",
            "magrehistro",
            "bagong account",
            "email",
            "sign up",
            "register",
            "new account",
          ],
          body: [
            p(
              "Isang GeoCliks account ang gumagana sa mobile app, sa website at sa desktop app. Gawin ito kung saan mas madali para sa iyo; hindi ka gumagawa ng pangalawang account kapag nag-sign up ka sa ibang lugar.",
            ),
            h("Mag-sign up"),
            steps(
              "Buksan ang GeoCliks app, o pumunta sa geocliks.com at piliin ang Sign up.",
              "Ilagay ang pangalan mo, work email at password, o magpatuloy sa Google.",
              "Tsekin ang inbox para sa verification email at buksan ang link.",
              "Pumili ng wika. Mapapalitan mo rin ito mamaya sa profile mo.",
            ),
            note(
              "Gamitin ang work email, hindi ang personal. Kapag may nag-imbita sa iyo sa isang workspace, sa address na alam nila ipapadala ang imbitasyon.",
            ),
            h("Kung hindi dumating ang verification email"),
            ul(
              "Maghintay ng dalawang minuto at tsekin ang spam o junk folder.",
              "Kumpirmahin ang address na tinipa mo — kulang na letra ang karaniwang dahilan.",
              "Humiling ng bagong link sa sign-in screen.",
            ),
            see("getting-started/for-solo-user", "troubleshoot/cant-sign-in"),
          ],
        },
        {
          slug: "install-the-app",
          title: "I-install ang app",
          summary:
            "Kunin ang GeoCliks sa iPhone, iPad o Android, at gamitin ang web app sa kompyuter.",
          keywords: [
            "i-download",
            "mag-install",
            "ios",
            "android",
            "desktop",
            "download",
            "install",
          ],
          body: [
            p(
              "Sa telepono o tablet nangyayari ang pagkuha. Mas madali sa kompyuter ang pagrepaso, pag-uulat at pagplano ng ruta, pero nasa dalawa naman ang lahat.",
            ),
            h("Mobile"),
            ul(
              "iPhone at iPad: i-install mula sa App Store.",
              "Android: i-install mula sa Google Play.",
              "O buksan ang geocliks.com/get-app sa device at sundan ang link para sa platform mo.",
            ),
            h("Kompyuter"),
            p(
              "Pumunta sa geocliks.com at mag-sign in. Walang i-install — sa browser tumatakbo ang Teamspace. May desktop app din kung mas gusto mo ng hiwalay na window.",
            ),
            h("Mga permission na hinihingi ng app"),
            ul(
              "Camera — kailangan. Kung wala ito, wala ring makukuha.",
              "Lokasyon — kailangan. Kalahati ng dahilan kung bakit ebidensya ang isang kuha ay ang posisyon sa GPS.",
              "Mga litrato — opsyonal, kung gusto mo lang na masave din ang mga kuha sa camera roll mo.",
              "Mga notification — opsyonal, para sa mga upload, mensahe at pag-assign ng ruta.",
            ),
            note(
              "Itakda ang permission sa lokasyon sa 'While using the app' bilang pinakamababa. Sa 'Ask every time', kailangan kang istorbohin ng app bago ang bawat kuha.",
            ),
            see("mobile-app/sign-in-on-mobile", "troubleshoot/gps-or-address-wrong"),
          ],
        },
      ],
    },
    {
      title: "Piliin ang landas mo",
      articles: [
        {
          slug: "for-solo-user",
          title: "Kung nagtatrabaho kang solo",
          summary: "Ang pinakamabilis na setup para sa isahang operasyon.",
          keywords: [
            "solo",
            "isang tao",
            "freelancer",
            "nag-iisa",
            "single user",
            "one person",
          ],
          body: [
            p(
              "Hindi kailangan ng tim para may makuha ka sa GeoCliks. Sa solong account, makukuha mo ang mga kuhang may watermark, mga proyekto para hindi maghalo ang mga trabaho, at mga eksport na maiaabot mo sa kliyente.",
            ),
            h("Ihanda ang sarili mo sa limang minuto"),
            steps(
              "I-install ang app at mag-sign in.",
              "Gumawa ng unang proyekto — karaniwan ay ang address ng trabaho o ang pangalan ng kliyente.",
              "Buksan ang watermark template at idagdag ang logo mo, para mukhang sa iyo ang mga eksport.",
              "Kumuha ng pansubok na litrato at tsekin kung tama ang oras at address sa tatak.",
              "I-eksport ito sa PDF para makita ang matatanggap ng kliyente mo.",
            ),
            h("Ano ang gagawin habang lumalaki ang trabaho"),
            ul(
              "Isang proyekto kada trabaho. Nananatiling malinis ang mga ulat at nababasa ang mapa.",
              "Gamitin ang paghahambing ng bago at pagkatapos sa simula at dulo ng bawat trabaho.",
              "Padalhan ng share link ang mga kliyente sa halip na email attachment — nananatiling updated iyon.",
            ),
            note(
              "Sagot ng Free plan ang mga litratong may watermark, 30-segundong video sa unang tatlong araw, at eksport sa PDF hanggang 20 litrato. Inaalis ng Plus ang limitasyon sa litrato at video para sa isang tao.",
            ),
            see("teamspace/create-a-project", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "for-team-owner",
          title: "Kung ikaw ang namamahala sa tim",
          summary:
            "Gumawa ng workspace, imbitahin ang crew, at ipasya kung sino ang puwedeng gumawa ng ano.",
          keywords: [
            "may-ari",
            "admin",
            "setup",
            "workspace",
            "manedyer",
            "owner",
            "manager",
          ],
          body: [
            p(
              "Isang beses lang inihahanda ng may-ari ng workspace ang Teamspace, at doon na sasali ang lahat. Gawin ito sa kompyuter — mas mabilis kaysa sa telepono.",
            ),
            h("Pagkakasunod-sunod ng setup na gumagana"),
            steps(
              "Gumawa ng workspace at ipangalan ito sa kompanya mo.",
              "Bumuo ng watermark template na may logo mo at ang mga field na gusto mong nasa bawat litrato.",
              "Gawin ang mga totoong proyekto bago mag-imbita ng kahit sino, para may mapaglagyan agad ng kuha ang crew.",
              "Imbitahan ang crew sa email, o ibahagi ang join link o ang naka-print na QR code.",
              "Itakda ang role ng bawat tao. Dapat Field ang halos buong crew.",
              "Kumuha ka mismo ng isang litrato at kumpirmahin na napunta ito sa tamang proyekto.",
            ),
            h("Mga role"),
            ul(
              "Owner — buong kontrol kasama ang billing at ang pagbura sa workspace. Isa lang ito.",
              "Admin — lahat ng kayang gawin ng owner maliban sa billing at pagmamay-ari.",
              "Manager — gumagawa ng mga proyekto at ruta, nag-iimbita ng tao, nagpapatakbo ng ulat.",
              "Field — kumukuha ng litrato at video, tumatakbo sa mga nakatalagang ruta, nakikita ang sariling trabaho.",
            ),
            note(
              "Imbitahin ang mga tao bilang Field maliban kung kailangan nilang gumawa ng proyekto o magpatakbo ng ulat. Puwede mong itaas ang role kahit kailan; magkakabisa ito sa susunod nilang pagbukas ng app. Nananatiling Ingles ang pangalan ng mga role sa app, katulad ng nakikita mo dito.",
            ),
            see("teamspace/invite-your-crew", "teamspace/roles-and-permissions"),
          ],
        },
        {
          slug: "for-crew-member",
          title: "Kung inimbitahan ka sa isang tim",
          summary: "Sumali sa workspace at kumuha ng unang litrato.",
          keywords: ["field", "crew", "sumali", "inimbitahan", "miyembro", "join", "member"],
          body: [
            p(
              "May naghanda ng workspace sa kompanya mo at isinama ka roon. Ang trabaho mo ay kunan ang gawain sa field; ang opisina ang bahala sa mga proyekto, ulat at billing.",
            ),
            h("Sumali"),
            steps(
              "Buksan ang email ng imbitasyon, o i-scan ang QR code na ibibigay ng manedyer mo.",
              "Gumawa ng account, o mag-sign in kung mayroon ka na.",
              "I-install ang GeoCliks app sa telepono mo.",
              "Payagan ang camera at lokasyon. Kailangan ang dalawa para makakuha.",
              "Buksan ang listahan ng proyekto at piliin ang trabahong ginagawa mo.",
            ),
            h("Ang unang kuha mo"),
            steps(
              "I-tap ang capture button.",
              "Tsekin sa preview ng watermark kung tama ang proyekto at address.",
              "Kunan ang litrato. Mag-a-upload ito mag-isa.",
              "Kung walang signal, magtrabaho lang — pumipila ang mga kuha at mag-a-upload mamaya.",
            ),
            note(
              "Hindi mo mababago ang oras o lokasyon sa isang kuha, at hindi rin ng manedyer mo. Iyon ang punto ng produkto, hindi limitasyon.",
            ),
            see("mobile-app/take-a-photo", "mobile-app/offline-capture-and-queue"),
          ],
        },
      ],
    },
  ],
};
