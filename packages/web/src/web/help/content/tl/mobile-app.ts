import { type Category, h, note, p, see, steps, ul, warn } from "../../types";

export const mobileApp: Category = {
  slug: "mobile-app",
  title: "Mobile app",
  summary: "Kumuha ng may-watermark na litrato at video sa iPhone, iPad o Android.",
  icon: "Smartphone",
  sections: [
    {
      title: "Pagkuha ng litrato",
      articles: [
        {
          slug: "sign-in-on-mobile",
          title: "Mag-sign in sa telepono",
          summary: "Pumasok sa app at piliin ang workspace na kukunan mo.",
          keywords: [
            "login",
            "mag-login",
            "sign in",
            "mag-sign in",
            "workspace",
            "switch",
            "magpalit",
          ],
          body: [
            p(
              "Mag-sign in gamit ang parehong email at password na ginagamit mo sa website, o sa Google kung iyon ang ginamit mo nang mag-sign up.",
            ),
            h("Kung nasa mahigit isang workspace ka"),
            p(
              "Ang mga kuha mo ay palaging napupunta sa workspace na kasalukuyang bukas. Tingnan ang pangalan ng workspace sa itaas ng screen bago ka magsimulang kumuha — ang litratong napunta sa maling workspace ay kailangang burahin at kunan muli.",
            ),
            steps(
              "I-tap ang avatar mo sa sulok sa itaas.",
              "Piliin ang workspace na gusto mo.",
              "Mag-reload ang listahan ng proyekto para sa workspace na iyon.",
            ),
            h("Nananatiling naka-sign in"),
            p(
              "Pinapanatili kang naka-sign in ng app. Hindi ka nito ilalabas kapag nawalan ng signal, at hindi ito nangangailangan ng koneksyon para bumukas. Kung hinihingi ang password mo sa tuwing bubuksan mo ito, may nagbubura ng app storage sa likod ng telepono mo — tingnan ang mga setting ng battery optimisation.",
            ),
            see("troubleshoot/cant-sign-in", "mobile-app/offline-capture-and-queue"),
          ],
        },
        {
          slug: "take-a-photo",
          title: "Kumuha ng litrato",
          summary: "Ang pangunahing gawain: kunan, tatakan, i-upload.",
          keywords: ["capture", "kumuha", "camera", "kamera", "photo", "litrato", "shoot"],
          body: [
            steps(
              "Buksan ang app at piliin ang proyektong pinagtatrabahuhan mo.",
              "I-tap ang capture button.",
              "Hintaying tumigil ang indicator ng lokasyon — kadalasan sapat na ang isang sandali kapag nasa labas.",
              "I-frame ang kuha at pindutin.",
              "Magdagdag ng note kung kailangan ng paliwanag ang litrato. Nahahanap ang mga note sa search mamaya.",
            ),
            h("Ano ang lumalabas sa litrato"),
            ul(
              "Petsa at oras, sinusuri sa network time at hindi sa orasan ng telepono.",
              "Mga GPS coordinate.",
              "Ang street address na tinutumbas ng mga coordinate na iyon.",
              "Ang pangalan mo at ang proyekto, kung kasama ito sa template.",
              "Isang natatanging photo code na maaaring i-verify ng kahit sino.",
            ),
            h("Pagkuha ng magandang posisyon"),
            ul(
              "Lumabas o lumayo sa bakal at konkreto bago kumuha.",
              "Bigyan ang telepono ng ilang segundo pagkabukas ng app — ang unang fix ang pinakamabagal.",
              "Sa loob ng gusali at sa ilalim ng lupa, asahan na tantiya lang ang address. Naitatala pa rin ang mga coordinate.",
            ),
            warn(
              "Hindi mo na mababago ang oras, coordinate o address ng isang kuha pagkatapos. Kung mali ang litrato, burahin ito at kumuha ng bago.",
            ),
            see("mobile-app/watermark-templates", "troubleshoot/gps-or-address-wrong"),
          ],
        },
        {
          slug: "record-a-video",
          title: "Mag-record ng video",
          summary:
            "Na-verify na video na may parehong tatak ng litrato, hanggang sa haba ng clip na kasama sa plano mo.",
          keywords: ["video", "record", "mag-record", "clip", "film", "length", "haba"],
          body: [
            p(
              "Kapareho lang ng pagkuha ng litrato ang video: parehong watermark, parehong na-verify na oras at posisyon, parehong asal sa pag-upload. Hiwalay na button lang ito sa capture screen.",
            ),
            h("Haba ng clip ayon sa plano"),
            ul(
              "Free — 30 segundong clip, magagamit sa unang tatlong araw matapos gawin ang workspace.",
              "Plus — buong haba ng video para sa isang tao.",
              "Business, Crew 10, Crew 25 — clip na hanggang 3 minuto sa bawat seat.",
              "Mga Delivery plan — kasama ang 3 minutong clip.",
            ),
            h("Magandang pag-record"),
            ul(
              "Panatilihin ang kuha sa anumang mahalaga nang tatlong buong segundo. Hindi na magagamit bilang ebidensya ang video kapag mabilis ang pan.",
              "Ikwento ang ipinapakita mo. Bahagi ng talaan ang audio.",
              "Mag-record ng maikli at may-tinutukoy na clip kaysa isang mahabang paglalakad — mas mabilis itong mag-upload at mas madaling hanapin mamaya.",
            ),
            note(
              "Malalaki ang mga video file. Sa konektong may limitasyon sa data, hayaang mag-upload ang mga clip sa Wi-Fi sa katapusan ng araw kaysa sa cellular.",
            ),
            see("plans-billing/compare-plans", "mobile-app/photo-quality-and-storage"),
          ],
        },
        {
          slug: "offline-capture-and-queue",
          title: "Kumuha kahit walang signal",
          summary:
            "Magtrabaho kahit saan — pumipila ang mga kuha sa device at nag-upload kapag bumalik ang signal.",
          keywords: [
            "offline",
            "queue",
            "pila",
            "no signal",
            "walang signal",
            "sync",
            "upload",
            "basement",
          ],
          body: [
            p(
              "Ginawa ang GeoCliks para sa mga lugar na walang coverage. Gumagana ang lahat offline maliban sa pag-upload. Walang espesyal na mode na kailangang i-on.",
            ),
            h("Ano ang nangyayari kapag offline"),
            ul(
              "Gumagana nang normal ang kamera, ang watermark at ang GPS — hindi kailangan ng data connection ang GPS.",
              "Nasusulat sa device ang bawat kuha kasama ang tunay na oras ng pagkuha.",
              "Ipinapakita ng queue screen ang naghihintay pang mag-upload.",
              "Pagkakaroon ng koneksyon, nauubos ng sarili nito ang pila sa likod.",
            ),
            h("Ang oras sa isang offline na kuha"),
            p(
              "Ang naitalang oras ay kung kailan mo pinindot ang button, hindi kung kailan nakapag-upload ang litrato. Hindi pinapahina ng huling pag-upload ang talaan.",
            ),
            warn(
              "Huwag burahin at i-install muli ang app habang may mga kuha pang nakapila. Mawawala ang lahat ng hindi pa nakapag-upload. Tiyaking walang laman ang pila.",
            ),
            h("Kung hindi umusad ang pila"),
            ul(
              "Buksan ang app at iwan itong nakabukas sa harap nang isang minuto sa magandang koneksyon.",
              "Tiyaking naka-sign in ka pa.",
              "Tingnan kung hindi naka-low-data o battery-saver mode ang telepono, na humahadlang sa paglilipat sa likod.",
            ),
            see("troubleshoot/photos-not-uploading"),
          ],
        },
        {
          slug: "assign-capture-to-project",
          title: "Ilagay ang mga kuha sa tamang proyekto",
          summary: "Piliin ang proyekto bago kumuha, o ilipat ang litrato pagkatapos.",
          keywords: [
            "project",
            "proyekto",
            "assign",
            "move",
            "ilipat",
            "file",
            "organise",
            "ayusin",
          ],
          body: [
            p(
              "Bawat kuha ay nabibilang sa isang proyekto. Ang proyekto ang nagtatakda ng mga report, ng mapa at ng nakikita ng kliyente mo, kaya nakakatipid ng paglilinis mamaya ang pagtama nito.",
            ),
            h("Bago ka kumuha"),
            steps(
              "Buksan ang listahan ng proyekto.",
              "I-tap ang trabahong ginagawa mo. Mananatili itong napili hanggang palitan mo.",
              "Kumuha nang normal — dumidiretso na roon ang lahat.",
            ),
            h("Paglipat ng kuha pagkatapos"),
            p(
              "Maaaring ilipat ng mga Manager, Admin at ng Owner ang mga kuha sa ibang proyekto mula sa Teamspace. Ang paglipat ng litrato ay nagbabago lang ng proyektong kinabibilangan nito; hindi ginagalaw ang oras, posisyon, address at photo code, at tumutugma pa rin ang talaan ng beripikasyon.",
            ),
            note(
              "Kung palaging napupunta sa maling trabaho ang mga kuha ng crew mo, ang karaniwang dahilan ay lumang pagpili ng proyekto mula sa nakaraang araw. Sabihan silang tingnan ang pangalan ng proyekto sa capture screen tuwing umaga.",
            ),
            see("teamspace/create-a-project", "teamspace/browse-and-filter-photos"),
          ],
        },
      ],
    },
    {
      title: "Mga watermark at setting",
      articles: [
        {
          slug: "watermark-templates",
          title: "Mga watermark template",
          summary: "Pagpasyahan ang lumalabas sa bawat litrato, at ilagay ang logo mo rito.",
          keywords: [
            "watermark",
            "template",
            "logo",
            "branding",
            "stamp",
            "tatak",
            "fields",
            "mga field",
          ],
          body: [
            p(
              "Ang watermark template ay ang layout ng tatak na nakakabit sa mga kuha mo. Nakatakda ito kada workspace, kaya magkatugma ang lahat ng litrato ng bawat miyembro ng crew.",
            ),
            h("Mga field na maaari mong ipakita o itago"),
            ul(
              "Petsa at oras",
              "Mga GPS coordinate",
              "Street address",
              "Pangalan ng proyekto",
              "Ang pangalan ng kumukuha",
              "Isang malayang note o numero ng trabaho",
              "Ang logo ng kompanya mo",
            ),
            h("Pag-edit ng template"),
            steps(
              "Sa Teamspace, buksan ang Mga watermark.",
              "Pumili ng template o gumawa ng bago.",
              "I-toggle ang mga field na gusto mo at i-upload ang logo mo.",
              "I-save. Gagamitin agad ito ng mga bagong kuha; pinapanatili ng mga umiiral nang litrato ang tatak na kinuhanan sa kanila.",
            ),
            warn(
              "Ang pagbabago ng template ay hindi kailanman nagbabago sa mga litratong nakuha na. Sadya ito — hindi magiging ebidensya ang tatak na maaaring baguhin pagkatapos.",
            ),
            h("Ilang template ang nakukuha mo"),
            ul("Free — 2 template.", "Plus at pataas — lahat ng template kasama ang logo mo."),
            see("teamspace/watermark-template-library", "mobile-app/switch-template"),
          ],
        },
        {
          slug: "switch-template",
          title: "Magpalit ng template sa trabaho",
          summary: "Gumamit ng ibang tatak para sa isang kliyente o isang uri ng trabaho.",
          keywords: [
            "switch",
            "magpalit",
            "change template",
            "default",
            "per project",
            "kada proyekto",
          ],
          body: [
            p(
              "Isang template lang ang ginagamit ng karamihan sa mga team para sa lahat. Kapag kailangan mo ng iba — isang kliyenteng gusto ang sariling numero ng trabaho sa bawat litrato, o isang inspeksyong nangangailangan ng dagdag na field — magpalit sa capture screen.",
            ),
            steps(
              "Sa capture screen, i-tap ang pangalan ng template.",
              "Piliin ang template na gusto mo.",
              "Kumuha. Mananatili ang pinili hanggang ibalik mo ito.",
            ),
            note(
              "May isang default na template ang workspace mo, ginagamit kapag walang pumili ng iba. Itinatakda ng mga Manager ang default sa Teamspace sa ilalim ng Mga watermark.",
            ),
            see("teamspace/watermark-template-library"),
          ],
        },
        {
          slug: "photo-quality-and-storage",
          title: "Kalidad ng litrato at storage",
          summary:
            "Timbangin ang kalidad ng larawan kontra sa bilis ng pag-upload at storage ng telepono.",
          keywords: [
            "quality",
            "kalidad",
            "resolution",
            "storage",
            "size",
            "laki",
            "original",
            "data",
          ],
          body: [
            h("Setting ng kalidad"),
            p(
              "Ang mas mataas na kalidad ay mas mabuting ebidensya at mas mabagal na pag-upload. Para sa karamihan ng dokumentasyon, sapat na ang standard setting — nananatili itong mababasa kapag nailimbag sa report. Itaas ito kapag mahalaga ang maliliit na detalye, gaya ng manipis na bitak o serial number.",
            ),
            h("Pagtatago ng orihinal"),
            p(
              "Maaari mong ipa-save sa app ang isang orihinal na walang watermark sa camera roll mo kasama ang may-tatak na bersyon. Kapaki-pakinabang kapag kailangan mo ng malinis na larawan para sa ibang gamit. Halos dinodoble nito ang storage na ginagamit ng bawat kuha sa telepono.",
            ),
            h("Pagbawas ng espasyo"),
            ul(
              "Maaaring alisin sa device ang mga kuhang tapos nang mag-upload — nananatili ito sa Teamspace.",
              "Ang video ang pumupuno ng telepono. Alisin muna ang mga na-upload nang clip.",
              "Huwag kailanman alisin ang anumang nakapila pang i-upload.",
            ),
            see("mobile-app/offline-capture-and-queue", "mobile-app/app-settings"),
          ],
        },
        {
          slug: "notifications",
          title: "Mga notification",
          summary: "Ano ang ipinapaalam sa iyo ng app, at paano ito patahimikin.",
          keywords: [
            "notifications",
            "mga notification",
            "push",
            "alerts",
            "silence",
            "mute",
            "patahimikin",
          ],
          body: [
            h("Ano ang ipinapadala ng GeoCliks"),
            ul(
              "Tapos nang mag-upload, o nabigo ang upload at kailangan ng pansin mo.",
              "Isang direktang mensahe o broadcast mula sa opisina mo.",
              "Isang route na itinalaga sa iyo, at mga paalala habang lumalapit ka sa isang hinto.",
              "Mga imbitasyon at pagbabago ng role.",
            ),
            h("Pagbaba ng dami nito"),
            steps(
              "Buksan ang Mga setting sa app.",
              "Buksan ang Mga notification.",
              "I-off ang mga kategoryang hindi mo kailangan.",
            ),
            note(
              "Kung driver ka, iwang nakabukas ang mga notification ng route. Ginagamit ito ng dispatch para sabihin sa iyo kapag may naidagdag na hinto sa takbong nagsimula na.",
            ),
            see("troubleshoot/notifications-not-arriving"),
          ],
        },
        {
          slug: "app-settings",
          title: "Mga setting ng app",
          summary: "Wika, tema, gridline, tunog ng shutter at ang iba pa.",
          keywords: [
            "settings",
            "mga setting",
            "language",
            "wika",
            "theme",
            "tema",
            "dark mode",
            "gridlines",
            "sound",
            "tunog",
          ],
          body: [
            h("Wika"),
            p(
              "Makukuha ang GeoCliks sa 11 wika. Ang pinili mo ay para sa device na ito lamang, kaya bawat isa sa crew ay makakabasa ng app sa sariling wika sa loob ng isang workspace. Iwan ito sa default ng workspace para sumunod sa kung anuman ang pinili ng opisina.",
            ),
            h("Anyo"),
            p(
              "Makukuha ang light at dark na tema. Mas madali sa mata ang dark sa loob ng trak sa gabi; mas madaling basahin ang light sa ilalim ng tirik na araw.",
            ),
            h("Mga pantulong sa pagkuha"),
            ul(
              "Gridlines — isang grid na pang-frame sa viewfinder. Hindi ito nakukuha sa litrato.",
              "Tunog ng shutter — i-off ito para sa mga tahimik na site. Hinihingi ito ng batas sa ilang bansa at hindi maaaring i-disable doon.",
              "Save original — magtago ng kopyang walang watermark sa device.",
            ),
            h("Ang profile mo"),
            p(
              "Ang pangalan, litrato at password mo ay nasa Profile. Lumalabas ang pangalan mo sa mga kuha kapag kasama ito sa template, kaya panatilihin itong makikilala ng crew mo.",
            ),
            see("mobile-app/photo-quality-and-storage", "teamspace/roles-and-permissions"),
          ],
        },
      ],
    },
  ],
};
