import { type Category, h, note, p, see, steps, ul, warn } from "../../types";

export const troubleshoot: Category = {
  slug: "troubleshoot",
  title: "Pag-troubleshoot",
  summary: "Ang mga bagay na pinakamadalas magkamali, at ano ang unang tsekin.",
  icon: "Wrench",
  sections: [
    {
      title: "Pagkuha at pag-upload",
      articles: [
        {
          slug: "photos-not-uploading",
          title: "Hindi nag-a-upload ang mga litrato",
          summary: "Mga kuhang nakaupo sa pila, at paano paandarin ang mga ito.",
          keywords: [
            "upload",
            "pila",
            "sagad",
            "naghihintay",
            "offline",
            "sync",
            "limitasyon",
            "queue",
            "stuck",
            "pending",
            "limit",
          ],
          body: [
            p(
              "Nananatili sa telepono ang mga kuha hanggang sa mag-upload. Normal ang pila kapag mahina ang signal — hindi normal ang pilang hindi kailanman umuunti.",
            ),
            h("Tsekin sa ganitong pagkakasunod-sunod"),
            steps(
              "Buksan ang app at tingnan ang upload queue. Kung may nakahintay, ligtas ang mga kuha sa device.",
              "Kumuha ng totoong signal o Wi-Fi. Kadalasan nakakakonekta ang isang bar pero hindi nito kayang ilakad ang litrato.",
              "Ilabas ang app sa foreground at iwan ito roon nang isang minuto. Mahigpit na pinapatulog ng ilang telepono ang background transfer.",
              "Tsekin na hindi nasa low-power o data-saver mode ang telepono, dahil hinaharangan nito ang background upload.",
              "Mag-sign out at mag-sign in muli bilang huling paraan lang — gawin ito kapag walang laman ang pila.",
            ),
            h("Kung umunti ang pila pero walang lumitaw sa workspace"),
            ul(
              "Tsekin ang project filter sa web app. Maaaring napunta ang mga kuha sa proyektong hindi mo tinitingnan.",
              "Tsekin ang date filter. Ang kuhang pumila ay nakatala sa araw kung kailan ito kinuha, hindi ngayon.",
              "Kumpirmahin na tama ang workspace na tinitingnan mo kung nasa mahigit isa ka.",
            ),
            h("Kung nasagad na ang buwanang limitasyon"),
            p(
              "Sagot ng Free plan ang 300 kuha kada buwan. Lampas doon, tinatanggihan ang mga upload hanggang magpalit ng buwan o lumipat ka sa planong walang buwanang hangganan.",
            ),
            warn(
              "Huwag burahin ang app habang may nakapilang kuha. Nasa workspace mo ang mga na-upload na, pero ang naghihintay pa sa device ay kasamang mawawala.",
            ),
            note(
              "Naitatala sa device ang oras ng pagkuha, kaya ang litratong dalawang araw na huling nag-upload ay may dala pa ring sandali nang pinindot ang shutter, at iyon ang ipinapakita ng beripikasyon.",
            ),
            see("mobile-app/offline-capture-and-queue", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "gps-or-address-wrong",
          title: "Mali ang posisyon sa GPS o ang address",
          summary: "Bakit umaanod ang pin, at ano ang gagawin sa maling pangalan ng kalye.",
          keywords: [
            "gps",
            "lokasyon",
            "address",
            "kawastuan",
            "mali",
            "anod",
            "permission",
            "location",
            "accuracy",
            "wrong",
            "drift",
          ],
          body: [
            p(
              "Itinatala ng GeoCliks ang posisyong iniulat ng telepono, at tinutukoy ang posisyong iyon sa isang address sa kalye. Puwedeng mali ang dalawang hakbang, sa magkaibang dahilan.",
            ),
            h("Mali ang lugar ng pin"),
            ul(
              "Sa loob ng gusali, sa basement, sa parking garage o sa pagitan ng matataas na gusali, mahina ang sagap sa satellite at bumabagsak ang telepono sa mas magaspang na fix.",
              "Ang teleponong kabubukas lang ay wala pang fix. Bigyan ito ng labinlimang segundo sa labas bago ang unang kuha ng araw.",
              "Bawat kuha ay may itinatalang kawastuan. Ang malaking bilang ng kawastuan ay pagsasabi ng telepono na hindi ito sigurado — feature iyon, hindi depekto.",
            ),
            h("Tama ang posisyon pero mali ang address"),
            p(
              "Hinahanap ang address mula sa koordinado. Sa bagong subdivision, sa kalsadang bukid o sa malaking lugar na may isang numero lang, ang pinakamalapit na kilalang address ang lumalabas, at puwedeng katabing gusali iyon. Ang koordinado pa rin ang mapagkakatiwalaang rekord.",
            ),
            h("Wala talagang lokasyon"),
            steps(
              "Buksan ang settings ng telepono mo at hanapin ang GeoCliks.",
              "Itakda ang permission sa lokasyon sa While Using the App, o Always.",
              "Sa iPhone, i-on din ang Precise Location. Kung wala ito, magaspang na lugar ang makukuha mo, hindi posisyon.",
              "Kumuha muli. Hindi na mabibigyan ng lokasyon ang mga naunang kuha.",
            ),
            h("Maling lugar ang mga hinto sa delivery"),
            p(
              "Ang posisyon ng hinto ay galing sa pagtukoy sa address na tinipa, hindi sa telepono. Iwasto ang address at tumukoy muli, o ihulog ang pin nang manu-mano.",
            ),
            warn(
              "Hindi na puwedeng idagdag o i-edit ang posisyon matapos ang kuha. Iyon ang nagpapa-ebidensya rito — kung naiwawasto pa mamaya, wala itong mapapatunayan.",
            ),
            see(
              "delivery-routes/geocoding-and-fixing-addresses",
              "verify/verify-results-explained",
            ),
          ],
        },
      ],
    },
    {
      title: "Pag-access",
      articles: [
        {
          slug: "cant-sign-in",
          title: "Hindi makapag-sign in",
          summary: "Maling password, hindi beripikadong email, o maling paraan ng pag-sign in.",
          keywords: [
            "sign in",
            "login",
            "password",
            "i-reset",
            "beripikahin",
            "google",
            "nakakandado",
            "reset",
            "verify",
            "locked",
          ],
          body: [
            p(
              "Dumaan dito nang sunod-sunod — karaniwan ay nasa unang tatlo ang dahilan.",
            ),
            h("Tsekin ang pangunahin"),
            steps(
              "Kumpirmahin ang email address. Magkaibang account ang work address at ang personal.",
              "Gamitin ang parehong paraang ginamit mo sa pag-sign up. Ang account na gawa sa Google ay walang password na itatipa.",
              "I-reset ang password mo sa sign-in screen kung hindi ka sigurado.",
              "Buksan ang verification email kung hindi mo kailanman kinumpirma ang address — hindi makapag-sign in ang account na hindi beripikado.",
            ),
            h("Walang dumarating kapag humiling ka ng reset"),
            ul(
              "Tsekin ang spam at junk.",
              "Maghintay ng dalawang minuto. Ang paulit-ulit na paghiling ay puwedeng malimitahan ng rate, na lalo pang nagpapabagal.",
              "Kumpirmahin na umiiral ang address — walang ipinapadala ang reset sa address na walang account.",
            ),
            h("Pinapatunayan mong tao ka"),
            p(
              "Ang paulit-ulit na palyadong pagtatangka ay puwedeng magbunsod ng hamon. Tapusin ito at magpatuloy. Kung paulit-ulit itong lumalabas, gumamit ng normal na browser window kaysa sa private, at patayin ang anumang extension na humaharang sa script.",
            ),
            h("Naka-sign in ka pero nasa maling lugar"),
            ul(
              "Kung nasa mahigit isang workspace ka, magpalit ng workspace sa account menu.",
              "Nakikita lang ng field member ang mga proyektong nakatalaga sa kanila, kaya ang workspace na mukhang walang laman ay karaniwang nangangahulugang wala pa siyang nakatalagang proyekto — tanungin ang admin.",
            ),
            note(
              "Ang pagtanggal sa iyo sa isang workspace ay hindi nagbubura sa account mo. Puwede ka pa ring mag-sign in; hindi lang mo makikita ang workspace na iyon.",
            ),
            see("troubleshoot/two-factor-issues", "getting-started/create-your-account"),
          ],
        },
        {
          slug: "two-factor-issues",
          title: "Mga problema sa two-factor",
          summary:
            "Tinanggihang code, nawalang telepono, at kung paano gumagana ang backup code.",
          keywords: [
            "2fa",
            "two factor",
            "totp",
            "authenticator",
            "backup code",
            "tinanggihang code",
            "code rejected",
          ],
          body: [
            p(
              "Opsyonal ang two-factor authentication at inaalok sa owner at admin mula sa pahina ng profile. Sadyang hindi ipinipilit sa field crew ang authenticator app, dahil nagpapahirap iyon kapag pinagsasaluhan ang telepono sa trak.",
            ),
            h("Tinanggihan ang code"),
            steps(
              "Tsekin na ang GeoCliks entry ang binabasa mo sa authenticator app, hindi ibang serbisyo.",
              "Hintayin ang susunod na code. Nagpapalit ang code tuwing 30 segundo at madalas tinatanggihan ang malapit nang mag-expire.",
              "Itipa ang lahat ng anim na digit nang walang espasyo.",
              "Tsekin na awtomatiko ang pagtatakda sa orasan ng telepono. Ang orasang ilang minutong mali ay gumagawa ng code na hindi tatanggapin ng server.",
            ),
            h("Nawala ang teleponong may authenticator"),
            p(
              "Gamitin ang isa sa mga backup code na ibinigay sa iyo noong in-on mo ang two-factor. Piliin ang opsyon para sa backup code sa second-step screen at maglagay ng isa. Isang beses lang gumagana ang bawat code.",
            ),
            warn(
              "Kung nawala ang authenticator at ang backup code nang dalawa, hindi namin mababawi ang account mula sa sign-in screen. Mag-email sa support@geocliks.com mula sa address mismo ng account at asahan ang pagtsek sa pagkakakilanlan — sadyang mahirap iyon, at iyon ang punto ng two-factor.",
            ),
            h("Pagpatay nito"),
            p(
              "Mag-sign in, buksan ang profile mo, at i-disable ang two-factor. Hihingan ka ng kumpirmasyon. Kung ikaw ang owner, isipin mong iwan itong bukas — ito ang account na kayang magpalit ng billing at magtanggal ng tao.",
            ),
            note(
              "Saklaw ng two-factor ang account mo kahit saan. Kapag naka-on na, hihingin ng website at ng app sa telepono ang pangalawang hakbang.",
            ),
            see("troubleshoot/cant-sign-in", "teamspace/roles-and-permissions"),
          ],
        },
        {
          slug: "invite-not-working",
          title: "Hindi gumagana ang isang imbitasyon",
          summary: "Walang email, expired na link, o wala nang upuan sa plano.",
          keywords: [
            "imbitasyon",
            "upuan",
            "expired",
            "tanggapin",
            "qr",
            "email",
            "invite",
            "invitation",
            "seat",
            "accept",
          ],
          body: [
            p(
              "Nauuwi sa address, sa upuan, o sa plano ang mga problema sa imbitasyon.",
            ),
            h("Wala talagang natanggap na email"),
            steps(
              "Buksan ang Team at tsekin ang pending list — kung naroon ang imbitasyon, nagawa ito.",
              "Tsekin ang address kung may typo. Nakatali ang imbitasyon sa eksaktong address kung saan ito ipinadala.",
              "Papatsekin sila sa spam.",
              "Gamitin na lang ang QR code: buksan ang nakabinbing imbitasyon, ipakita ang code, at ipa-scan sa telepono nila.",
            ),
            h("Tinanggap nila pero walang nakikita"),
            p(
              "Nakikita lang ng field member ang mga proyektong nakatalaga sa kanila. Italaga sila mula sa Team, o mula sa proyekto mismo, at lilitaw ito sa telepono nila sa ilang sandali.",
            ),
            h("Hindi mo talaga maipadala ang imbitasyon"),
            ul(
              "Wala nang upuan: may hawak ding upuan ang mga nakabinbing imbitasyon. Bawiin ang mga lumang imbitasyon, tanggalin ang mga umalis na, o umakyat ng plano.",
              "Hindi kasama ang Teamspace: nagsisimula sa Business plan ang mga imbitasyon. Isang upuan lang ang Free at Plus.",
              "Maling role: kailangan ng admin o owner para makapag-imbita.",
            ),
            h("Tinanggap nila sa ibang email"),
            p(
              "Hindi iyon gumagana — tugma lang ang imbitasyon sa address kung saan ito ipinadala. Bawiin ito at magpadala ng bago sa address na talagang ginagamit nila.",
            ),
            note(
              "Ang pagbawi sa nakabinbing imbitasyon ay agad na nagpapalaya sa upuan nito.",
            ),
            see("teamspace/invite-your-crew", "plans-billing/seats-and-billing"),
          ],
        },
      ],
    },
    {
      title: "Ruta, eksport at alerto",
      articles: [
        {
          slug: "route-optimize-failed",
          title: "Ayaw ma-optimize ang isang ruta",
          summary: "Karaniwan ay hindi natukoy na address. Minsan ang plano.",
          keywords: [
            "optimize",
            "ruta",
            "palya",
            "koordinado",
            "geocode",
            "pagkakasunod-sunod",
            "route",
            "failed",
            "coordinates",
            "order",
          ],
          body: [
            p(
              "Sa posisyon sa mapa gumagana ang optimizer, hindi sa address na tinipa.",
            ),
            h("\"Wala pang hintong may koordinado\""),
            steps(
              "Buksan ang ruta at piliin ang Resolve addresses.",
              "Tingnan ang mga hintong hindi natukoy.",
              "Iwasto ang teksto ng address, o ihulog ang pin nang manu-mano sa mapa.",
              "I-optimize muli.",
            ),
            h("Na-optimize, pero may mga hintong nakabitin sa dulo"),
            p(
              "Hindi maisusunod-sunod ang mga hintong walang posisyon, kaya iniiparada sila sa dulo ng listahan kaysa itapon sa ruta. Tukuyin o pinan sila at i-optimize muli.",
            ),
            h("Humiling ka ng smart optimizer pero standard ang nakuha"),
            p(
              "Sa planong walang smart optimizer, ang standard ang pinapatakbo ng GeoCliks kaysa tumanggi. Nakakakuha pa rin ka ng nakasunod-sunod na ruta. Naitatala sa kasaysayan ng ruta kung aling optimizer ang tumakbo.",
            ),
            h("Mukhang mali pa rin sa iyo ang pagkakasunod-sunod"),
            ul(
              "Tsekin kung nakatakda ang start address, at kung dapat bang naka-on ang pagbalik sa depot.",
              "Tsekin ang service time — sinisira ng sobrang maling halaga ang bawat tantiya ng pagdating.",
              "Nililimitahan ng time window sa hinto ang pagkakasunod-sunod, at mangingibabaw ang masikip na window kaysa sa pinakamaikling daan.",
              "Hilahin ang hinto nang manu-mano. Mas madalas manaig ang kaalaman sa lugar kaysa sa algorithm, kaysa sa inaamin ng mga vendor.",
            ),
            see(
              "delivery-routes/optimize-stop-order",
              "delivery-routes/geocoding-and-fixing-addresses",
            ),
          ],
        },
        {
          slug: "export-or-report-failed",
          title: "Palyado ang isang eksport o ulat",
          summary:
            "Limitasyon ng plano, sobrang laking pinili, at mga format na hindi kasama.",
          keywords: [
            "eksport",
            "ulat",
            "pdf",
            "excel",
            "zip",
            "kmz",
            "palya",
            "i-download",
            "export",
            "report",
            "failed",
            "download",
          ],
          body: [
            p(
              "Limitasyon ng plano ang halos lahat ng palyadong eksport, hindi depekto.",
            ),
            h("Hindi available ang format"),
            ul(
              "PDF lang ang binubuo ng Free plan, hanggang 20 litrato.",
              "Nagsisimula sa Plus ang Excel, ZIP at KMZ.",
              "Sinasabi sa iyo bago buuin ang file, hindi pagkatapos, kaya walang kalahating nabuo.",
            ),
            h("Napakalaki ng eksport"),
            steps(
              "Paliitin ang pinili sa pamamagitan ng date o project filter.",
              "Mag-eksport nang pahinga-hinga — mas madaling i-email at buuin ang isang buwan sa isang pagkakataon.",
              "Para sa libu-libong orihinal, mas mainam ang ZIP kaysa PDF. Hindi rin magagamit ang PDF na ganoon ang laki.",
            ),
            h("Hindi kailanman na-download ang file"),
            ul(
              "Sa server binubuo ang mga ulat at pagkatapos inilista sa reports list mo — doon tsekin at i-download muli kaysa buuing bago.",
              "Tsekin na hindi hinarangan ng browser ang download, at tingnan ang downloads folder mo.",
              "Sumubok muna ng ibang browser minsan bago ito iulat.",
            ),
            h("Ayaw bumukas ng isang KMZ"),
            p(
              "Kailangan ng KMZ ang Google Earth o GIS software. Hindi ito format ng dokumento at hindi ito bubukas sa PDF reader o spreadsheet.",
            ),
            note(
              "Nananatili sa reports list mo ang bawat ulat na nabuo, kaya puwede mo itong i-download muli mamaya nang hindi na binubuo.",
            ),
            see("teamspace/reports-and-exports", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "notifications-not-arriving",
          title: "Hindi dumarating ang mga notification",
          summary:
            "Ang push sa telepono, at ang mga email na dapat matanggap ng tatanggap ng delivery.",
          keywords: [
            "notification",
            "push",
            "email",
            "alerto",
            "tahimik",
            "tatanggap",
            "pagsubaybay",
            "alerts",
            "silent",
            "recipient",
            "tracking",
          ],
          body: [
            p(
              "Dalawang magkaibang sistema, kaya tsekin ang tugma sa nawawala.",
            ),
            h("Push notification sa telepono"),
            steps(
              "Buksan ang settings ng telepono, hanapin ang GeoCliks, at payagan ang mga notification.",
              "Tsekin ang Do Not Disturb, Focus at anumang bedtime schedule.",
              "Buksan ang app minsan habang naka-sign in — sa pag-sign in nagrerehistro sa push ang device, kaya hindi nakarehistro ang teleponong hindi pa nakabukas sa app matapos ang muling pag-install.",
              "Padalhan ang sarili mo ng mensahe mula sa web app para masubukan.",
            ),
            h("Walang natatanggap ang isang crew member"),
            ul(
              "Kailangan silang miyembro ng workspace at naka-sign in sa device na iyon.",
              "Sa mga contact ng workspace napupunta ang broadcast — ang tinanggal sa workspace ay hindi na tumatanggap.",
              "Ang teleponong maraming araw nang offline ay tumatanggap ng nakapilang notification pagkabalik ng koneksyon, o wala na kung nag-expire na sila.",
            ),
            h("Hindi nakakatanggap ng email ang mga tatanggap ng delivery"),
            ul(
              "Kailangan ng hinto ang email address ng tatanggap. Kung wala, walang posibleng email.",
              "Kinokontrol ng notification setting ng ruta ang paunang abiso at ang proof-of-delivery email.",
              "Hindi kailanman nagpapadala ng proof-of-delivery email ang mga palyadong hinto — sadya iyon. Ang opisina ang manu-manong humahawak sa mga iyon.",
              "Isang beses lang tumatanggap ng bawat email ang bawat tatanggap, kaya ang muling pagpapadala ay hindi lalabas nang dalawa.",
              "Kailangang naka-configure ang pagpapadala ng email para sa workspace mo. Kung wala pang tatanggap sa alinmang ruta ang nakatanggap ng kahit ano, iyon ang unang tsekin.",
            ),
            warn(
              "Papatsekin ang tatanggap sa spam bago ka magkonklusyong walang naipadala. Mas madalas mapunta sa junk ang transaksyonal na email na may litrato kaysa sa gusto mo.",
            ),
            see(
              "delivery-routes/tracking-links-and-notifications",
              "teamspace/messages-and-broadcasts",
            ),
          ],
        },
      ],
    },
  ],
};
