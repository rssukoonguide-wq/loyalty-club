import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions – Loyalty Club" },
      { name: "description", content: "Terms for customers and shop owners using the Loyalty Club stamp card app." },
      { property: "og:title", content: "Terms & Conditions – Loyalty Club" },
      { property: "og:description", content: "Rules for stamps, rewards, shop owner responsibility and data use." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Terms,
});

const sections: { title: string; points: string[] }[] = [
  { title: "1. ऐप का उद्देश्य", points: [
    "यह ऐप केवल एक मार्केटिंग और सेल्स प्रमोशन टूल है।",
    "ग्राहकों को दिए जाने वाले इनाम, डिस्काउंट और उससे जुड़े किसी भी स्थानीय टैक्स (यदि लागू हो) को चुकाने या मैनेज करने की पूरी जिम्मेदारी केवल दुकानदार की होगी।",
    "सॉफ्टवेयर प्रदाता किसी भी वित्तीय दावे के लिए जिम्मेदार नहीं है।",
  ]},
  { title: "2. स्टाम्प के नियम", points: [
    "दुकान पर लगा QR कोड स्कैन करने पर एक दिन में केवल एक स्टाम्प मिलेगा (भारतीय समय के अनुसार)।",
    "कार्ड पूरा करने के लिए कितने स्टाम्प चाहिए, यह दुकानदार तय करता है और बदल सकता है।",
    "स्टाम्प केवल उसी दुकान में मान्य हैं जहाँ वे मिले हैं। इन्हें दूसरी दुकान में नहीं बदला जा सकता।",
    "स्टाम्प और इनाम का कोई नकद मूल्य नहीं है और इन्हें किसी और को ट्रांसफर नहीं किया जा सकता।",
  ]},
  { title: "3. इनाम (Reward)", points: [
    "इनाम क्या होगा, कब तक मिलेगा और उसकी शर्तें क्या होंगी, यह पूरी तरह दुकानदार तय करता है।",
    "इनाम लेने के लिए ग्राहक को दुकान पर अपना पूरा कार्ड दिखाना होगा।",
    "दुकानदार बिना पहले सूचना दिए ऑफर बदल सकता है या बंद कर सकता है।",
  ]},
  { title: "4. गलत उपयोग", points: [
    "गलत मोबाइल नंबर, एक से ज़्यादा नंबर या किसी भी धोखाधड़ी से लिए गए स्टाम्प रद्द किए जा सकते हैं।",
    "ऐसा होने पर दुकानदार इनाम देने से मना कर सकता है।",
  ]},
  { title: "5. ग्राहक की जानकारी", points: [
    "हम केवल आपका नाम और मोबाइल नंबर लेते हैं, ताकि आपका स्टाम्प कार्ड चल सके।",
    "यह जानकारी केवल उसी दुकान के मालिक को दिखती है जिसकी दुकान पर आपने स्टाम्प लिया है।",
    "हम आपकी जानकारी बेचते नहीं हैं।",
  ]},
  { title: "6. दुकानदार की जिम्मेदारी", points: [
    "दुकान की जानकारी, ऑफर और ग्राहकों से किए गए वादे सही रखना दुकानदार की जिम्मेदारी है।",
    "ग्राहकों की जानकारी का उपयोग केवल लॉयल्टी प्रोग्राम के लिए करना होगा।",
    "ऐप का एक्सेस सॉफ्टवेयर प्रदाता देता है और नियम तोड़ने या भुगतान न होने पर हटा सकता है। एक्सेस हटने पर उस दुकान में नए स्टाम्प नहीं मिलेंगे।",
  ]},
  { title: "7. सेवा और जिम्मेदारी की सीमा", points: [
    "ऐप जैसा है वैसा दिया जाता है। इंटरनेट या तकनीकी समस्या से कभी-कभी सेवा रुक सकती है।",
    "किसी भी नुकसान, विवाद या दावे के लिए सॉफ्टवेयर प्रदाता जिम्मेदार नहीं होगा।",
    "ये नियम समय-समय पर बदले जा सकते हैं। ऐप का उपयोग जारी रखने का मतलब है कि आप नए नियम मानते हैं।",
  ]},
];

function Terms() {
  return (
    <AppShell>
      <div className="animate-rise pb-4">
        <div className="flex items-center gap-3">
          <FileText className="h-7 w-7 text-primary" />
          <h2 className="text-3xl font-extrabold text-foreground">Terms &amp; Conditions</h2>
        </div>
        <div className="mt-6 space-y-6">
          {sections.map((s) => (
            <section key={s.title} className="rounded-2xl bg-card p-5 shadow-soft">
              <h3 className="text-lg font-extrabold text-foreground">{s.title}</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                {s.points.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
