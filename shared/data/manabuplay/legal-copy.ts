export type LegalLocale = "en" | "fr";

export type LegalDocumentKey = "legal" | "privacy";

export type LegalSection = {
  heading: string;
  paragraphs: readonly string[];
};

export type LegalDocument = {
  seoTitle: string;
  seoDescription: string;
  title: string;
  updatedAt: string;
  backLabel: string;
  sections: readonly LegalSection[];
};

const LEGAL_CONTACT_EMAIL = "contact@manabuplay.com";

/**
 * Éditeur juridique / responsable de traitement — source : INPI J00109697292 + Kbis RCS Tours 13/12/2024.
 * Nom commercial Senpai Surprise · entrepreneur individuel Kevin BERTAUX.
 */
export const LEGAL_PUBLISHER = {
  tradeName: "Senpai Surprise",
  entrepreneurName: "Kevin BERTAUX",
  legalFormFr: "entrepreneur individuel (micro-entreprise)",
  legalFormEn: "sole proprietor (micro-business)",
  addressFr: "4 rue Shelley, Apt 255, 37200 Tours, France",
  addressEn: "4 Shelley Street, Apt 255, 37200 Tours, France",
  siren: "938 401 767",
  siret: "938 401 767 00018",
  rcsFr: "938 401 767 R.C.S. Tours",
  rcsEn: "938 401 767 R.C.S. Tours",
  ape: "4791B",
  vatFr: "TVA non applicable — franchise en base (art. 293 B du CGI)",
  vatEn: "VAT not applicable — small business VAT exemption (French art. 293 B CGI)",
  publicationDirectorFr: "Kevin BERTAUX",
  publicationDirectorEn: "Kevin BERTAUX",
  immatriculationDateFr: "13 décembre 2024",
  immatriculationDateEn: "13 December 2024",
} as const;

function publisherIdentityFr(): string {
  return `${LEGAL_PUBLISHER.entrepreneurName}, ${LEGAL_PUBLISHER.legalFormFr}, nom commercial ${LEGAL_PUBLISHER.tradeName}`;
}

function publisherIdentityEn(): string {
  return `${LEGAL_PUBLISHER.entrepreneurName}, ${LEGAL_PUBLISHER.legalFormEn}, trading as ${LEGAL_PUBLISHER.tradeName}`;
}

const KXIS_AGENCY = {
  fr: "Kxis, agence web",
  en: "Kxis, web agency",
} as const;

/** Audience measurement — disclosed as active on the public site (Microsoft Clarity). */
const CLARITY_VENDOR = {
  fr: "Microsoft Clarity (Microsoft Corporation, One Microsoft Way, Redmond, WA 98052, États-Unis — privacy.microsoft.com).",
  en: "Microsoft Clarity (Microsoft Corporation, One Microsoft Way, Redmond, WA 98052, United States — privacy.microsoft.com).",
} as const;

