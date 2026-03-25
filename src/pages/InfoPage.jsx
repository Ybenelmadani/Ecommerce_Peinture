import React from "react";
import { Link, useParams } from "react-router-dom";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import Button from "../components/ui/Button";
import Container from "../components/layout/Container";
import { STORE_CITY, STORE_NAME, STORE_SUPPORT_EMAIL, STORE_SUPPORT_PHONE } from "../config/store";
import { useI18n } from "../context/I18nContext";
import aboutExteriorMain from "../assets/about/20260323_122150.jpg";
import aboutExteriorDisplay from "../assets/about/20260323_122157.jpg";
import aboutInteriorSupplies from "../assets/about/20260323_122211.jpg";
import aboutInteriorPaintWall from "../assets/about/20260323_122220.jpg";

const STORE_MAP_QUERY = encodeURIComponent(STORE_CITY);
const STORE_MAP_EMBED_URL = `https://www.google.com/maps?q=${STORE_MAP_QUERY}&z=15&output=embed`;
const STORE_MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${STORE_MAP_QUERY}`;

function buildInfoContent(ui) {
  return {
    "terms-conditions": {
      title: ui.termsTitle,
      lead: ui.termsLead.replace("{store}", STORE_NAME),
      sections: [ui.terms1, ui.terms2, ui.terms3],
    },
    "privacy-policy": {
      title: ui.privacyTitle,
      lead: ui.privacyLead,
      sections: [ui.privacy1, ui.privacy2, ui.privacy3],
    },
    "cookie-policy": {
      title: ui.cookieTitle,
      lead: ui.cookieLead,
      sections: [ui.cookie1, ui.cookie2],
    },
    "help-advice": { title: ui.helpTitle, lead: ui.helpLead },
    "shipping-tax": {
      title: ui.shippingTitle,
      lead: ui.shippingLead,
      sections: [ui.shipping1, ui.shipping2, ui.shipping3],
    },
    "service-updates": { title: ui.serviceTitle, lead: ui.serviceLead },
    returns: {
      title: ui.returnsTitle,
      lead: ui.returnsLead,
      sections: [ui.returns1, ui.returns2, ui.returns3],
    },
    contact: {
      title: ui.contactTitle,
      lead: ui.contactLead,
      sections: [`Phone: ${STORE_SUPPORT_PHONE}`, `Email: ${STORE_SUPPORT_EMAIL}`, `Location: ${STORE_CITY}`],
    },
    "product-guides": { title: ui.productGuidesTitle, lead: ui.productGuidesLead },
    reviews: { title: ui.reviewsTitle, lead: ui.reviewsLead },
    "price-match": { title: ui.priceMatchTitle, lead: ui.priceMatchLead },
    "gift-vouchers": { title: ui.giftVouchersTitle, lead: ui.giftVouchersLead },
    "reward-points": { title: ui.rewardPointsTitle, lead: ui.rewardPointsLead },
    "about-artstore": {
      title: ui.aboutTitle.replace("{store}", STORE_NAME),
      lead: ui.aboutLead,
      sections: [ui.about1.replace("{store}", STORE_NAME), ui.about2],
      missionTitle: ui.aboutMissionTitle,
      missionBody: ui.aboutMissionBody,
      offerTitle: ui.aboutOfferTitle,
      offerItems: ui.aboutOfferItems,
      visionTitle: ui.aboutVisionTitle,
      visionBody: ui.aboutVisionBody,
      pillars: ui.aboutPillars,
      stats: ui.aboutStats,
    },
    "art-blog": { title: ui.artBlogTitle, lead: ui.artBlogLead },
    publications: { title: ui.publicationsTitle, lead: ui.publicationsLead },
    "art-classes": { title: ui.artClassesTitle, lead: ui.artClassesLead },
    events: { title: ui.eventsTitle, lead: ui.eventsLead },
    "expert-coaching": { title: ui.expertCoachingTitle, lead: ui.expertCoachingLead },
    webinars: { title: ui.webinarsTitle, lead: ui.webinarsLead },
  };
}

export default function InfoPage() {
  const { slug = "" } = useParams();
  const { pick } = useI18n();
  const ui = pick({
    fr: {
      infoLabel: "Infos {store}",
      backHome: "Retour a l'accueil",
      defaultTitle: "Information",
      defaultLead: "La page d'information demandee arrive bientot.",
      default1: "Cette page pour {store} est en cours de finalisation.",
      default2: "Pour une aide urgente, contactez {email} ou {phone}.",
      termsTitle: "Conditions generales",
      termsLead: "Consultez les conditions qui encadrent les achats, l'utilisation et les services sur {store}.",
      terms1: "Les commandes sont soumises a la disponibilite du stock et a la validation finale par la boutique.",
      terms2: "Les prix, promotions, details de livraison et conditions de retour doivent correspondre au dernier accord commercial.",
      terms3: "Pour tout litige ou besoin de clarification, contactez le support client avant de confirmer la commande.",
      privacyTitle: "Politique de confidentialite",
      privacyLead: "Decouvrez comment nous collectons, utilisons et protegeons vos donnees personnelles.",
      privacy1: "Les donnees personnelles servent uniquement a la gestion du compte, au traitement des commandes, a la livraison et au support client.",
      privacy2: "Les operations sensibles comme la reinitialisation du mot de passe et l'acces au compte sont protegees par des parcours authentifies.",
      privacy3: "Le texte legal final doit etre valide avant la mise en ligne publique.",
      cookieTitle: "Politique de cookies",
      cookieLead: "Comprenez comment les cookies sont utilises pour ameliorer votre navigation.",
      cookie1: "Les cookies servent a maintenir les sessions actives et a conserver des preferences utiles comme le panier invite.",
      cookie2: "Les cookies d'analyse ou publicitaires ne doivent etre actives qu'apres validation du dispositif de suivi.",
      helpTitle: "Aide et conseils",
      helpLead: "Obtenez des conseils pratiques avant et apres votre achat.",
      shippingTitle: "Livraison et taxes",
      shippingLead: "Estimations de livraison, frais de port et informations fiscales.",
      shipping1: "Les frais de livraison sont calcules et affiches clairement au paiement avant la confirmation de commande.",
      shipping2: "Les delais dependent de la destination, du stock disponible et de la validation de la commande.",
      shipping3: "Les informations fiscales doivent etre alignees avec les regles comptables du business avant le lancement.",
      serviceTitle: "Mises a jour du service",
      serviceLead: "Dernieres mises a jour de la plateforme et des livraisons.",
      returnsTitle: "Retours",
      returnsLead: "Comprenez les conditions d'eligibilite, les delais et le processus de remboursement.",
      returns1: "L'eligibilite au retour depend de l'etat du produit, du delai de retour et de la preuve d'achat.",
      returns2: "Les articles ouverts ou personnalises peuvent necessiter un traitement particulier selon la politique du magasin.",
      returns3: "Les remboursements et echanges doivent etre valides manuellement par le support jusqu'a definition du flux final.",
      contactTitle: "Contact",
      contactLead: "Contactez notre service client pour toute aide sur les commandes ou le compte.",
      contactPhone: "Telephone",
      contactEmail: "Email",
      contactLocation: "Adresse du magasin",
      contactMapTitle: "Trouver le magasin",
      contactMapDescription: "Visualisez l'emplacement du magasin et ouvrez l'itineraire en un clic.",
      contactOpenMap: "Ouvrir dans Google Maps",
      productGuidesTitle: "Guides produits",
      productGuidesLead: "Trouvez des recommandations pour choisir le bon materiel artistique.",
      reviewsTitle: "Avis",
      reviewsLead: "Decouvrez les retours partages par les artistes et les acheteurs.",
      priceMatchTitle: "Alignement des prix",
      priceMatchLead: "Demandez une revision du prix si vous trouvez une offre equivalente moins chere.",
      giftVouchersTitle: "Cartes cadeaux",
      giftVouchersLead: "Achetez et utilisez des cartes cadeaux pour amis, etudiants et equipes.",
      rewardPointsTitle: "Points de fidelite",
      rewardPointsLead: "Cumulez des points et debloquez des avantages sur les commandes eligibles.",
      aboutTitle: "A propos de {store}",
      aboutLead: "Basee a Marrakech, {store} accompagne artistes, etudiants et amateurs avec une selection exigeante de fournitures creatives.",
      about1: "Chaque produit est choisi pour soutenir toutes les etapes du parcours artistique, de l'initiation aux projets professionnels.",
      about2: "Notre mission est de rendre la creativite accessible a tous, en proposant des outils fiables et inspirants pour la peinture, le dessin, la calligraphie et les arts manuels. En reunissant des marques reconnues et des materiaux adaptes aux besoins locaux, nous contribuons a faire de Marrakech un veritable carrefour de l'expression artistique.",
      aboutMissionTitle: "Notre mission",
      aboutMissionBody: "Notre mission est de rendre la creation plus accessible grace a une offre coherente de materiel artistique, adaptee aussi bien aux debuts qu'aux pratiques confirmees. Nous souhaitons proposer les bons outils, au bon moment, dans une experience d'achat claire, inspiree et professionnelle.",
      aboutOfferTitle: "Ce que nous proposons",
      aboutOfferItems: [
        "Beaux-arts: acrylique, huile, aquarelle, gouache et peintures techniques pour differents usages artistiques.",
        "Dessin et calligraphie: stylos, encres, marqueurs, supports d'exercice et outils de precision.",
        "Papeterie creative et design: papiers, carnets, sketchbooks et essentiels pour techniques mixtes.",
        "Marques locales et internationales: des references reconnues completees par des selections adaptees aux artistes au Maroc."
      ],
      aboutVisionTitle: "Notre vision",
      aboutVisionBody: "Nous voyons Marrakech comme un carrefour vivant de creation. En accompagnant les artistes avec des fournitures fiables et une offre selectionnee avec soin, {store} entend contribuer a une culture visuelle plus exigeante, plus accessible et plus dynamique a travers le Maroc.",
      aboutPillars: [
        {
          title: "Ancre a Marrakech",
          body: "Notre identite s'inspire de l'energie artistique de la ville, a la croisee de l'artisanat, du design et de l'expression contemporaine."
        },
        {
          title: "Choix soigneusement selectionne",
          body: "Chaque gamme est retenue pour sa qualite, sa regularite et sa pertinence pour les artistes, les etudiants et les passionnes."
        },
        {
          title: "Un lieu pour creer",
          body: "Au-dela de la vente, nous concevons la boutique comme un espace de rencontre entre outils, idees et elan creatif."
        }
      ],
      aboutStats: [
        { value: "Marrakech", label: "Ancrage local" },
        { value: "Beaux-arts", label: "Univers principal" },
        { value: "Calligraphie", label: "Savoir-faire valorise" },
        { value: "Mix marques", label: "Selections locales & internationales" }
      ],
      artBlogTitle: "Blog art",
      artBlogLead: "Actualites, tutoriels et inspiration de notre equipe editoriale.",
      publicationsTitle: "Publications",
      publicationsLead: "Parcourez des ressources telechargeables et des publications editoriales.",
      artClassesTitle: "Cours d'art",
      artClassesLead: "Trouvez des cours debutants et avances en ligne et en presentiel.",
      eventsTitle: "Evenements",
      eventsLead: "Prochaines demonstrations, expositions et evenements en magasin.",
      expertCoachingTitle: "Coaching expert",
      expertCoachingLead: "Reservez un accompagnement pratique avec des mentors artistiques experimentes.",
      webinarsTitle: "Webinaires",
      webinarsLead: "Rejoignez des sessions gratuites ou premium autour des outils et techniques.",
    },
    en: {
      infoLabel: "{store} Info",
      backHome: "Back home",
      defaultTitle: "Information",
      defaultLead: "The requested information page is available soon.",
      default1: "This page for {store} is being finalized.",
      default2: "For urgent help, contact {email} or {phone}.",
      termsTitle: "Terms & Conditions",
      termsLead: "Read the terms that govern purchases, usage, and services on {store}.",
      terms1: "Orders are subject to stock availability and final validation by the store.",
      terms2: "Prices, promotions, shipping details, and return conditions must match the latest commercial agreement.",
      terms3: "For any dispute or clarification, contact customer support before confirming the order.",
      privacyTitle: "Privacy Policy",
      privacyLead: "Learn how we collect, use, and protect your personal data.",
      privacy1: "Personal data is used only for account management, order processing, delivery, and customer support.",
      privacy2: "Sensitive operations such as password reset and account access are protected by authenticated flows.",
      privacy3: "Any final legal wording should be validated before public launch.",
      cookieTitle: "Cookie Policy",
      cookieLead: "Understand how cookies are used to improve your browsing experience.",
      cookie1: "Cookies are used to keep sessions active and preserve useful store preferences such as the guest cart.",
      cookie2: "Analytics or advertising cookies should only be enabled once the client validates the tracking setup.",
      helpTitle: "Help & Advice",
      helpLead: "Get practical guidance before and after your purchase.",
      shippingTitle: "Shipping & Tax",
      shippingLead: "Delivery estimates, shipping fees, and tax information.",
      shipping1: "Shipping fees are calculated and displayed clearly during checkout before order confirmation.",
      shipping2: "Delivery times depend on destination, stock availability, and order validation.",
      shipping3: "Tax details should be aligned with the accounting rules used by the business before go-live.",
      serviceTitle: "Service Updates",
      serviceLead: "Latest platform and delivery status updates.",
      returnsTitle: "Returns",
      returnsLead: "Understand return eligibility, deadlines, and refund process.",
      returns1: "Return eligibility depends on product condition, return window, and proof of purchase.",
      returns2: "Opened or customized items may require special handling depending on the store policy.",
      returns3: "Refunds and exchanges should be validated manually by support until the client defines the exact workflow.",
      contactTitle: "Contact",
      contactLead: "Reach our customer service team for order or account support.",
      contactPhone: "Phone",
      contactEmail: "Email",
      contactLocation: "Store address",
      contactMapTitle: "Find the store",
      contactMapDescription: "See the store location and open directions in one click.",
      contactOpenMap: "Open in Google Maps",
      productGuidesTitle: "Product Guides",
      productGuidesLead: "Find recommendations to choose the right art materials.",
      reviewsTitle: "Reviews",
      reviewsLead: "Discover feedback shared by artists and buyers.",
      priceMatchTitle: "Price Match",
      priceMatchLead: "Request a price review when you find an equivalent lower offer.",
      giftVouchersTitle: "Gift Vouchers",
      giftVouchersLead: "Buy and redeem vouchers for friends, students, and teams.",
      rewardPointsTitle: "Reward Points",
      rewardPointsLead: "Collect points and unlock benefits on eligible orders.",
      aboutTitle: "About {store}",
      aboutLead: "Based in Marrakech, Adwart Art serves artists, students, and creative enthusiasts with a carefully considered selection of art supplies designed to support every stage of the creative journey.",
      about1: "{store} is dedicated to fine art, drawing, calligraphy, and creative practice. We curate dependable, inspiring tools that allow our customers to work with confidence, whether they are discovering a new discipline or refining an established professional routine.",
      about2: "Our store brings together paints, paper, brushes, inks, surfaces, and studio essentials within a space designed to feel like a true creative destination: welcoming, organized, and visually rich.",
      aboutMissionTitle: "Our Mission",
      aboutMissionBody: "Our mission is to make creativity more accessible through a thoughtful range of art materials that supports both first steps and advanced practice. We aim to provide the right tools at the right moment through an experience that feels clear, professional, and genuinely helpful.",
      aboutOfferTitle: "What We Offer",
      aboutOfferItems: [
        "Fine art supplies: acrylics, oils, watercolors, gouache, and specialty paints for varied artistic practices.",
        "Drawing and calligraphy tools: pens, inks, markers, practice materials, and precision essentials.",
        "Creative paper and design materials: papers, sketchbooks, and mixed-media foundations.",
        "Local and international brands: trusted names paired with selections tailored to artists in Morocco."
      ],
      aboutVisionTitle: "Our Vision",
      aboutVisionBody: "We see Marrakech as a thriving center of creativity. By supporting artists with reliable supplies and a carefully selected assortment, {store} aims to encourage artistic expression, nurture talent, and contribute to a stronger creative culture across Morocco.",
      aboutPillars: [
        {
          title: "Rooted in Marrakech",
          body: "Our identity is shaped by the city's creative rhythm, where craft traditions, design, and contemporary expression meet."
        },
        {
          title: "Carefully selected range",
          body: "Every collection is chosen for quality, consistency, and relevance for artists, students, and curious makers."
        },
        {
          title: "A place to create",
          body: "Beyond retail, we see the store as a meeting point between tools, ideas, and the motivation to create."
        }
      ],
      aboutStats: [
        { value: "Marrakech", label: "Local home base" },
        { value: "Fine Art", label: "Core specialty" },
        { value: "Calligraphy", label: "Creative focus" },
        { value: "Brand mix", label: "Local & international picks" }
      ],
      artBlogTitle: "Art Blog",
      artBlogLead: "News, tutorials, and inspiration from our editorial team.",
      publicationsTitle: "Publications",
      publicationsLead: "Browse downloadable resources and editorial publications.",
      artClassesTitle: "Art Classes",
      artClassesLead: "Find beginner and advanced classes online and in-person.",
      eventsTitle: "Events",
      eventsLead: "Upcoming live demos, exhibitions, and store events.",
      expertCoachingTitle: "Expert Coaching",
      expertCoachingLead: "Book practical guidance with experienced art mentors.",
      webinarsTitle: "Webinars",
      webinarsLead: "Join free and premium sessions about tools and techniques.",
    },
    ar: {
      infoLabel: "معلومات {store}",
      backHome: "العودة للرئيسية",
      defaultTitle: "معلومة",
      defaultLead: "صفحة المعلومات المطلوبة ستكون متاحة قريبًا.",
      default1: "هذه الصفحة الخاصة بـ {store} قيد الإعداد.",
      default2: "للمساعدة العاجلة، تواصل مع {email} أو {phone}.",
      termsTitle: "الشروط والأحكام",
      termsLead: "اقرأ الشروط التي تنظم الشراء والاستخدام والخدمات على {store}.",
      terms1: "الطلبات تخضع لتوفر المخزون والموافقة النهائية من المتجر.",
      terms2: "يجب أن تتوافق الأسعار والعروض وتفاصيل الشحن وشروط الإرجاع مع آخر اتفاق تجاري.",
      terms3: "لأي نزاع أو استفسار، تواصل مع خدمة العملاء قبل تأكيد الطلب.",
      privacyTitle: "سياسة الخصوصية",
      privacyLead: "تعرف على كيفية جمع واستخدام وحماية بياناتك الشخصية.",
      privacy1: "تستخدم البيانات الشخصية فقط لإدارة الحساب ومعالجة الطلبات والتوصيل وخدمة العملاء.",
      privacy2: "العمليات الحساسة مثل إعادة تعيين كلمة المرور والوصول إلى الحساب محمية بمسارات مصادقة.",
      privacy3: "يجب مراجعة الصياغة القانونية النهائية قبل الإطلاق العام.",
      cookieTitle: "سياسة ملفات تعريف الارتباط",
      cookieLead: "افهم كيف تُستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح.",
      cookie1: "تُستخدم ملفات تعريف الارتباط للحفاظ على الجلسات وحفظ تفضيلات المتجر مثل سلة الزائر.",
      cookie2: "يجب تفعيل ملفات التحليلات أو الإعلانات فقط بعد اعتماد إعداد التتبع.",
      helpTitle: "مساعدة ونصائح",
      helpLead: "احصل على إرشادات عملية قبل الشراء وبعده.",
      shippingTitle: "الشحن والضرائب",
      shippingLead: "تقديرات التوصيل ورسوم الشحن والمعلومات الضريبية.",
      shipping1: "يتم احتساب رسوم الشحن وعرضها بوضوح أثناء الدفع قبل تأكيد الطلب.",
      shipping2: "تعتمد مدة التوصيل على الوجهة وتوفر المخزون وتأكيد الطلب.",
      shipping3: "يجب مواءمة التفاصيل الضريبية مع القواعد المحاسبية المعتمدة قبل الإطلاق.",
      serviceTitle: "تحديثات الخدمة",
      serviceLead: "آخر تحديثات المنصة وحالة التوصيل.",
      returnsTitle: "المرتجعات",
      returnsLead: "تعرف على شروط الإرجاع والمواعيد وآلية الاسترداد.",
      returns1: "تعتمد أهلية الإرجاع على حالة المنتج وفترة الإرجاع وإثبات الشراء.",
      returns2: "قد تتطلب المنتجات المفتوحة أو المخصصة معالجة خاصة حسب سياسة المتجر.",
      returns3: "يجب اعتماد عمليات الاسترداد والاستبدال يدويًا من الدعم حتى يتم تحديد المسار النهائي.",
      contactTitle: "اتصل بنا",
      contactLead: "تواصل مع خدمة العملاء لدينا للدعم المتعلق بالطلبات أو الحساب.",
      contactPhone: "الهاتف",
      contactEmail: "البريد الإلكتروني",
      contactLocation: "عنوان المتجر",
      contactMapTitle: "العثور على المتجر",
      contactMapDescription: "اعرض موقع المتجر وافتح الاتجاهات بنقرة واحدة.",
      contactOpenMap: "افتح في Google Maps",
      productGuidesTitle: "أدلة المنتجات",
      productGuidesLead: "اعثر على توصيات لاختيار المواد الفنية المناسبة.",
      reviewsTitle: "المراجعات",
      reviewsLead: "اكتشف آراء الفنانين والمشترين.",
      priceMatchTitle: "مطابقة السعر",
      priceMatchLead: "اطلب مراجعة السعر عندما تجد عرضًا مماثلًا بسعر أقل.",
      giftVouchersTitle: "قسائم الهدايا",
      giftVouchersLead: "اشتر واستخدم القسائم للأصدقاء والطلاب والفرق.",
      rewardPointsTitle: "نقاط المكافآت",
      rewardPointsLead: "اجمع النقاط وافتح مزايا في الطلبات المؤهلة.",
      aboutTitle: "حول {store}",
      aboutLead: "من مراكش، يرافق {store} الفنانين والطلبة والهواة عبر مستلزمات مختارة بعناية تلهم الخيال وتدعم كل مرحلة من الرحلة الإبداعية.",
      about1: "يختص {store} في الفنون الجميلة والرسم والخط والهوايات الإبداعية. نحن نختار أدوات موثوقة وملهمة تساعد كل عميل على الإبداع بثقة، سواء كان في بدايته أو يعمل بمستوى احترافي.",
      about2: "يجمع متجرنا بين الألوان والأوراق والفرش والأحبار والأسطح واللوازم الفنية داخل فضاء صُمم ليشبه وجهة إبداعية حقيقية: دافئ، عملي، ومليء بالطاقة البصرية.",
      aboutMissionTitle: "مهمتنا",
      aboutMissionBody: "أن نجعل الإبداع أكثر سهولة من خلال توفير تشكيلة مدروسة من المواد الفنية، من البدايات الأولى إلى المشاريع الأكثر طموحاً. نريد أن نقدم الأدوات المناسبة في الوقت المناسب ضمن تجربة واضحة وملهمة ومفيدة فعلاً.",
      aboutOfferTitle: "ماذا نقدم",
      aboutOfferItems: [
        "مستلزمات الفنون الجميلة: أكريليك، زيتي، ألوان مائية، غواش، وألوان متخصصة.",
        "أدوات الرسم والخط: أقلام، أحبار، ماركر، أوراق تدريب، وأدوات دقيقة.",
        "مواد الورق والتصميم: أوراق، دفاتر رسم، ومستلزمات تقنيات مختلطة.",
        "علامات محلية وعالمية: أسماء موثوقة إلى جانب اختيارات مناسبة للفنانين في المغرب."
      ],
      aboutVisionTitle: "رؤيتنا",
      aboutVisionBody: "نرى مراكش مركزاً نابضاً بالإبداع. ومن خلال دعم الفنانين بمستلزمات موثوقة وتشكيلة متوازنة، يسعى {store} إلى تشجيع التعبير الفني ورعاية المواهب والمساهمة في ثقافة إبداعية أقوى في المغرب.",
      aboutPillars: [
        {
          title: "متجذرون في مراكش",
          body: "هويتنا تتشكل من إيقاع المدينة الإبداعي، حيث تلتقي الحرف التقليدية مع التصميم والتعبير المعاصر."
        },
        {
          title: "اختيار منتقى بعناية",
          body: "كل مجموعة يتم اختيارها بناء على الجودة والثبات ومدى ملاءمتها للفنانين والطلبة والهواة."
        },
        {
          title: "مكان من أجل الإبداع",
          body: "ننظر إلى المتجر كمساحة تجمع بين الأدوات والأفكار والرغبة في الإنجاز، وليس فقط كنقطة بيع."
        }
      ],
      aboutStats: [
        { value: "مراكش", label: "الانطلاق المحلي" },
        { value: "الفنون الجميلة", label: "التخصص الرئيسي" },
        { value: "الخط", label: "محور إبداعي" },
        { value: "مزج علامات", label: "اختيارات محلية وعالمية" }
      ],
      artBlogTitle: "مدونة الفن",
      artBlogLead: "أخبار ودروس وإلهام من فريقنا التحريري.",
      publicationsTitle: "المنشورات",
      publicationsLead: "تصفح موارد قابلة للتنزيل ومنشورات تحريرية.",
      artClassesTitle: "دروس الفن",
      artClassesLead: "اعثر على دروس للمبتدئين والمتقدمين عبر الإنترنت أو حضوريًا.",
      eventsTitle: "الفعاليات",
      eventsLead: "العروض والمعارض والفعاليات القادمة في المتجر.",
      expertCoachingTitle: "توجيه الخبراء",
      expertCoachingLead: "احجز إرشادًا عمليًا مع مرشدين فنيين ذوي خبرة.",
      webinarsTitle: "الندوات",
      webinarsLead: "انضم إلى جلسات مجانية ومدفوعة حول الأدوات والتقنيات.",
    },
  });

  const content = buildInfoContent(ui);
  const info = content[slug] || {
    title: ui.defaultTitle,
    lead: ui.defaultLead,
    sections: [
      ui.default1.replace("{store}", STORE_NAME),
      ui.default2.replace("{email}", STORE_SUPPORT_EMAIL).replace("{phone}", STORE_SUPPORT_PHONE),
    ],
  };
  const isContactPage = slug === "contact";
  const isAboutPage = slug === "about-artstore";
  const contactItems = [
    { key: "phone", label: ui.contactPhone, value: STORE_SUPPORT_PHONE, href: `tel:${STORE_SUPPORT_PHONE.replace(/\s+/g, "")}`, icon: Phone, dir: "ltr" },
    { key: "email", label: ui.contactEmail, value: STORE_SUPPORT_EMAIL, href: `mailto:${STORE_SUPPORT_EMAIL}`, icon: Mail, dir: "ltr" },
    { key: "location", label: ui.contactLocation, value: STORE_CITY, href: STORE_MAP_LINK, icon: MapPin },
  ];
  const aboutGallery = [
    aboutExteriorMain,
    aboutExteriorDisplay,
    aboutInteriorSupplies,
    aboutInteriorPaintWall,
  ];

  return (
    <Container className="py-14">
      <div className={`mx-auto rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-10 ${isContactPage || isAboutPage ? "max-w-6xl" : "max-w-3xl"}`}>
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{ui.infoLabel.replace("{store}", STORE_NAME)}</div>
        <h1 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">{info.title}</h1>
        <p className="mt-4 text-slate-600">{info.lead}</p>

        {isContactPage ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.25fr]">
            <div className="space-y-4">
              {contactItems.map(({ key, label, value, href, icon: Icon, dir }) => (
                <a
                  key={key}
                  href={href}
                  target={key === "location" ? "_blank" : undefined}
                  rel={key === "location" ? "noreferrer" : undefined}
                  className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 transition hover:border-slate-300 hover:bg-white"
                >
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</span>
                    <span className="mt-2 block text-base font-semibold text-slate-900" dir={dir}>
                      {value}
                    </span>
                  </span>
                </a>
              ))}

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                <div className="text-sm font-semibold text-slate-900">{ui.contactMapTitle}</div>
                <p className="mt-2 text-sm text-slate-600">{ui.contactMapDescription}</p>
                <a
                  href={STORE_MAP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-slate-700"
                >
                  {ui.contactOpenMap}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{STORE_NAME}</div>
                  <div className="mt-1 text-sm text-slate-500">{STORE_CITY}</div>
                </div>
                <a
                  href={STORE_MAP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  aria-label={ui.contactOpenMap}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <iframe
                title={`${STORE_NAME} map`}
                src={STORE_MAP_EMBED_URL}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[420px] w-full border-0"
              />
            </div>
          </div>
        ) : isAboutPage ? (
          <div className="mt-10 space-y-10">
            <div className="space-y-3">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                {ui.infoLabel.replace("{store}", STORE_NAME)}
              </div>
              <h2 className="text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
                {ui.aboutTitle.replace("{store}", STORE_NAME)}
              </h2>
              <div className="h-1.5 w-40 bg-violet-500 md:w-56" />
            </div>

            <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="overflow-hidden bg-slate-100">
                <img src={aboutExteriorMain} alt={`${STORE_NAME} storefront`} className="h-full w-full object-cover" />
              </div>
              <div className="pt-2">
                <h3 className="text-3xl font-black leading-tight text-slate-900 md:text-5xl">
                  Creativity starts with a place that understands artists.
                </h3>
                <p className="mt-6 text-base leading-8 text-slate-700 md:text-lg">
                  {info.lead.replace("{store}", STORE_NAME)}
                </p>
                <p className="mt-5 text-base leading-8 text-slate-600">
                  {(info.sections || [])[0]}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {(info.stats || []).map((stat) => (
                <div key={`${stat.value}-${stat.label}`} className="border-t-4 border-violet-500 bg-slate-50 px-5 py-6">
                  <div className="text-xl font-black text-slate-900">{stat.value}</div>
                  <div className="mt-2 text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="overflow-hidden bg-slate-100">
                <img src={aboutExteriorDisplay} alt={`${STORE_NAME} entrance display`} className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{info.missionTitle}</div>
                <h3 className="mt-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl">
                  Materials chosen for beginners, professionals, and everyone in between.
                </h3>
                <p className="mt-6 text-base leading-8 text-slate-700 md:text-lg">{info.missionBody}</p>
                <div className="mt-8 grid gap-4">
                  {(info.offerItems || []).map((item) => (
                    <div key={item} className="border-l-4 border-violet-500 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{info.visionTitle}</div>
                <h3 className="mt-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl">
                  Building a creative home for Marrakech’s artists and makers.
                </h3>
                <p className="mt-6 text-base leading-8 text-slate-700 md:text-lg">
                  {String(info.visionBody || "").replace("{store}", STORE_NAME)}
                </p>
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {(info.pillars || []).map((pillar) => (
                    <div key={pillar.title} className="bg-white px-1 py-2">
                      <div className="text-lg font-bold text-slate-900">{pillar.title}</div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{pillar.body}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="overflow-hidden bg-slate-100">
                <img src={aboutInteriorPaintWall} alt={`${STORE_NAME} interior paints`} className="h-full w-full object-cover" />
              </div>
            </div>

            <div className="grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="overflow-hidden bg-slate-100">
                <img src={aboutInteriorSupplies} alt={`${STORE_NAME} interior supplies`} className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Inside the store</div>
                <h3 className="mt-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl">
                  A space designed to make discovery feel immediate.
                </h3>
                <p className="mt-6 text-base leading-8 text-slate-700 md:text-lg">
                  From entrance displays to walls of color and shelves of paper, brushes, inks, and studio essentials,
                  the store is built to help customers move naturally between inspiration and action.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {aboutGallery.slice(0, 3).map((image, index) => (
                    <div key={image} className="overflow-hidden bg-slate-100">
                      <img src={image} alt={`${STORE_NAME} gallery ${index + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-3 text-slate-600">
            {(info.sections || []).map((section) => (
              <p key={section}>{section}</p>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link to="/">
            <Button>{ui.backHome}</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
