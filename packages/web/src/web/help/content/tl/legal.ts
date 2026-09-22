import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const legal: Category = {
  slug: "legal",
  title: "Privacy at legal",
  summary:
    "Sino ang may-ari ng ebidensya, gaano katagal itinatago, at ano talaga ang sinasabi ng Privacy Policy at Terms.",
  icon: "Scale",
  sections: [
    {
      title: "Ang data mo",
      articles: [
        {
          slug: "data-ownership",
          title: "Sino ang may-ari ng mga kuha mo",
          summary:
            "Sa iyo nananatili ang mga litrato at video mo. Ano ang pinapayagang gawin ng GeoCliks sa kanila, at ano ang hindi.",
          keywords: [
            "ownership",
            "pagmamay-ari",
            "own",
            "rights",
            "karapatan",
            "licence",
            "license",
            "content",
            "training",
          ],
          body: [
            p(
              "Sa iyo ang lahat ng ini-upload mo: ang mga litrato, ang mga video, ang data ng proyekto, ang mga note. Itinatago ito ng GeoCliks at pinapatunayang hindi nagbago. Hindi ito napupunta sa amin dahil lang na-upload ito.",
            ),
            h("Ano ang pinapayagan naming gawin dito"),
            p(
              "Binibigyan ng Terms ang GeoCliks ng makitid na lisensya — mag-host, mag-imbak, magpadala, mag-resize, mag-index at magpakita ng mga kuha mo — at para lang gumana ang produkto para sa iyo at sa mga tao na pinagbabahaginan mo. Iyon ang buong saklaw.",
            ),
            ul(
              "Hindi namin ipinagbibili ang content mo.",
              "Hindi namin ito ginagamit para magsanay ng machine-learning model para sa iba.",
              "Hindi namin ito ipinapakita sa sinumang hindi mo pinagbahaginan.",
            ),
            h("Ang workspace ang may-ari ng talaan, hindi ang indibidwal"),
            p(
              "Ang mga kuha ay pag-aari ng workspace na pinagkunan sa kanila, hindi ng miyembro ng crew na pumindot ng shutter. Sadya ito, at ito ang nagpapanatiling matibay ng talaan ng ebidensya:",
            ),
            ul(
              "Ang pag-alis ng miyembro ay pinapanatili ang bawat litratong kinuha nila, at pinapanatili ang mga tala nila sa kasaysayan ng pagkuha.",
              "Ang pagbura ng proyekto ay hindi bumubura ng mga kuha nito.",
              "Ang miyembrong umalis ay nawawalan ng akses sa content ng workspace ngunit hindi niya ito isinasama.",
            ),
            note(
              "Kung nasa workspace ka na hindi ikaw ang may-ari at may gusto kang baguhin tungkol sa mga kuha mo, tanungin muna ang may-ari ng workspace. Para sa content na iyon, sinusunod ng GeoCliks ang tagubilin ng workspace.",
            ),
            h("Ano ang responsibilidad mo"),
            p(
              "Pinapatunayan mong may karapatan kang kunan at i-upload ang ini-upload mo — kasama ang anumang pahintulot na kailangan mula sa mga tao, may-ari ng ari-arian o operator ng site na nasa kuha. Hindi ito sinusuri ng GeoCliks para sa iyo.",
            ),
            h("Ano ang pinapatunayan ng seal, at ano ang hindi"),
            p(
              "Ang code, hash at signature sa bawat kuha ay nagpapahirap sa hindi natutuklasang panghihimasok, at nagpapahintulot sa kahit sino na tingnan kung hindi nagbago ang file kahit dumating na ito. Hindi nito ginagawang notaryo, surveyor o serbisyong legal ang GeoCliks, at walang korte, insurer o kliyenteng obligadong tanggapin ang talaan. Sa kanila palagi ang pasyang iyon.",
            ),
            see("verify/how-sealing-works", "legal/data-retention", "legal/terms-summary"),
          ],
        },
        {
          slug: "data-retention",
          title: "Gaano katagal itinatago ang data mo",
          summary:
            "Ano ang nananatili matapos ang isang binurang proyekto, isang inalis na miyembro, isang kinanselang plano, at isang isinarang workspace.",
          keywords: [
            "retention",
            "delete",
            "burahin",
            "deletion",
            "keep",
            "storage",
            "cancel",
            "kanselahin",
            "close account",
            "erase",
          ],
          body: [
            p(
              "Ang maikling bersyon: itinatago ang content ng workspace hangga't umiiral ang workspace. Halos wala nang iba ang nag-aalis nito.",
            ),
            table(
              ["Ang ginagawa mo", "Ang nangyayari sa mga kuha"],
              [
                [
                  "Burahin ang isang proyekto",
                  "Itinatago ang mga kuha. Hindi nakakabit ang talaan ng ebidensya sa proyekto.",
                ],
                [
                  "Alisin ang isang miyembro",
                  "Nananatili sa workspace ang mga litrato nila at ang mga tala nila sa kasaysayan.",
                ],
                [
                  "Burahin ang sariling account",
                  "Nawawala ang profile at mga kredensyal mo. Ang mga kuhang ginawa mo sa workspace ng iba ay nananatili sa workspace na iyon.",
                ],
                [
                  "Kanselahin ang bayad na plano",
                  "Walang nabubura. Bumababa ang workspace sa free plan at humihinto ang mga bayad na feature.",
                ],
                ["Isara ang workspace", "Nawawala ang lahat, at hindi na ito maibabalik."],
              ],
            ),
            h("Ang pagkansela ay hindi pagbura"),
            p(
              "Ang pag-downgrade o pagkansela ay hindi kailanman sumisira ng mga kuha. Nananatili sa iyo ang kasaysayan mo, at bawat photo code na naibigay na sa kliyente ay patuloy pang gumagana sa pampublikong pahina ng beripikasyon. Ang nawawala sa iyo ay ang mga feature na lampas sa limitasyon ng free — dagdag na seat, share link, ang mas mayamang format ng export.",
            ),
            h("Pagsasara ng workspace nang tuluyan"),
            p(
              "Walang self-serve na delete button para sa buong workspace, at sadya ito — masyadong madaling makasira ng talaan ng ebidensya nang hindi sinasadya.",
            ),
            steps(
              "Ang may-ari ng workspace ay nag-email sa support@geocliks.com mula sa address na nasa owner account.",
              "I-export muna ang anumang gusto mong itago — PDF, Excel, ZIP o KMZ.",
              "Kinukumpirma namin ang kahilingan, pagkatapos ay inaalis ang workspace at ang mga kuha nito.",
            ),
            warn(
              "Permanente ang pagbura ng workspace. Nawawala ang mga kuha, proyekto, report at photo code, at humihinto sa paggana ang bawat verification link na naibigay sa kliyente. Mag-export muna.",
            ),
            h("Mga backup at log"),
            p(
              "Ang mga backup at security log ay itinatago nang limitadong panahon at pagkatapos ay pinapalitan, kaya maaaring tumagal nang kaunti bago dumaan ang pagbura sa bawat kopya.",
            ),
            h("Paghingi ng sariling data"),
            p(
              "Maaari mong hilingin sa amin na ma-akses, maitama, ma-export o mabura ang personal na data mo. Marami rito ay mababago mo mismo sa profile at mga setting ng billing. Para sa iba pa, mag-email sa support@geocliks.com mula sa address na nasa account mo.",
            ),
            see(
              "legal/data-ownership",
              "plans-billing/cancel-or-downgrade",
              "legal/privacy-summary",
            ),
          ],
        },
      ],
    },
    {
      title: "Ang mga dokumentong legal",
      articles: [
        {
          slug: "privacy-summary",
          title: "Privacy Policy, sa simpleng salita",
          summary:
            "Ano ang kinokolekta ng GeoCliks, bakit, sino pa ang nakakakita nito, at ang mga pagpipilian mo. Isang buod, hindi kapalit.",
          keywords: [
            "privacy",
            "pribadong data",
            "policy",
            "gdpr",
            "personal data",
            "location",
            "lokasyon",
            "cookies",
            "rights",
          ],
          body: [
            p(
              "Ito ang simpleng pagbasa sa Privacy Policy para malaman mo ang nasa loob nito. Ang polisiya mismo ang dokumentong may bigat, at nasa geocliks.com/privacy ito.",
            ),
            h("Ano ang kinokolekta"),
            ul(
              "Data ng account: pangalan, email, isang hash ng password mo (hindi kailanman ang password), litrato sa profile, wika, tema, at ang two-factor secret mo kung ino-on mo ito.",
              "Data ng workspace: pangalan ng workspace at proyekto, mga kliyente, lokasyon, role, imbitasyon, template at report.",
              "Mga kuha: ang litrato o video kasama ang timestamp nito, mga coordinate, natumbasang address, oras ng pagkuha ng device, photo code, content hash at signature.",
              "Mga mensahe: mga direktang mensahe at broadcast sa loob ng workspace, kasama ang mga nakakabit na larawan.",
              "Data ng device: bersyon ng app, platform, IP address, push token, mga error log at pangunahing usage event.",
              "Data ng billing: ang plano mo, status ng subscription at ang mga identifier na ibinabalik ng payment processor. Hindi kailanman umaabot sa amin ang mga numero ng card.",
            ),
            note(
              "Ayaw ng GeoCliks ng mga numero ng government ID, impormasyon sa kalusugan o ibang sensitibong kategorya. Ilayo ito sa mga pangalan ng proyekto, note at mensahe.",
            ),
            h("Lokasyon at kamera"),
            p(
              "Humihingi ang app ng kamera at lokasyon dahil ang kuha ay litrato kasama ang saan at kailan. Maaari mong tanggihan ang alinmang pahintulot at tatakbo pa rin ang app — ngunit ang kuhang walang lokasyon ay walang coordinate at walang address, na halos ang buong dahilan kung bakit ito ebidensya. Binabasa ang lokasyon sa sandali ng pagkuha at para maglagay ng pin sa mapa mo. Walang pagsubaybay sa likod.",
            ),
            h("Sino pa ang nakakakita nito"),
            p(
              "Hindi ipinagbibili ang data mo at hindi kailanman ibinabahagi para sa advertising. Isang maliit na grupo ng provider ang nagpoproseso nito sa tagubilin namin: cloud hosting at storage, ang payment processor (at ang Apple para sa in-app purchase), ang email provider, ang push notification service, at ang mapping provider na tumutumbas ng mga address.",
            ),
            h("Talagang pampubliko ang mga share link"),
            p(
              "Gumagana ang mga share link at pahina ng beripikasyon para sa kahit sinong may hawak ng link, nang walang sign-in. Iyon ang punto nito. Ang pagbawi ng link ay humihinto sa akses sa hinaharap ngunit hindi na maaaring bawiin ang kopyang naka-download na ng iba.",
            ),
            h("Mga karapatan mo"),
            p(
              "Alinsunod sa batas ng lugar mo, maaari kang humiling na ma-akses, maitama, ma-export o mabura ang personal na data mo, malimitahan o matutulan ang ilang pagproseso, at mabawi ang pahintulot. Mag-email sa support@geocliks.com mula sa address na nasa account mo. Sa Canada, maaari ka rin magreklamo sa Office of the Privacy Commissioner; sa EEA o UK, sa lokal na supervisory authority mo.",
            ),
            h("Mga cookie"),
            p(
              "Ang kailangan lang ng produkto: pananatili mong naka-sign in, pag-alala sa wika at tema, at paghawak sa mga kuhang nakapila habang offline ka. Walang cookie para sa advertising o cross-site tracking.",
            ),
            note(
              "Ang Privacy Policy at Terms ay nailalathala sa Ingles lamang, at sadya ito. Ang machine translation ng tekstong legal ay maaaring magbago ng ibig sabihin nito.",
            ),
            see("legal/data-retention", "teamspace/share-links", "legal/terms-summary"),
          ],
        },
        {
          slug: "terms-summary",
          title: "Terms of Service, sa simpleng salita",
          summary:
            "Ang mga obligasyon sa dalawang panig, ang mga limitasyong hayag na sinasabi ng GeoCliks, at ang nangyayari kapag tumigil kang magbayad.",
          keywords: [
            "terms",
            "tos",
            "agreement",
            "kasunduan",
            "liability",
            "acceptable use",
            "billing",
            "seats",
          ],
          body: [
            p(
              "Isang simpleng pagbasa sa Terms. Ang dokumento sa geocliks.com/terms ang may bisa; narito ito para walang makagulat sa iyo.",
            ),
            h("Sino ang maaaring gumamit nito"),
            p(
              "Kailangang 16 taong gulang ka o mas matanda. Kung nag-sign up ka para sa isang kompanya, pinapatunayan mong pinapayagan kang tanggapin ang Terms sa pangalan nito.",
            ),
            h("Mga limitasyong hayag na sinasabi ng GeoCliks"),
            p(
              "Bihirang-tuwid ang Terms tungkol sa hindi kayang ipangako ng produkto, at mas mabuting basahin ang listahang ito kaysa maghinuha:",
            ),
            ul(
              "Ang GeoCliks ay hindi notaryo, hindi surveyor, hindi laboratoryo at hindi serbisyong legal, at walang inilalabas nito na payong legal.",
              "Ang network-verified na timestamp ay nangangahulugang naitala ng server namin kung kailan dumating ang upload — hindi na tama ang orasan ng device.",
              "Kapag ang orasan ng device ay may lamang mahigit ilang minuto sa amin, minamarkahang device-timed na lang ang kuha.",
              "Nakadepende ang kawastuhan ng lokasyon sa telepono at sa paligid nito; sa loob ng gusali at sa pagitan ng matataas na gusali, maaari itong malayo.",
              "Ang mga offline na kuha ay tinatatakang verified lamang kapag nakarating na sa mga server namin.",
              "Walang korte, insurer, kliyente o awtoridad na obligadong tanggapin ang talaan ng GeoCliks.",
            ),
            h("Ano ang pinapangako mong hindi gagawin"),
            ul(
              "Gamitin ang Serbisyo nang labag sa batas, o para manggulo, magmanman o mananakot ng kahit sino.",
              "Mag-upload ng content na wala kang karapatang i-upload.",
              "Baguhin, pekein o alisin ang isang tatak, hash, signature o photo code, o ipasang talaan ng GeoCliks ang binagong materyal.",
              "Subukin, pabigatin o guluhin ang Serbisyo, o lampasan ang mga rate limit at quota ng plano.",
              "Ipagbili muli ang Serbisyo, o ibahagi ang isang seat sa maraming tao.",
            ),
            warn(
              "Ang mga seat ay kada tao, hindi kada device. Maaaring mag-sign in ang isang miyembro ng crew sa telepono, tablet at sa web — ngunit ang dalawang taong nagbabahagi ng isang login ay lumalabag sa Terms at ginagawang walang saysay ang kasaysayan ng pagkuha, dahil ang bawat litrato ay iniuugnay sa kung sino ang may-ari ng seat.",
            ),
            h("Billing"),
            p(
              "Kusang nag-renew ang mga bayad na plano hanggang kanselahin. Ang mga subscription sa web ay binibill ng payment processor namin; ang mga subscription na binili sa loob ng iOS app ay binibill ng Apple at sumusunod sa proseso ng refund ng Apple. Hindi kasama ang buwis sa presyo. Hindi ibinabalik ang mga bayad nang nabayaran na maliban kung hinihingi ng batas.",
            ),
            p(
              "Kung nabigo ang bayad o kinansela mo, lumilipat ang workspace sa free plan at humihinto ang mga bayad na feature. Nananatili ang mga kuha mo.",
            ),
            h("Suspensyon"),
            p(
              "Maaari naming suspindihin o tapusin ang akses dahil sa paglabag sa Terms, sa paggamit na nanganganib sa Serbisyo o sa iba pang kostumer, o kung saan hinihingi ng batas. Kung makatwiran, bibigyan ka muna namin ng babala at ng pagkakataong mag-export.",
            ),
            h("Availability at liability"),
            p(
              "Walang kontraktwal na garantiya ng uptime maliban kung may hiwalay na kasunduang nakasulat kang nilagdaan sa amin. Ang Serbisyo ay ibinibigay nang as is, at ang kabuuang liability para sa anumang paghahabol ay hindi lalampas sa binayaran mo sa labindalawang buwan bago ito lumitaw. May ilang hurisdiksyong hindi pumapayag sa bahagi nito, at doon ay sumasaklaw lang ang mga limitasyong ito hanggang sa pinapayagan ng batas.",
            ),
            h("Mga pagbabago"),
            p(
              "Ang mahahalagang pagbabago sa Terms o sa Privacy Policy ay inaanunsyo sa app o sa email bago magkabisa. Ang mga tanong tungkol sa alinmang dokumento ay ipadala sa support@geocliks.com.",
            ),
            see(
              "legal/data-ownership",
              "plans-billing/seats-and-billing",
              "verify/verify-results-explained",
            ),
          ],
        },
      ],
    },
  ],
};