const LEGAL_DOCUMENTS: Record<LegalLocale, Record<LegalDocumentKey, LegalDocument>> = {
  en: {
    legal: {
      seoTitle: "Legal notice — ManabuPlay",
      seoDescription: "Publisher, hosting, and contact information for the ManabuPlay website.",
      title: "Legal notice",
      updatedAt: "20 May 2026",
      backLabel: "Back to home",
      sections: [
        {
          heading: "Site publisher",
          paragraphs: [
            "The website manabuplay.com (the « ManabuPlay » service) is published by " +
              publisherIdentityEn() +
              ".",
            `Registered office: ${LEGAL_PUBLISHER.addressEn}.`,
            `SIREN ${LEGAL_PUBLISHER.siren} · SIRET ${LEGAL_PUBLISHER.siret} · ${LEGAL_PUBLISHER.rcsEn}.`,
            `Registered since ${LEGAL_PUBLISHER.immatriculationDateEn}. ${LEGAL_PUBLISHER.vatEn}.`,
            `Contact: ${LEGAL_CONTACT_EMAIL}.`,
          ],
        },
        {
          heading: "Publication director",
          paragraphs: [`Publication director: ${LEGAL_PUBLISHER.publicationDirectorEn}.`],
        },
        {
          heading: "Website",
          paragraphs: [`Built by ${KXIS_AGENCY.en}.`],
        },
        {
          heading: "Hosting",
          paragraphs: [
            "The site is hosted by Netlify, Inc., 512 2nd Street, Suite 200, San Francisco, CA 94107, United States.",
          ],
        },
        {
          heading: "Intellectual property",
          paragraphs: [
            "Texts, visuals, quiz content, and the ManabuPlay brand are protected. Any reproduction or reuse without prior permission is not allowed.",
          ],
        },
        {
          heading: "Liability",
          paragraphs: [
            "ManabuPlay is provided for learning and entertainment. We work to keep the service available and accurate, but we cannot guarantee uninterrupted access or error-free quiz content.",
          ],
        },
        {
          heading: "Audience measurement",
          paragraphs: [
            "The public site uses Microsoft Clarity to understand how visitors use pages (heatmaps, aggregated clicks, session replay).",
            "For details, legal basis, retention, and your choices, see the Privacy Policy (cookies and analytics section).",
          ],
        },
        {
          heading: "Personal data",
          paragraphs: ["For all personal data collected on this site, see the Privacy Policy."],
        },
      ],
    },
    privacy: {
      seoTitle: "Privacy Policy — ManabuPlay",
      seoDescription:
        "How ManabuPlay handles your email, local scores, Microsoft Clarity analytics, and technical data on the public site.",
      title: "Privacy Policy",
      updatedAt: "20 May 2026",
      backLabel: "Back to home",
      sections: [
        {
          heading: "Who is responsible?",
          paragraphs: [
            `The data controller is ${publisherIdentityEn()}, publisher of the ManabuPlay service (${LEGAL_PUBLISHER.addressEn}).`,
            `Contact for privacy requests: ${LEGAL_CONTACT_EMAIL}. You may also contact the CNIL (www.cnil.fr).`,
          ],
        },
        {
          heading: "Processors",
          paragraphs: [
            "Netlify, Inc. hosts the site and processes technical logs plus waitlist submissions sent through Netlify Forms on the production domain.",
            `${CLARITY_VENDOR.en} Clarity measures how the public site is used (pseudonymous session data). Data may be processed outside the European Union under Microsoft's terms.`,
          ],
        },
        {
          heading: "What we collect",
          paragraphs: [
            "Email updates form (production): when you submit the form on manabuplay.com, your email, page language, explicit marketing consent, and technical metadata are transmitted to Netlify Forms for delivery to us. On localhost or preview URLs, the same form may only store submissions in your browser for testing.",
            "Gameplay on your device: quiz scores and preferences may be stored locally in your browser (localStorage). This data stays on your device and is not sent to our servers by default.",
            "Audience measurement: if you accept analytics cookies, Clarity may collect pseudonymous usage signals (pages viewed, clicks, scrolls, device/browser type, session replay). We do not use Clarity to read waitlist emails or local quiz answers.",
            "Technical logs: our host may collect standard connection logs (IP address, browser type, pages visited) for security and reliability.",
          ],
        },
        {
          heading: "Why we use your email",
          paragraphs: [
            "We only use waitlist emails to send ManabuPlay news you opted into: product updates, new quiz modes, and occasional feedback requests.",
            "We do not sell your email address. We do not use it for unrelated advertising.",
          ],
        },
        {
          heading: "Legal basis and consent",
          paragraphs: [
            "Joining the list requires an explicit checkbox before submit. You can withdraw consent at any time by emailing us; we will remove your address from the list.",
            "Analytics cookies rely on your consent via the site banner. You can change your mind by clearing site data or contacting us.",
          ],
        },
        {
          heading: "How long we keep data",
          paragraphs: [
            "Waitlist emails are kept until you unsubscribe or ask for deletion, unless a longer period is required by law.",
            "Local gameplay data remains in your browser until you clear site data or we change storage in a future update.",
          ],
        },
        {
          heading: "Your rights",
          paragraphs: [
            "Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal data, and to lodge a complaint with a supervisory authority.",
            `To exercise these rights, contact ${LEGAL_CONTACT_EMAIL}.`,
          ],
        },
        {
          heading: "Cookies and analytics",
          paragraphs: [
            "Essential storage: localStorage (and similar browser storage) for quiz progress and language preference — required for the product to work on your device.",
            "Analytics (Microsoft Clarity): when enabled on the live site, Clarity may set analytics cookies or equivalent identifiers (_clck, _clsk, and related tokens) to measure audience and improve the interface. These cookies are not used for unrelated advertising.",
            "Your choice: on first visit you can accept or refuse analytics cookies via the banner. You can also clear site data in your browser or use Microsoft's documentation to limit Clarity tracking. Refusing analytics does not block the quiz or the waitlist form.",
          ],
        },
        {
          heading: "Changes",
          paragraphs: [
            "We may update this policy when the product or legal requirements change. The date at the top of the page shows the latest revision.",
          ],
        },
      ],
    },
  },
  fr: {
    legal: {
      seoTitle: "Mentions légales — ManabuPlay",
      seoDescription: "Éditeur, hébergement et contact du site ManabuPlay.",
      title: "Mentions légales",
      updatedAt: "20 mai 2026",
      backLabel: "Retour à l'accueil",
      sections: [
        {
          heading: "Éditeur du site",
          paragraphs: [
            "Le site manabuplay.com (service « ManabuPlay ») est édité par " +
              publisherIdentityFr() +
              ".",
            `Siège / établissement principal : ${LEGAL_PUBLISHER.addressFr}.`,
            `SIREN ${LEGAL_PUBLISHER.siren} · SIRET ${LEGAL_PUBLISHER.siret} · ${LEGAL_PUBLISHER.rcsFr}.`,
            `Immatriculation au RCS le ${LEGAL_PUBLISHER.immatriculationDateFr}. ${LEGAL_PUBLISHER.vatFr}.`,
            `Contact : ${LEGAL_CONTACT_EMAIL}.`,
          ],
        },
        {
          heading: "Directeur de la publication",
          paragraphs: [`Directeur de la publication : ${LEGAL_PUBLISHER.publicationDirectorFr}.`],
        },
        {
          heading: "Site web",
          paragraphs: [`Réalisation : ${KXIS_AGENCY.fr}.`],
        },
        {
          heading: "Hébergement",
          paragraphs: [
            "Le site est hébergé par Netlify, Inc., 512 2nd Street, Suite 200, San Francisco, CA 94107, États-Unis.",
          ],
        },
        {
          heading: "Propriété intellectuelle",
          paragraphs: [
            "Les textes, visuels, contenus de quiz et la marque ManabuPlay sont protégés. Toute reproduction ou réutilisation sans autorisation préalable est interdite.",
          ],
        },
        {
          heading: "Responsabilité",
          paragraphs: [
            "ManabuPlay est proposé à des fins d'apprentissage et de divertissement. Nous faisons notre possible pour maintenir le service disponible et fiable, sans garantir un accès ininterrompu ni un contenu de quiz exempt d'erreur.",
          ],
        },
        {
          heading: "Mesure d'audience",
          paragraphs: [
            "Le site public utilise Microsoft Clarity pour comprendre l'usage des pages (heatmaps, clics agrégés, enregistrement de session).",
            "Détails, base légale, durées et choix : voir la politique de confidentialité (section cookies et mesure d'audience).",
          ],
        },
        {
          heading: "Données personnelles",
          paragraphs: [
            "Pour l'ensemble des données personnelles collectées sur ce site, voir la politique de confidentialité.",
          ],
        },
      ],
    },
    privacy: {
      seoTitle: "Politique de confidentialité — ManabuPlay",
      seoDescription:
        "Comment ManabuPlay traite votre email, vos scores locaux, Microsoft Clarity et les données techniques du site public.",
      title: "Politique de confidentialité",
      updatedAt: "20 mai 2026",
      backLabel: "Retour à l'accueil",
      sections: [
        {
          heading: "Responsable du traitement",
          paragraphs: [
            `Le responsable du traitement est ${publisherIdentityFr()}, éditeur du service ManabuPlay (${LEGAL_PUBLISHER.addressFr}).`,
            `Exercer vos droits : ${LEGAL_CONTACT_EMAIL}. Réclamation possible auprès de la CNIL (www.cnil.fr).`,
          ],
        },
        {
          heading: "Sous-traitants",
          paragraphs: [
            "Netlify, Inc. héberge le site, traite les journaux techniques et reçoit les inscriptions envoyées via Netlify Forms sur le domaine de production.",
            `${CLARITY_VENDOR.fr} Clarity mesure l'usage du site public (données de session pseudonymisées). Des données peuvent être traitées hors Union européenne selon les conditions Microsoft.`,
          ],
        },
        {
          heading: "Données collectées",
          paragraphs: [
            "Formulaire d'inscription (production) : sur manabuplay.com, l'envoi transmet votre email, la langue de la page, le consentement marketing explicite et des métadonnées techniques à Netlify Forms pour nous les remettre. En local ou sur une URL de prévisualisation, le même formulaire peut ne stocker les inscriptions que dans votre navigateur pour les tests.",
            "Jeu sur votre appareil : scores et préférences peuvent être stockés localement dans votre navigateur (localStorage). Ces données restent sur votre appareil et ne sont pas envoyées à nos serveurs par défaut.",
            "Mesure d'audience : si vous acceptez les cookies analytics, Clarity peut collecter des signaux d'usage pseudonymisés (pages vues, clics, défilement, type d'appareil/navigateur, replay de session). Clarity n'est pas utilisé pour lire les emails waitlist ni les réponses de quiz locales.",
            "Journaux techniques : l'hébergeur peut enregistrer des logs de connexion standards (adresse IP, navigateur, pages consultées) pour la sécurité et la fiabilité.",
          ],
        },
        {
          heading: "Finalités de l'email",
          paragraphs: [
            "Les emails de la liste servent uniquement aux annonces ManabuPlay auxquelles vous avez consenti : mises à jour produit, nouveaux modes de quiz et demandes d'avis ponctuelles.",
            "Nous ne vendons pas votre adresse email. Nous ne l'utilisons pas pour de la publicité sans lien avec le projet.",
          ],
        },
        {
          heading: "Base légale et consentement",
          paragraphs: [
            "L'inscription exige une case à cocher explicite avant envoi. Vous pouvez retirer votre consentement à tout moment par email ; nous supprimerons votre adresse de la liste.",
            "Les cookies analytics reposent sur votre consentement via la bannière du site. Vous pouvez changer d'avis en effaçant les données du site ou en nous contactant.",
          ],
        },
        {
          heading: "Durée de conservation",
          paragraphs: [
            "Les emails de la liste sont conservés jusqu'à désinscription ou demande de suppression, sauf obligation légale contraire.",
            "Les données de jeu locales restent dans votre navigateur jusqu'à effacement des données du site ou évolution future du stockage.",
          ],
        },
        {
          heading: "Vos droits",
          paragraphs: [
            "Selon votre situation, vous pouvez disposer d'un droit d'accès, de rectification, d'effacement, de limitation du traitement et d'un recours auprès d'une autorité de contrôle.",
            `Pour les exercer : ${LEGAL_CONTACT_EMAIL}.`,
          ],
        },
        {
          heading: "Cookies et mesure d'audience",
          paragraphs: [
            "Stockage essentiel : localStorage (et stockage navigateur équivalent) pour la progression quiz et la langue — nécessaire au fonctionnement du produit sur votre appareil.",
            "Analytics (Microsoft Clarity) : sur le site en ligne, Clarity peut déposer des cookies analytics ou identifiants équivalents (_clck, _clsk, etc.) pour mesurer l'audience et améliorer l'interface. Pas de publicité tierce sans lien avec le projet.",
            "Votre choix : à la première visite, une bannière permet d'accepter ou de refuser les cookies analytics. Vous pouvez aussi effacer les données du site dans votre navigateur ou consulter la documentation Microsoft pour limiter le suivi Clarity. Refuser les analytics ne bloque ni le quiz ni le formulaire d'inscription.",
          ],
        },
        {
          heading: "Évolutions",
          paragraphs: [
            "Cette politique peut être mise à jour si le produit ou le cadre légal évolue. La date en tête de page indique la dernière révision.",
          ],
        },
      ],
    },
  },
};

export function getLegalDocument(locale: LegalLocale, key: LegalDocumentKey): LegalDocument {
  return LEGAL_DOCUMENTS[locale][key];
}

export { LEGAL_CONTACT_EMAIL };
