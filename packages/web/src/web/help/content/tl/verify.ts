import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const verify: Category = {
  slug: "verify",
  title: "Beripikasyon",
  summary:
    "Bawat kuha ay may code na matsek ninuman, at may seal na nagsasabi kung nabago ito o hindi.",
  icon: "ShieldCheck",
  sections: [
    {
      title: "Pagtsek ng isang kuha",
      articles: [
        {
          slug: "what-is-a-photo-code",
          title: "Ano ang photo code?",
          summary:
            "Ang maikling code na naka-print sa bawat kuha, at ang pampublikong pahina kung saan ito patungo.",
          keywords: [
            "code",
            "photo code",
            "beripikahin",
            "pampubliko",
            "qr",
            "pruweba",
            "verify",
            "public",
            "proof",
          ],
          body: [
            p(
              "Bawat kuha ay may natatanging code, naka-print sa watermark at dala-dala sa bawat ulat at eksport. Ganito ang hitsura:",
            ),
            ul("GC-4K7P-92XB-1DQ4"),
            p(
              "Ang code ang hawakan sa isang partikular na kuha. Sinumang may hawak nito — kliyente, insurance, adjuster, abogado — ay puwedeng hanapin ito sa pampublikong pahina ng beripikasyon nang walang account, walang app, at walang kailangang hingin sa iyo.",
            ),
            h("Saan lumalabas ang code"),
            ul(
              "Nakasunog sa watermark ng litrato o video, kung nasa template mo ito.",
              "Sa bawat pahina ng ulat na PDF.",
              "Sa eksport na Excel, isang row kada kuha.",
              "Bilang filename ng bawat imahe sa loob ng eksport na ZIP.",
              "Sa proof-of-delivery email na ipinapadala sa tatanggap ng delivery.",
            ),
            h("Bakit ito mahalaga"),
            p(
              "Ang litrato lang ay walang napapatunayan — kayang mag-edit ninuman ng timestamp sa isang imahe. Ibang uri ng ebidensya ang isang code na tumutukoy sa hiwalay na rekord sa server ng provider mo, na nagpapakita ng parehong oras, parehong koordinado at buong seal. Hindi kailangang magtiwala sa iyo ang tagatsek.",
            ),
            note(
              "Ang mga code ay isinusulat bilang GC-XXXX-XXXX-XXXX pero puwede mong itipa nang maliit na letra, may espasyo, walang prefix, o i-paste ang buong verification link. Lahat ng iyon ay tumutukoy sa parehong kuha. Ang mga kuhang naunang gawin bago ang pagpapalit ng pangalan ay may code na TM- ang unahan; beripikado pa rin ang mga iyon gaya ng dati, at gumagana pa rin ang mga code na naka-print na sa mga lumang ulat mo.",
            ),
            see("verify/verify-a-photo", "verify/how-sealing-works"),
          ],
        },
        {
          slug: "verify-a-photo",
          title: "Beripikahin ang isang litrato",
          summary:
            "Paano ka o ang kliyente mo tumsek ng code, at ano ang ipinapakita ng pahina.",
          keywords: [
            "beripikahin",
            "tsekin",
            "hanapin",
            "kliyente",
            "pampublikong pahina",
            "i-scan",
            "verify",
            "check",
            "lookup",
            "client",
          ],
          body: [
            p(
              "Pampubliko ang beripikasyon at ilang segundo lang. Ipadala ang code sa kliyente at kaya niyang gawin ito mag-isa.",
            ),
            h("Tsekin ang isang code"),
            steps(
              "Pumunta sa geocliks.com/v at ilagay ang code, o buksan ang link nang diretso.",
              "Basahin ang rekord: ang workspace na may-ari ng kuha, kailan ito kinuha, saan, at ang resulta ng integridad.",
              "Ihambing ito sa watermark ng litratong nasa harap mo. Dapat magtugma nang eksakto.",
            ),
            h("Ano ang ipinapakita ng pahina"),
            table(
              ["Field", "Kahulugan"],
              [
                ["Owner", "Ang workspace na pinagmulan ng kuha."],
                ["Captured", "Ang oras sa device nang pinindot ang shutter."],
                [
                  "Verified",
                  "Ang oras sa server nang dumating ito. Hindi maitatakda mula sa telepono.",
                ],
                ["Location", "Koordinado, kawastuan, at ang address na tinutukoy nito."],
                ["Integrity", "Kung tugma pa rin ang seal sa file at sa metadata."],
                ["Device", "Ang modelo at platform na gumamit sa pagkuha."],
                ["Content hash", "Ang fingerprint ng mga byte ng imahe."],
              ],
            ),
            h("Bakit nakatago ang imahe sa ilang pagkakataon"),
            p(
              "Palaging pampubliko ang rekord; hindi ang imahe. Ipinapakita lang ang litrato kapag may aktibong share link ang workspace mo na saklaw ang kuhang iyon. Sadya ito — ang code na kumalas mula sa isang ulat ay hindi dapat isama ang litrato sa pagkalas. Bawiin ang link at babalik sa pagiging pribado ang imahe habang matsek pa rin ang rekord.",
            ),
            note(
              "Naitatala sa kasaysayan ng kuha ang mga pampublikong beripikasyon, kaya makikita mong may tumsek sa code. Isang beses lang binibilang ang paulit-ulit na paglo-load sa loob ng kalahating oras, kaya hindi nababaon ng kliyenteng nagre-refresh ang totoong mga pangyayari.",
            ),
            see("teamspace/share-links", "verify/verify-results-explained"),
          ],
        },
        {
          slug: "verify-results-explained",
          title: "Pagbasa sa resulta",
          summary:
            "Verified, unverified, tampered, at ang ibig sabihin ng babala sa clock skew.",
          keywords: [
            "verified",
            "unverified",
            "tampered",
            "skew",
            "orasan",
            "resulta",
            "babala",
            "clock",
            "result",
            "warning",
          ],
          body: [
            p("Bawat kuha ay may isa sa tatlong resulta ng integridad."),
            table(
              ["Resulta", "Kahulugan"],
              [
                [
                  "Verified",
                  "Tugma ang seal sa file at sa metadata. Walang nabago mula nang mai-upload.",
                ],
                [
                  "Unverified",
                  "Hindi nakumpirma ang seal. Karaniwan ay kuha mula sa lumang bersyon ng app o hindi natapos na upload — hindi ito ebidensya ng pandarambong.",
                ],
                [
                  "Tampered",
                  "Hindi tugma ang seal. Binago ang file o ang metadata nito matapos ma-upload.",
                ],
              ],
            ),
            h("Pinagmulan ng oras at clock skew"),
            p(
              "Dalawang oras ang itinatala ng GeoCliks: ang oras sa device nang kunin ang litrato, at ang oras sa server nang dumating ito. Iniimbak ang agwat ng dalawa.",
            ),
            ul(
              "Sa loob ng humigit-kumulang limang minuto, network ang nakasulat na pinagmulan ng oras — normal iyon at inaasahan.",
              "Lampas doon, device ang nakasulat, at ipinapakita sa rekord ang skew.",
            ),
            p(
              "Hindi agad kahina-hinala ang malaking skew. Ang teleponong dalawang araw nang offline ay nag-a-upload nang may totoong agwat, at ipinapaliwanag ito ng skew. Ang ibig sabihin lang nito ay hindi magkasundo ang orasan ng device at ng server, at sinasabi ito ng rekord kaysa pumili ng isa nang tahimik.",
            ),
            h("Pagpapaliwanag ng resulta sa kliyente"),
            ul(
              "Verified: buo ang rekord, at iyon ang dahilan ng beripikasyon.",
              "Unverified: ialok ang orihinal mula sa workspace mo, na may buong kasaysayan pa rin.",
              "Tampered: tumigil at tingnan kung saan-saan nagdaan ang file. Huwag itong ipasa.",
            ),
            warn(
              "Ang pag-edit sa litrato sa labas ng GeoCliks — pag-crop, pag-compress, pagpapadaan sa chat app — ay nagbabago sa mga byte at sumisira sa seal. Ipadala ang orihinal mula sa workspace mo o mula sa isang ulat, hindi ang bersyong dumaan sa iba.",
            ),
            see("verify/how-sealing-works", "troubleshoot/photos-not-uploading"),
          ],
        },
        {
          slug: "how-sealing-works",
          title: "Paano gumagana ang sealing",
          summary:
            "Ang tatlong bagay na hindi kayang pekein ng device nang mag-isa, sa simpleng salita.",
          keywords: [
            "hash",
            "lagda",
            "hmac",
            "sha-256",
            "seal",
            "pakikialam",
            "seguridad",
            "signature",
            "tamper",
            "security",
          ],
          body: [
            p(
              "Hindi kailangan ang artikulong ito para gamitin ang GeoCliks. Nandito ito para sa taong nasa kabilang panig ng isang alitan na gustong malaman kung bakit dapat paniwalaan ang rekord.",
            ),
            h("1. Dalawang orasan, pareho naitala"),
            p(
              "Mula sa device ang oras ng pagkuha. Ang oras ng beripikasyon ay itinatatak ng server ng GeoCliks pagdating ng file, at walang setting sa telepono ang makakaimpluwensya rito. Iniingatan ang dalawa, kasama ang pagkakaiba. Ang pagpapalit sa orasan ng telepono ay naglilipat sa oras ng pagkuha at agad na lumalabas bilang agwat kontra sa oras sa server.",
            ),
            h("2. Fingerprint ng file"),
            p(
              "Iniimbak kasama ng rekord ang SHA-256 hash ng mga byte ng imaheng ini-upload. Baguhin ang isang pixel at hindi na tugma ang hash. Fingerprint ito, hindi kopya — walang sinasabi ito tungkol sa nilalaman ng litrato.",
            ),
            h("3. Lagda sa buong rekord"),
            p(
              "Pinagsasama sa isang nakapirming pagkakasunod-sunod ang photo code, ang workspace na may-ari, ang user na kumuha, ang lokasyon sa storage, ang dalawang timestamp, ang koordinado at ang content hash, at ito ay linalagdaan ng sikretong key na tanging server lang ang may hawak. Baguhin ang isa sa mga halagang iyon pagkatapos at hindi na tugma ang lagda, at iyon ang nagbubunga ng resultang Tampered.",
            ),
            h("Ano ang napapatunayan nito at ano ang hindi"),
            ul(
              "Napapatunayan nitong hindi nabago ang file at ang metadata nito mula nang matanggap ng GeoCliks.",
              "Napapatunayan nito ang oras ng pagdating nang hiwalay sa device.",
              "Hindi nito napapatunayan na tapat ang itinutok ng telepono. Walang sistemang kaya iyon. Ang inaalis nito ay ang posibilidad na tahimik na baguhin ang rekord pagkatapos.",
            ),
            note(
              "Ginagawa sa constant time ang paghahambing ng lagda, kaya hindi puwedeng suutin ang tsek mismo para mahulaan ang key.",
            ),
            see("verify/verify-results-explained", "legal/data-ownership"),
          ],
        },
      ],
    },
  ],
};
