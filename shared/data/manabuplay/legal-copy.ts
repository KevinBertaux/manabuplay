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

const LEGAL_DOCUMENTS: Record<LegalLocale, Record<LegalDocumentKey, LegalDocument>> = {
  en: {
    legal: {
      seoTitle: "Legal notice — ManabuPlay",
      seoDescription: "Publisher, hosting, and contact information for the ManabuPlay website.",
      title: "Legal notice",
      updatedAt: "19 May 2026",
      backLabel: "Back to home",
      sections: [
        {
          heading: "Site publisher",
          paragraphs: [
            "ManabuPlay is an independent project published by Kxis.",
            `For any question about this site or your personal data, write to ${LEGAL_CONTACT_EMAIL}.`,
          ],
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
          heading: "Related pages",
          paragraphs: [
            "See also the Privacy Policy for how we handle emails collected through the updates form.",
          ],
        },
      ],
    },
    privacy: {
      seoTitle: "Privacy Policy — ManabuPlay",
      seoDescription:
        "How ManabuPlay handles your email, local scores, and cookies when you use the public site.",
      title: "Privacy Policy",
      updatedAt: "19 May 2026",
      backLabel: "Back to home",
      sections: [
        {
          heading: "Who is responsible?",
          paragraphs: [
            "Kxis publishes ManabuPlay and acts as the data controller for information collected on this public site.",
            `Contact: ${LEGAL_CONTACT_EMAIL}.`,
          ],
        },
        {
          heading: "What we collect",
          paragraphs: [
            "Email updates form: if you join the list, we collect your email address, the language shown on the page, and technical submission metadata handled by our form provider (Netlify Forms).",
            "Gameplay on your device: quiz scores and preferences may be stored locally in your browser (localStorage). This data stays on your device and is not sent to our servers by default.",
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
          heading: "Cookies and similar technologies",
          paragraphs: [
            "The public site does not rely on advertising cookies. Essential browser storage is used for quiz progress and language preference.",
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
      updatedAt: "19 mai 2026",
      backLabel: "Retour à l'accueil",
      sections: [
        {
          heading: "Éditeur du site",
          paragraphs: [
            "ManabuPlay est un projet indépendant édité par Kxis.",
            `Pour toute question sur ce site ou vos données personnelles : ${LEGAL_CONTACT_EMAIL}.`,
          ],
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
          heading: "Pages associées",
          paragraphs: [
            "Consultez aussi la politique de confidentialité pour la collecte d'emails via le formulaire d'actus.",
          ],
        },
      ],
    },
    privacy: {
      seoTitle: "Politique de confidentialité — ManabuPlay",
      seoDescription:
        "Comment ManabuPlay traite votre email, vos scores locaux et les données techniques du site public.",
      title: "Politique de confidentialité",
      updatedAt: "19 mai 2026",
      backLabel: "Retour à l'accueil",
      sections: [
        {
          heading: "Responsable du traitement",
          paragraphs: [
            "Kxis édite ManabuPlay et est responsable des données collectées sur ce site public.",
            `Contact : ${LEGAL_CONTACT_EMAIL}.`,
          ],
        },
        {
          heading: "Données collectées",
          paragraphs: [
            "Formulaire d'actus : si vous vous inscrivez, nous collectons votre adresse email, la langue affichée sur la page et les métadonnées techniques gérées par notre prestataire de formulaires (Netlify Forms).",
            "Jeu sur votre appareil : scores et préférences peuvent être stockés localement dans votre navigateur (localStorage). Ces données restent sur votre appareil et ne sont pas envoyées à nos serveurs par défaut.",
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
          heading: "Cookies et technologies similaires",
          paragraphs: [
            "Le site public ne repose pas sur des cookies publicitaires. Le stockage navigateur sert au quiz et à la préférence de langue.",
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
