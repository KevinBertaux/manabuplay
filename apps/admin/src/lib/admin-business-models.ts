type Localized = { fr: string; en: string };

export type PricingCellTone = "free" | "premium" | "shared" | "open";

export interface PricingRow {
  group: Localized;
  label: Localized;
  tooltip: Localized;
  status: "framed" | "to-frame";
  target: Localized;
  note?: Localized;
  free: { text: Localized; tone: PricingCellTone };
  premium: { text: Localized; tone: PricingCellTone };
}

export function getBusinessCoreProblem(): Localized {
  return {
    fr: "Le coeur gratuit est deja fort. Si on ne borne pas mieux le free, Stripe vendra une offre artificielle au lieu d'une vraie profondeur de produit.",
    en: "The free core is already strong. If we do not bound free more clearly, Stripe will sell an artificial offer instead of real product depth.",
  };
}

export function getPremiumLibraryModel() {
  return {
    title: { fr: "Bibliotheque premium", en: "Premium library" },
    kicker: { fr: "Modele retenu", en: "Selected model" },
    score: 88,
    summary: {
      fr: "Le free garde le Quotidien et une vraie decouverte. Le premium vend la profondeur : plus de packs, plus d'archives, plus de contenu et plus de confort d'usage.",
      en: "Free keeps Daily and real discovery. Premium sells depth: more packs, more archives, more content, and more usage comfort.",
    },
    whyNow: {
      fr: "C'est le seul modele qui rend Stripe OTP credible assez tot sans casser le moteur de retour du Quotidien.",
      en: "It is the only model that makes Stripe OTP credible early enough without breaking the Daily retention loop.",
    },
    timing: {
      fr: "Pas de Stripe en v0.1. Cible plausible : quand 8 a 12 packs solides existent et que la boucle free tient vraiment. Fenetre probable : v0.6 -> v1.0.",
      en: "No Stripe in v0.1. Plausible target: once 8 to 12 strong packs exist and the free loop is clearly working. Likely window: v0.6 -> v1.0.",
    },
  };
}

