import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const plansBilling: Category = {
  slug: "plans-billing",
  title: "Mga plano at billing",
  summary: "Ano ang saklaw ng bawat plano, paano ito palitan, at saan hanapin ang imboys.",
  icon: "CreditCard",
  sections: [
    {
      title: "Pagpili ng plano",
      articles: [
        {
          slug: "compare-plans",
          title: "Ihambing ang mga plano",
          summary:
            "Ano ang makukuha mo sa Free, Plus, Business, Crew 10, Crew 25 at Enterprise.",
          keywords: [
            "mga plano",
            "presyo",
            "ihambing",
            "limitasyon",
            "plans",
            "pricing",
            "compare",
            "free",
            "plus",
            "business",
            "crew",
            "limits",
          ],
          body: [
            p(
              "May dalawang pamilya ng plano. Ang mga evidence plan sa baba ay para sa pagdodokumento ng trabaho. Ang mga Delivery plan ay para sa operasyong halos pagmamaneho lang, at may sariling artikulo sila.",
            ),
            p(
              "Nasa seksyon ng presyo sa geocliks.com ang kasalukuyang presyo. Saklaw ng pahinang ito ang talagang pinapayagan ng bawat plano, at iyon ang bahaging kadalasang nakakabitag sa mga tao.",
            ),
            h("Mga evidence plan"),
            table(
              ["Plano", "Para kanino", "Upuan"],
              [
                ["Free", "Pagsubok, o pabalang-balang na solong pagdodokumento.", "1"],
                ["Plus", "Isang taong buong-panahon, nagbabahagi sa mga kliyente.", "1"],
                ["Business", "Maliit na crew na may pinagsasaluhang teamspace.", "5"],
                ["Crew 10", "Lumalaking tim.", "10"],
                ["Crew 25", "Mas malaking operasyon.", "25"],
                ["Enterprise", "Pasadyang dami at termino. Kausapin kami.", "Pasadya"],
              ],
            ),
            h("Ano ang nagbabago habang umaakyat ka"),
            table(
              ["Kakayahan", "Saan nagsisimula"],
              [
                ["Beripikadong kuha, watermark, photo code", "Free"],
                ["Walang hangganang kuha kada buwan", "Plus"],
                ["Eksport sa Excel, ZIP at KMZ", "Plus"],
                ["Mga share link", "Plus"],
                ["Walang hangganang proyekto at watermark template", "Plus"],
                ["Logo mo sa watermark", "Plus"],
                ["Buong-haba ng video clip", "Plus"],
                ["Teamspace na may inimbitang miyembro", "Business"],
                ["Mga role at access kada proyekto", "Business"],
              ],
            ),
            h("Ang Free plan nang detalyado"),
            ul(
              "300 kuha kada buwan.",
              "Limitado ang video sa 30-segundong clip, at sa unang tatlong araw lang.",
              "Tatlong proyekto, isang upuan, dalawang watermark template.",
              "Eksport sa PDF hanggang 20 litrato. Walang Excel, ZIP o KMZ.",
              "Walang teamspace, kaya walang inimbitang miyembro at walang share link.",
              "Walang delivery route.",
            ),
            note(
              "Bawat plano, kasama ang Free, ay nagbibigay ng parehong beripikasyon: parehong datos sa watermark, parehong photo code, parehong seal. Hindi bayad na upgrade ang beripikasyon.",
            ),
            h("Delivery sa mga evidence plan"),
            p(
              "Kasama sa Plus pataas ang buwanang alawans ng hinto sa delivery, kaya makakapagpatakbo ka ng ruta nang hindi lumilipat sa Delivery plan: katamtamang alawans sa Plus, mas marami sa Business, at pataas nang pataas sa Crew 10 at Crew 25. Kung araw-araw kang nagmamaneho, mas mura kada hinto ang mga Delivery plan.",
            ),
            see("plans-billing/delivery-plans", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "delivery-plans",
          title: "Mga Delivery plan",
          summary:
            "Delivery Lite, Pro, Fleet, Fleet 30, Fleet 200 at Fleet 500 — sinukat sa hinto kada buwan at sa dami ng driver.",
          keywords: [
            "delivery",
            "lite",
            "pro",
            "fleet",
            "hinto",
            "driver",
            "dispatch",
            "stops",
            "drivers",
          ],
          body: [
            p(
              "Para sa operasyong ang pagmamaneho mismo ang negosyo, hindi lang kasamang bunga nito, ang mga Delivery plan. Kasama sa kanila ang lahat ng nasa evidence plan dagdag ang higit na malaking buwanang alawans ng hinto.",
            ),
            table(
              ["Plano", "Hinto kada buwan", "Driver", "Live dispatch", "Smart optimizer"],
              [
                ["Delivery Lite", "500", "2", "Wala", "Wala"],
                ["Delivery Pro", "2,000", "5", "Meron", "Meron"],
                ["Delivery Fleet", "6,000", "15", "Meron", "Meron"],
                ["Delivery Fleet 30", "12,000", "30", "Meron", "Meron"],
                ["Delivery Fleet 200", "80,000", "200", "Meron", "Meron"],
                ["Delivery Fleet 500", "200,000", "500", "Meron", "Meron"],
              ],
            ),
            h("Ano ang dalawang naka-gate na feature"),
            ul(
              "Live dispatch — pagdagdag ng hinto sa rutang minamaneho na. Pro, Fleet, Fleet 30, Fleet 200 at Fleet 500.",
              "Smart optimizer — pagsunod-sunod ng ruta batay sa network ng kalsada, hindi ang standard solver. Pro, Fleet, Fleet 30, Fleet 200 at Fleet 500. Sa planong wala ito, ang standard optimizer ang tumatakbo, kaya nakakakuha pa rin ka ng nakasunod-sunod na ruta.",
            ),
            h("Paano makakakuha ng isa"),
            p(
              "Bawat Delivery plan ay kaya mong kunin mismo sa pahina ng billing: piliin ang plano, dumaan sa ligtas na hosted checkout, ilagay ang detalye ng card mo. Umeepekto agad ang bagong limitasyon pagkatapos. Nagsisimula ang Delivery plan sa libreng trial, kaya Free trial ang nakasulat sa button nito. Kung nasa Delivery plan na ang workspace mo, agad nang nagbibill ang pagpalit sa iba at Switch to ang nakasulat sa button — isang beses kada workspace ang trial, hindi isang beses kada plano.",
            ),
            steps(
              "Buksan ang Billing sa settings ng workspace mo.",
              "Piliin ang Delivery plan na tugma sa dami mo.",
              "Tapusin ang checkout. Ibinabalik ka sa GeoCliks na aktibo na ang alawans ng hinto.",
            ),
            warn(
              "Ang Enterprise lang ang planong hindi kaya mong kunin mismo. Talk to us ang nakasulat sa card nito kaysa button ng checkout, at bubuksan nito ang nakapuno nang email papuntang sales@geocliks.com. Walang awtomatikong kinakaltasan at walang nagbabago sa workspace mo hanggang hindi namin ito naihanda kasama ka.",
            ),
            note(
              "May-ari lang ng workspace ang makakapalit ng plano. Tao ang pinamamahalaan ng admin, hindi ang subscription.",
            ),
            h("Alin ang bagay"),
            p(
              "Bilangin ang hintong talagang nade-deliver mo sa normal na buwan, at dagdagan ng kaunting espasyo para sa pinakaabalang linggo mo. Ang paglampas sa alawans ay pumipigil sa pagbuo ng ruta hanggang sa susunod na buwan, kaya dapat saklaw ng plano ang rurok mo, hindi ang karaniwan.",
            ),
            note(
              "Binibilang ang hinto kada buwan sa kalendaryo at nagre-reset sa unang araw. Nabibilang ang hinto kapag naidagdag ito sa ruta, na-deliver man ito o hindi.",
            ),
            see("delivery-routes/delivery-overview", "plans-billing/compare-plans"),
          ],
        },
      ],
    },
    {
      title: "Pamamahala sa subscription mo",
      articles: [
        {
          slug: "upgrade-or-change-plan",
          title: "Mag-upgrade o magpalit ng plano",
          summary: "Magpalit ng plano sa pahina ng billing — ang may-ari ang gumagawa nito.",
          keywords: [
            "upgrade",
            "magpalit ng plano",
            "checkout",
            "downgrade",
            "lumipat",
            "change plan",
            "switch",
          ],
          body: [
            p(
              "Sa Billing sa settings ng workspace pinapalitan ang plano. May-ari lang ng workspace ang makakagawa nito — tao ang pinamamahalaan ng admin, hindi ang subscription.",
            ),
            h("Magpalit ng plano"),
            steps(
              "Buksan ang Billing.",
              "Piliin ang planong gusto mo.",
              "Para sa bayad na planong kaya mong kunin mismo, isasama ka sa ligtas na hosted checkout para ilagay ang detalye ng card, at ibabalik sa GeoCliks pagkatapos.",
              "Para sa Enterprise, nakapuno nang email papunta sa tim namin ang makukuha mo.",
              "Umeepekto agad ang bagong limitasyon pagdating ng pagbabago.",
            ),
            h("Paglipat sa mas malaking plano"),
            ul(
              "Agad na umeepekto ang bagong limitasyon.",
              "Walang naaapektuhan sa nakuha mo na.",
              "Agad ding nagiging available ang dagdag na upuan, kaya puwede ka nang mag-imbita ng tao pagkatapos.",
            ),
            h("Paglipat pababa"),
            p(
              "Tinatanggihan ang downgrade habang mas malaki ang workspace mo kaysa sa target na plano. Kung may walong miyembro ka at lilipat sa planong limang upuan, sasabihan kang tanggalin muna ang mga miyembro. Sadya iyon — ang alternatibo ay ang tahimik na pagputol sa tatlong tao.",
            ),
            note(
              "Ang pagpili sa Free plan, o ang muling pagpili sa planong nasa iyo na, ay hindi na dumadaan sa checkout.",
            ),
            see("plans-billing/seats-and-billing", "plans-billing/cancel-or-downgrade"),
          ],
        },
        {
          slug: "seats-and-billing",
          title: "Mga upuan",
          summary: "Ano ang upuan, ano ang gumagamit nito, at ano ang gagawin kapag naubos.",
          keywords: [
            "upuan",
            "miyembro",
            "imbitasyon",
            "limitasyon",
            "kapasidad",
            "seats",
            "members",
            "invite",
            "users",
          ],
          body: [
            p(
              "Ang upuan ay isang taong makakapag-sign in sa workspace mo. May nakapirming bilang kasama sa plano mo, at kabilang ang may-ari sa bilang na iyon.",
            ),
            h("Ano ang kumokonsumo ng upuan"),
            ul(
              "Bawat miyembro ng workspace, anuman ang role. Parehong upuan ang halaga ng field member at ng admin.",
              "Bawat nakabinbing imbitasyon, hanggang tanggapin o bawiin ito.",
            ),
            p(
              "Sadyang may hawak na upuan ang nakabinbing imbitasyon. Kung hindi, puwedeng maglabas ng sampung imbitasyon kontra sa dalawang upuan at lalampas sa plano ang lahat ng tumanggap.",
            ),
            h("Wala nang upuan"),
            steps(
              "Buksan ang Team at tingnan ang mga nakabinbing imbitasyon. Bawiin ang hindi na tatanggapin.",
              "Tanggalin ang mga miyembrong umalis na. Nananatili sa workspace ang kuha at kasaysayan nila.",
              "Kung totoong kailangan mo ng mas maraming tao, umakyat ng plano.",
            ),
            note(
              "Ang pagtanggal sa miyembro ay agad na nagpapalaya sa upuan niya at hindi kailanman nagbubura sa trabaho niya.",
            ),
            see("teamspace/invite-your-crew", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "payment-and-invoices",
          title: "Bayad at imboys",
          summary:
            "Saan nakatira ang detalye ng card, paano ito i-update, at saan kukuha ng resibo.",
          keywords: [
            "imboys",
            "resibo",
            "card",
            "bayad",
            "vat",
            "buwis",
            "billing portal",
            "invoice",
            "receipt",
            "payment",
            "tax",
          ],
          body: [
            p(
              "Ang processor namin sa bayad ang humahawak sa mga pagbabayad, hindi ang GeoCliks. Hindi kailanman iniimbak sa mga server namin ang numero ng card mo.",
            ),
            h("Mag-update ng card"),
            steps(
              "Buksan ang Billing sa settings ng workspace mo.",
              "Buksan ang billing portal.",
              "I-update doon ang paraan ng pagbabayad.",
            ),
            h("Mga imboys at resibo"),
            ul(
              "Bawat bayad ay may bumubuong imboys, na makikita sa billing portal.",
              "Ini-email ang imboys sa billing address ng subscription, na hindi laging ang login email ng may-ari — tsekin ito kung sa maling tao napupunta ang resibo.",
              "Idagdag sa portal ang pangalan ng kompanya at detalye sa buwis mo at lilitaw sila sa mga susunod na imboys.",
            ),
            h("Palyadong bayad"),
            p(
              "Muling sinusubukan ng processor ang palyadong bayad bago may magbago sa workspace mo. Kung paulit-ulit itong palya, bumabagsak ang workspace mo sa limitasyon ng Free plan — hindi bubura ang mga kuha mo, pero titigil sa paggana ang eksport, share link at teamspace hanggang magtagumpay ang bayad.",
            ),
            warn(
              "Kung nasa planong manu-manong inihanda namin para sa iyo ang workspace mo, maaaring walang portal na kaya mong gamitin mismo. Mag-email sa support@geocliks.com at aayusin namin ang imboys.",
            ),
            see("plans-billing/cancel-or-downgrade", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "cancel-or-downgrade",
          title: "Kanselahin o i-downgrade",
          summary:
            "Paano tumigil sa pagbabayad, at ano nga ba ang nangyayari sa ebidensya mo.",
          keywords: [
            "kanselahin",
            "downgrade",
            "burahin",
            "refund",
            "eksport",
            "umalis",
            "datos",
            "cancel",
            "delete",
            "export",
            "data",
          ],
          body: [
            p(
              "Puwede kang tumigil sa pagbabayad kahit kailan. Ang mahalagang tanong ay ano ang mangyayari sa trabaho, kaya nandito iyon nang prangka.",
            ),
            h("Kanselahin"),
            steps(
              "I-eksport muna ang lahat ng kakailanganin mo sa labas ng GeoCliks. Gawin ito bago kanselahin, dahil limitado ang format ng eksport sa Free plan.",
              "Paliitin ang workspace mo para kasya sa planong lilipatan mo, kung mas kaunting upuan ang pupuntahan mo.",
              "Buksan ang Billing at lumipat sa Free plan o kanselahin sa billing portal.",
            ),
            h("Ano ang mangyayari sa datos mo"),
            ul(
              "Hindi bubura ang mga kuha mo kapag nag-downgrade o nagkansela ka.",
              "Patuloy na gumagana ang beripikasyon. Tumutukoy pa rin ang photo code, at tugma pa rin ang seal.",
              "Titigil ang mga bayad na feature: eksport sa Excel, ZIP at KMZ, share link, teamspace at delivery route.",
              "Titigil sa paggana ang mga umiiral nang share link habang hindi kasama sila sa plano mo.",
              "Mawawalan ng access ang mga miyembrong lampas sa bagong bilang ng upuan, at iyon ang dahilan kung bakit hinihinging tanggalin mo muna sila sa downgrade.",
            ),
            warn(
              "Mag-eksport bago kanselahin, hindi pagkatapos. Sa Free plan, limitado ka sa PDF na hanggang 20 litrato, at hindi iyon paraan para ilabas ang isang taong trabaho.",
            ),
            h("Pagbura sa buong workspace"),
            p(
              "Hindi pagbura ang pagkansela. Kung gusto mong tuluyang matanggal ang workspace at ang media nito, mag-email sa support@geocliks.com mula sa address ng may-ari at ipakiusap ang pagbura. Hindi na ito mababawi at kukumpirmahin namin bago gawin.",
            ),
            see("legal/data-retention", "teamspace/reports-and-exports"),
          ],
        },
      ],
    },
  ],
};