export function getPricingRows(): PricingRow[] {
  return [
    {
      group: { fr: "Quiz", en: "Quiz" },
      label: { fr: "Quotidien", en: "Daily" },
      tooltip: {
        fr: "Le quiz du jour, identique pour tout le monde, avec une seule date et une vraie logique de rendez-vous.",
        en: "The daily quiz, identical for everyone, with one date and a real recurring rendezvous loop.",
      },
      status: "framed",
      target: { fr: "v0.1", en: "v0.1" },
      note: { fr: "Doit rester gratuit.", en: "Must stay free." },
      free: { text: { fr: "complet", en: "full" }, tone: "shared" },
      premium: { text: { fr: "complet", en: "full" }, tone: "shared" },
    },
    {
      group: { fr: "Quiz", en: "Quiz" },
      label: { fr: "Partage score", en: "Score sharing" },
      tooltip: {
        fr: "Un partage sans spoiler pour montrer le résultat d'une session, surtout utile sur le Quotidien.",
        en: "Spoiler-free sharing for showing a session result, mostly useful for Daily.",
      },
      status: "framed",
      target: { fr: "v0.1", en: "v0.1" },
      free: { text: { fr: "oui", en: "yes" }, tone: "shared" },
      premium: { text: { fr: "oui", en: "yes" }, tone: "shared" },
    },
    {
      group: { fr: "Quiz", en: "Quiz" },
      label: { fr: "Hints / explanation", en: "Hints / explanation" },
      tooltip: {
        fr: "Les indices et la petite explication qui aident a comprendre pourquoi la bonne reponse est la bonne.",
        en: "Hints and the short explanation that help users understand why the correct answer is correct.",
      },
      status: "framed",
      target: { fr: "v0.1", en: "v0.1" },
      free: { text: { fr: "oui", en: "yes" }, tone: "shared" },
      premium: { text: { fr: "oui", en: "yes" }, tone: "shared" },
    },
    {
      group: { fr: "Quiz", en: "Quiz" },
      label: { fr: "Archives", en: "Archives" },
      tooltip: {
        fr: "Les anciens Quotidiens rejouables par date, sans partage dans un premier temps.",
        en: "Past Daily quizzes replayable by date, without sharing at first.",
      },
      status: "framed",
      target: { fr: "v0.1", en: "v0.1" },
      note: { fr: "Cadré : 30 jours free.", en: "Framed: 30 days free." },
      free: { text: { fr: "30 jours", en: "30 days" }, tone: "free" },
      premium: { text: { fr: "toutes", en: "all" }, tone: "premium" },
    },
    {
      group: { fr: "Quiz", en: "Quiz" },
      label: { fr: "Libre · difficultés", en: "Practice · difficulties" },
      tooltip: {
        fr: "Les 4 recettes du mode Libre : Facile, Standard, Difficile et Expert.",
        en: "The 4 Practice-mode recipes: Easy, Standard, Hard, and Expert.",
      },
      status: "framed",
      target: { fr: "v0.1", en: "v0.1" },
      note: { fr: "Cadré : 4 difficultés free.", en: "Framed: 4 difficulties free." },
      free: { text: { fr: "4 free", en: "4 free" }, tone: "free" },
      premium: { text: { fr: "4 free", en: "4 free" }, tone: "shared" },
    },
    {
      group: { fr: "Rétention", en: "Retention" },
      label: { fr: "Streak simple", en: "Simple streak" },
      tooltip: {
        fr: "Le compteur de jours consecutifs sur le Quotidien, sans couche sociale ou meta plus profonde au debut.",
        en: "The consecutive-day Daily counter, without deeper social or meta layers at first.",
      },
      status: "framed",
      target: { fr: "v0.2+", en: "v0.2+" },
      free: { text: { fr: "oui", en: "yes" }, tone: "shared" },
      premium: { text: { fr: "oui", en: "yes" }, tone: "shared" },
    },
    {
      group: { fr: "Catalogue", en: "Catalog" },
      label: { fr: "Mots accessibles", en: "Accessible words" },
      tooltip: {
        fr: "Le volume de vocabulaire jouable dans l'offre, en comptant les mots réellement disponibles au public.",
        en: "The amount of vocabulary playable in the offer, counting the words actually available to the public.",
      },
      status: "framed",
      target: { fr: "v0.1", en: "v0.1" },
      note: { fr: "Cadré : 150 free en v0.1, reste payant.", en: "Framed: 150 free in v0.1, rest paid." },
      free: { text: { fr: "150", en: "150" }, tone: "free" },
      premium: {
        text: { fr: "150 + bibliothèque complète", en: "150 + full library" },
        tone: "premium",
      },
    },
    {
      group: { fr: "Catalogue", en: "Catalog" },
      label: { fr: "Packs accessibles", en: "Accessible packs" },
      tooltip: {
        fr: "Les packs de contenu complets visibles et jouables, pas juste quelques mots éparpillés.",
        en: "The complete content packs users can see and play, not just a few scattered words.",
      },
      status: "framed",
      target: { fr: "v0.1", en: "v0.1" },
      note: { fr: "Cadré : 5 free, reste payant.", en: "Framed: 5 free, rest paid." },
      free: { text: { fr: "5", en: "5" }, tone: "free" },
      premium: {
        text: { fr: "5 + tous les packs premium", en: "5 + all premium packs" },
        tone: "premium",
      },
    },
    {
      group: { fr: "Catalogue", en: "Catalog" },
      label: { fr: "Thèmes de packs", en: "Pack themes" },
      tooltip: {
        fr: "Groupes de packs utilisés pour organiser le catalogue, orienter l'utilisateur et rendre une zone de contenu plus désirable qu'une liste plate de packs. Exemple pressenti : JRPG avec JRPG essentiels, Combat & Boss, Classes/armes/équipement.",
        en: "Groups of packs used to organize the catalog, guide users, and make a content area more desirable than a flat pack list. Expected example: JRPG with JRPG Essentials, Combat & Boss, Classes/Weapons/Equipment.",
      },
      status: "to-frame",
      target: { fr: "v0.2+", en: "v0.2+" },
      note: {
        fr: "Valeur catalogue / découverte. Cible free : 2 thèmes gratuits, dont JRPG en premier.",
        en: "Catalog / discovery value. Free target: 2 free themes, starting with JRPG.",
      },
      free: { text: { fr: "2 thèmes gratuits", en: "2 free themes" }, tone: "free" },
      premium: {
        text: { fr: "tous les thèmes premium", en: "all premium themes" },
        tone: "premium",
      },
    },
    {
      group: { fr: "Progression", en: "Progression" },
      label: { fr: "Progression détaillée", en: "Detailed progression" },
      tooltip: {
        fr: "Des statistiques plus fines que le simple streak : avancee par pack, difficulte, taux de reussite, etc.",
        en: "Stats deeper than a simple streak: progress by pack, difficulty, success rate, and more.",
      },
      status: "framed",
      target: { fr: "v0.2+", en: "v0.2+" },
      free: { text: { fr: "non", en: "no" }, tone: "open" },
      premium: { text: { fr: "oui", en: "yes" }, tone: "premium" },
    },
    {
      group: { fr: "Progression", en: "Progression" },
      label: { fr: "Historique complet", en: "Full history" },
      tooltip: {
        fr: "L'historique des sessions jouees et des resultats, pas juste le dernier quiz ou la serie en cours.",
        en: "The history of played sessions and results, not just the last quiz or current streak.",
      },
      status: "framed",
      target: { fr: "v0.2+", en: "v0.2+" },
      free: { text: { fr: "non", en: "no" }, tone: "open" },
      premium: { text: { fr: "oui", en: "yes" }, tone: "premium" },
    },
    {
      group: { fr: "Confort d’apprentissage", en: "Learning comfort" },
      label: { fr: "TTS", en: "TTS" },
      tooltip: {
        fr: "Lecture audio des mots ou reponses, utile pour ajouter une couche pronunciation sans refaire tout le produit.",
        en: "Audio playback for words or answers, useful for adding a pronunciation layer without rebuilding the whole product.",
      },
      status: "framed",
      target: { fr: "v0.6", en: "v0.6" },
      free: { text: { fr: "non", en: "no" }, tone: "open" },
      premium: { text: { fr: "oui", en: "yes" }, tone: "premium" },
    },
    {
      group: { fr: "Confort d’apprentissage", en: "Learning comfort" },
      label: { fr: "Révision ciblée", en: "Targeted review" },
      tooltip: {
        fr: "Une revision orientee vers les mots, tiers ou themes qui posent probleme a l'utilisateur.",
        en: "Review focused on the words, tiers, or themes the user struggles with.",
      },
      status: "framed",
      target: { fr: "v0.3+", en: "v0.3+" },
      free: { text: { fr: "non", en: "no" }, tone: "open" },
      premium: { text: { fr: "oui", en: "yes" }, tone: "premium" },
    },
    {
      group: { fr: "Compte utilisateur", en: "User account" },
      label: { fr: "Compte standard", en: "Standard account" },
      tooltip: {
        fr: "Le compte normal attendu : email/login, profil minimal, preferences, langue, securite de base, acces a la newsletter et gestion du compte.",
        en: "The expected normal account: email/login, minimal profile, preferences, language, basic security, newsletter access, and account management.",
      },
      status: "framed",
      target: { fr: "v1.0", en: "v1.0" },
      note: {
        fr: "A garder free : un compte ne doit pas être le paywall.",
        en: "Keep free: an account should not be the paywall.",
      },
      free: {
        text: {
          fr: "email, profil, préférences, newsletter",
          en: "email, profile, preferences, newsletter",
        },
        tone: "shared",
      },
      premium: { text: { fr: "idem", en: "same" }, tone: "shared" },
    },
    {
      group: { fr: "Compte utilisateur", en: "User account" },
      label: { fr: "Fonctions compte étendues", en: "Extended account features" },
      tooltip: {
        fr: "Les fonctions qui exploitent vraiment le compte : sync multi-appareil, restauration d'historique, progression sauvegardée, favoris, erreurs, objectifs et préférences avancées.",
        en: "The account features that carry real value: multi-device sync, restored history, saved progression, favorites, errors, goals, and advanced preferences.",
      },
      status: "to-frame",
      target: { fr: "v1.0+", en: "v1.0+" },
      note: {
        fr: "Candidat premium : vend la mémoire produit, pas le droit de se connecter.",
        en: "Premium candidate: sells product memory, not the right to sign in.",
      },
      free: { text: { fr: "sync légère à cadrer", en: "light sync to frame" }, tone: "open" },
      premium: {
        text: { fr: "sync avancée + mémoire complète", en: "advanced sync + full memory" },
        tone: "premium",
      },
    },
    {
      group: { fr: "Compte utilisateur", en: "User account" },
      label: { fr: "Export / favoris", en: "Export / favorites" },
      tooltip: {
        fr: "Le fait de sauvegarder des mots ou d'exporter une selection pour revision externe.",
        en: "The ability to save words or export a selection for external review.",
      },
      status: "to-frame",
      target: { fr: "v1.x+", en: "v1.x+" },
      note: {
        fr: "Bon candidat premium, mais pas nécessaire en v0.1.",
        en: "Likely premium, but not needed in v0.1.",
      },
      free: { text: { fr: "à cadrer", en: "to frame" }, tone: "open" },
      premium: { text: { fr: "probablement oui", en: "likely yes" }, tone: "open" },
    },
    {
      group: { fr: "Social", en: "Social" },
      label: { fr: "Comparaison amis", en: "Friend comparison" },
      tooltip: {
        fr: "Une couche sociale légère pour se comparer à des amis ou proches, sans devenir un réseau social complet.",
        en: "A light social layer for comparing with friends, without turning into a full social network.",
      },
      status: "to-frame",
      target: { fr: "v1.x+", en: "v1.x+" },
      note: {
        fr: "Plutôt levier de rétention que moteur de paiement.",
        en: "More of a retention lever than a payment driver.",
      },
      free: { text: { fr: "à cadrer", en: "to frame" }, tone: "open" },
      premium: { text: { fr: "plutôt non", en: "likely no" }, tone: "open" },
    },
    {
      group: { fr: "Rétention", en: "Retention" },
      label: { fr: "Objectifs hebdo", en: "Weekly goals" },
      tooltip: {
        fr: "Des objectifs simples et récurrents pour structurer l'usage hebdomadaire au-delà du seul Quotidien.",
        en: "Simple recurring goals that structure weekly usage beyond Daily alone.",
      },
      status: "to-frame",
      target: { fr: "v1.0+", en: "v1.0+" },
      note: { fr: "Cohérent avec progression premium.", en: "Coherent with premium progression." },
      free: { text: { fr: "à cadrer", en: "to frame" }, tone: "open" },
      premium: { text: { fr: "probablement oui", en: "likely yes" }, tone: "open" },
    },
    {
      group: { fr: "Catalogue", en: "Catalog" },
      label: { fr: "Collections événementielles", en: "Event collections" },
      tooltip: {
        fr: "Des collections temporaires ou saisonnières liées à un événement, une actu ou une campagne éditoriale.",
        en: "Temporary or seasonal collections tied to an event, a trend, or an editorial campaign.",
      },
      status: "to-frame",
      target: { fr: "v1.x+", en: "v1.x+" },
      note: {
        fr: "Très compatible avec la logique bibliothèque premium.",
        en: "Very compatible with premium-library logic.",
      },
      free: { text: { fr: "à cadrer", en: "to frame" }, tone: "open" },
      premium: { text: { fr: "probablement oui", en: "likely yes" }, tone: "open" },
    },
    {
      group: { fr: "Confort d’apprentissage", en: "Learning comfort" },
      label: { fr: "Mode révision des erreurs", en: "Wrong-answer review mode" },
      tooltip: {
        fr: "Un mode qui regroupe les erreurs de l'utilisateur pour les retravailler de façon dédiée.",
        en: "A mode that gathers the user's wrong answers for dedicated review.",
      },
      status: "to-frame",
      target: { fr: "v0.6+", en: "v0.6+" },
      note: {
        fr: "Très compatible avec premium plus tard.",
        en: "Very compatible with premium later.",
      },
      free: { text: { fr: "à cadrer", en: "to frame" }, tone: "open" },
      premium: { text: { fr: "probablement oui", en: "likely yes" }, tone: "open" },
    },
  ];
}

export function getPricingStatusLabel(status: "framed" | "to-frame"): Localized {
  switch (status) {
    case "framed":
      return { fr: "cadré", en: "framed" };
    case "to-frame":
    default:
      return { fr: "à cadrer", en: "to frame" };
  }
}
