import React, { useContext } from "react";
import { GamemodeName, MapName } from "../partials/Map";
import { Language, LanguageContext } from "./Language";

export const locales = ["en", "fr"];

export type PropsWithLocation = {
  location?: string | Partial<Location>;
};

export interface Texts {
  current: string;
  header: {
    vip: string;
    vote: string;
    stats: string;
    dashboard: string,
    vips: string
    chatlogs: string
  };
  stats: {
    title: string;
    subtitle: string;
    description: string;
    today: {
      title: string;
    };
    yesterday: {
      title: string;
    };
    average: {
      title: string;
    };
  };
  index: {
    title: string;
    subtitle: string;
    description: string;
    join: string;
    vote: {
      title: string;
      description: string;
      timeleft: string;
      ended: string;
      votenow: string;
      maplist: {
        current: string;
        next: string;
        description: string;
      };
    };
  };
  vip: {
    title: string;
    subtitle: string;
    explanation: {
      help: string;
      activation: string;
      alive: string;
    };
    benefits: {
      title: string;
      list: Array<{
        name: string;
        description: string;
      }>;
    };
    price: {
      title: string;
      list: Array<string>;
    };
    send: {
      title: string;
      details: string;
      link: string;
      help: string;
      pseudo: string;
      refund: string;
      contacts: {
        discord: Array<string>;
        battlelog: Array<string>;
      };
    };
  };
  vote: {
    title: string;
    subtitle: string;
    current: string;
    instructions: string;
    limit: (count: number) => string;
    saved: string;
    saving: string;
    notsaved: string;
    ended: string;
    checkResults: string;
    results: string;
    static: string;
    vote: (count: number) => string;
    resultMaps: (count: number) => string;
    noRedundancy: string;
    details: {
      target: string;
    };
    deleteThisVote: string;
  };
  maps: {
    [key in MapName]: string;
  };
  shortmaps: {
    [key in MapName]: string;
  };
  gamemodes: {
    [key in GamemodeName]: string;
  };
  countdown: {
    day: string;
    days: string;
    hour: string;
    hours: string;
    minute: string;
    minutes: string;
    second: string;
    seconds: string;
    and: string;
  };
  error404: {
    notFound: string;
    backToMenu: string;
  };
}

// Dictionary of translations
const translations: {
  [key: string]: Texts;
} = {
  fr: {
    current: "fr",
    header: {
      vip: "Obtenez votre VIP",
      vote: "Vote",
      stats: "Statistiques",
      dashboard: "Panneau de contrôle",
      vips: "Gestion des Vips",
      chatlogs: "Historique du chat"
    },
    stats: {
      title: "Statistiques",
      subtitle: "Polygon",
      description: "Quelques statistiques sur l'activité du serveur",
      today: {
        title: "Aujourd'hui"
      },
      yesterday: {
        title: "Hier"
      },
      average: {
        title: "En moyenne"
      }
    },
    index: {
      title: "Polygon",
      subtitle: "Le nouveau server Conquête Large en 64 joueurs",
      description: "Rejoins nos batailles de grande envergure, participe à la communautée et hisses toi au sommet du classement",
      join: "Rejoindre",
      vote: {
        title: "Votez pour vos cartes",
        description: "Votez pour les cartes que vous souhaitez jouer<br />VOUS pouvez choisir où vous combatterez la semaine prochaine",
        timeleft: "Temps restant pour voter",
        ended: "Vote terminé !",
        votenow: "Votez Maintenant !",
        maplist: {
          current: "Cartes actuelles",
          next: "La Semaine Prochaine",
          description: "Les cartes changent toutes les semaines, en fonction des votes de la communautée"
        }
      }
    },
    error404: {
      notFound: "Page introuvable",
      backToMenu: "Retourner à la page d'accueil"
    },
    vip: {
      title: "Aidez le serveur",
      subtitle: "Avec un VIP Slot",
      explanation: {
        help: "Vous pouvez aider ce serveur en achetant un VIP Slot",
        activation: "Après reception du paiement, votre VIP Slot sera activé dès que possible",
        alive: "Toutes les donations permettent de garder le serveur en ligne"
      },
      price: {
        title: "Prix d'un VIP Slot",
        list: ["1 Mois : 3 Euros", "3 Mois : 7 Euros", "1 An : 25 Euros"]
      },
      send: {
        title: "Achetez un VIP Slot",
        details: "Envoyez nous votre donation PayPal et votre <b>pseudo BF4</b>",
        link: "PayPal",
        pseudo: 'Entrez votre pseudo dans le champ "Message" lors du virement PayPal, sinon, nous ne pourrons pas vous donner votre VIP !',
        refund: "Les contributions VIP sont considérées comme des donations et ne pourront faire l'objet d'un remboursement",
        help: "Si vous avez besoin d'aide, contactez nous :",
        contacts: {
          discord: ["Xarlion#0852", "VolterVajt#9721", "Sevenser#2359"],
          battlelog: ["Xarlion_", "VolterVajt", "Sevenser68"]
        }
      },
      benefits: {
        title: "Bénéfices d'un VIP Slot",
        list: [
          {
            name: "Slot réservé",
            description: "Pas de file d'attente, vous pouvez rejoindre n'importe quand SANS attendre<br />(Les joueurs non-VIP seront kick lorsque le serveur est complet)"
          },
          {
            name: "Triple pouvoir de vote",
            description: "Votre vote pour la prochaine carte sera compté 3 fois"
          },
          {
            name: "Donne moi les rênes",
            description: "Obtenez le rôle de chef d'escouade en utilisant la commande !lead<br />Menez votre équipe à la victoire"
          },
          {
            name: "Rééquilibrage manuel",
            description: "Changez d'équipe et renversez le cours de la bataille avec la commande !switchme"
          },
          {
            name: "Marre de courir ?",
            description: "Réapparaissez rapidement sans faire baisser votre ratio avec la commande !killme"
          },
          {
            name: "Whitelist pour l'équilibrage",
            description: "L'équilibrage automatique ne vous touchera pas"
          },
          {
            name: "Whitelist pour le kick de ping",
            description: "Vous ne serez pas kick si votre ping est trop élevé"
          }
        ]
      }
    },
    maps: {
      MP_Abandoned: "Zavod 311",
      MP_Damage: "Barrage de Lancang",
      MP_Flooded: "Zone Inondée",
      MP_Journey: "Train de Golmud",
      MP_Naval: "Tempête aux Paracels",
      MP_Prison: "Opération Verrous",
      MP_Resort: "Tourisme à Hainan",
      MP_Siege: "Siège de Shanghai",
      MP_TheDish: "Transmission Pirate",
      MP_Tremors: "Rdv à l'Aube",
      XP0_Caspian: "Frontière Caspienne",
      XP0_Firestorm: "Opération Tempête de Feu",
      XP0_Metro: "Opération Métro",
      XP0_Oman: "Golfe d'Oman",
      XP1_001: "Route de la Soie",
      XP1_002: "Chaîne de l'Altai",
      XP1_003: "Pics de Guilin",
      XP1_004: "Passe du Dragon",
      XP2_001: "Îles Perdues",
      XP2_002: "Frappe à Nansha",
      XP2_003: "Brise Lames",
      XP2_004: "Opération Mortier",
      XP3_MarketPl: "Marché aux Perles",
      XP3_Prpganda: "Propagande",
      XP3_UrbanGdn: "Parc Lumphini",
      XP3_WtrFront: "Dragon Submergé",
      XP4_Arctic: "Opération Enfer Blanc",
      XP4_SubBase: "Tête de Marteau",
      XP4_Titan: "Hangar 21",
      XP4_WlkrFtry: "Géants de Carélie",
      XP5_Night_01: "Zavod : Equipe de Nuit",
      XP6_CMP: "Opération Outbreak",
      XP7_Valley: "Dragon Valley 2015"
    },
    shortmaps: {
      MP_Abandoned: "Zavod",
      MP_Damage: "Lancang",
      MP_Flooded: "Zone Inondée",
      MP_Journey: "Golmud",
      MP_Naval: "Paracels",
      MP_Prison: "Verrous",
      MP_Resort: "Hainan",
      MP_Siege: "Shanghai",
      MP_TheDish: "Pirate",
      MP_Tremors: "Rdv à l'Aube",
      XP0_Caspian: "Caspienne",
      XP0_Firestorm: "Tempête de Feu",
      XP0_Metro: "Métro",
      XP0_Oman: "Oman",
      XP1_001: "Route de la Soie",
      XP1_002: "Altai",
      XP1_003: "Guilin",
      XP1_004: "Dragon",
      XP2_001: "Îles Perdues",
      XP2_002: "Nansha",
      XP2_003: "Brise Lames",
      XP2_004: "Mortier",
      XP3_MarketPl: "Perles",
      XP3_Prpganda: "Propagande",
      XP3_UrbanGdn: "Lumphini",
      XP3_WtrFront: "Dragon Submergé",
      XP4_Arctic: "Enfer Blanc",
      XP4_SubBase: "Tête de Marteau",
      XP4_Titan: "Hangar",
      XP4_WlkrFtry: "Carélie",
      XP5_Night_01: "Zavod : Nuit",
      XP6_CMP: "Outbreak",
      XP7_Valley: "Dragon Valley"
    },
    gamemodes: {
      ConquestLarge0: "Conquête Large",
      ConquestSmall0: "Conquête Petite"
    },
    countdown: {
      and: "et",
      day: "jour",
      days: "jours",
      hour: "heure",
      hours: "heures",
      minute: "minute",
      minutes: "minutes",
      second: "seconde",
      seconds: "secondes"
    },
    vote: {
      title: "Vote",
      subtitle: "Choisissez vos cartes",
      current: "Vote actuel",
      instructions: "Cliques simplement sur un carte pour voter pour elle !",
      limit: (count: number) => `Vous ne pouvez voter que pour ${count} cartes !`,
      saved: "Vote enregistré !",
      saving: "Enregistrement...",
      notsaved: "Erreur d'enregistrement",
      ended: "Le vote est fini !",
      checkResults: "Regardez les résultats juste en dessous",
      results: "Lors du dernier vote...",
      static: "Ces cartes sont par défaut dans la liste des cartes",
      vote: (count: number) => `Tu peux voter pour les ${count} autres cartes qui seront dans la liste des cartes`,
      resultMaps: (count: number) => `Les ${count} cartes ayant le plus de voix sont aussi dans la maplist`,
      noRedundancy: 'Une carte ne peux pas être votée 2 semaines d\'affilé. Les cartes concernées apparaissent en <span class="legend-disabled">rouge</span>',
      details: {
        target: "Participes à la communautée en votant pour les cartes de la semaine prochaine !"
      },
      deleteThisVote: "Supprimer"
    }
  },
  en: {
    current: "en",
    header: {
      vip: "Get your VIP",
      vote: "Vote",
      stats: "Statistics",
      dashboard: "Dashboard",
      vips: "Manage Vips",
      chatlogs: "Chat logs"
    },
    stats: {
      title: "Statistics",
      subtitle: "Polygon",
      description: "Some statistics on the server activity",
      today: {
        title: "Today"
      },
      yesterday: {
        title: "Yesterday"
      },
      average: {
        title: "On average"
      }
    },
    index: {
      title: "Polygon",
      subtitle: "The new Conquest Large 64 players server",
      description: "Join our huge scale battles, participate in the community and rise to the top of the leaderboard",
      join: "Join server",
      vote: {
        title: "Vote for your maps",
        description: "Vote for the map you want to play<br />YOU can choose where you will be fighting next week",
        timeleft: "Time left for voting",
        ended: "Vote ended!",
        votenow: "Vote Now!",
        maplist: {
          current: "Current maplist",
          next: "Next Week",
          description: "The maplist changes every week based on community votes"
        }
      }
    },
    error404: {
      notFound: "Page not found",
      backToMenu: "Go back to home page"
    },
    vip: {
      title: "Help the server",
      subtitle: "With a VIP Slot",
      explanation: {
        help: "You can help this server by buying a VIP Slot",
        activation: "After receiving the payment, your VIP Slot will be activated as soon as possible",
        alive: "All donations make it possible to keep the server online"
      },
      price: {
        title: "VIP Slot Price",
        list: ["1 Month : 3 Euros", "3 Month : 7 Euros", "1 Year : 25 Euros"]
      },
      send: {
        title: "Buy a VIP Slot",
        details: "Send us your PayPal donation and you <b>BF4 pseudo</b>",
        link: "PayPal",
        pseudo: 'Enter your nickname in the "Message" field during the PayPal transfer, otherwise we won\'t be able to give you your VIP!',
        refund: "VIP contributions are considered as donations and will not be refunded",
        help: "If you need help, contact us :",
        contacts: {
          discord: ["Xarlion#0852", "VolterVajt#9721", "Sevenser#2359"],
          battlelog: ["Xarlion_", "VolterVajt", "Sevenser68"]
        }
      },
      benefits: {
        title: "VIP Slot Benefits",
        list: [
          {
            name: "Reserved slot",
            description: "No queue, no waiting : you can join when you want WITHOUT waiting<br />(The non-vip players will get kicked if the server is full)"
          },
          {
            name: "Triple vote power",
            description: "Your vote for the next map will be counted 3 times"
          },
          {
            name: "Give me the lead",
            description: "Become the squad leader with the !lead command<br />Lead your team to victory"
          },
          {
            name: "Manual balance",
            description: "Switch teams and turn the tide of battle with the !switchme command"
          },
          {
            name: "Tired of running?",
            description: "Reappear quickly without lowering your ratio with the !killme command"
          },
          {
            name: "Balance whitelist",
            description: "The balance will not hit you"
          },
          {
            name: "Ping kicker whitelist",
            description: "You will not be kicked if your ping is too high"
          }
        ]
      }
    },
    maps: {
      MP_Abandoned: "Zavod 311",
      MP_Damage: "Lancang Dam",
      MP_Flooded: "Flood Zone",
      MP_Journey: "Golmud Railway",
      MP_Naval: "Paracel Storm",
      MP_Prison: "Operation Locker",
      MP_Resort: "Hainan Resort",
      MP_Siege: "Siege of Shanghai",
      MP_TheDish: "Rogue Transmission",
      MP_Tremors: "Dawnbreaker",
      XP0_Caspian: "Caspian Border",
      XP0_Firestorm: "Operation Firestorm",
      XP0_Metro: "Operation Métro",
      XP0_Oman: "Gulf of Oman",
      XP1_001: "Silk Road",
      XP1_002: "Altai Range",
      XP1_003: "Guilin Peaks",
      XP1_004: "Dragon Pass",
      XP2_001: "Lost Islands",
      XP2_002: "Nansha Strike",
      XP2_003: "Wavebreaker",
      XP2_004: "Operation Mortar",
      XP3_MarketPl: "Pearl Market",
      XP3_Prpganda: "Propaganda",
      XP3_UrbanGdn: "Lumphini Garden",
      XP3_WtrFront: "Sunken Dragon",
      XP4_Arctic: "Opération Whiteout",
      XP4_SubBase: "Hammerhead",
      XP4_Titan: "Hangar 21",
      XP4_WlkrFtry: "Giants of Karelia",
      XP5_Night_01: "Zavod: Greveyard Shift",
      XP6_CMP: "Oeration Outbreak",
      XP7_Valley: "Dragon Valley 2015"
    },
    shortmaps: {
      MP_Abandoned: "Zavod",
      MP_Damage: "Lancang",
      MP_Flooded: "Flood Zone",
      MP_Journey: "Golmud",
      MP_Naval: "Paracel",
      MP_Prison: "Locker",
      MP_Resort: "Hainan",
      MP_Siege: "Shanghai",
      MP_TheDish: "Rogue",
      MP_Tremors: "Dawnbreaker",
      XP0_Caspian: "Caspian",
      XP0_Firestorm: "Firestorm",
      XP0_Metro: "Métro",
      XP0_Oman: "Oman",
      XP1_001: "Silk Road",
      XP1_002: "Altai",
      XP1_003: "Guilin",
      XP1_004: "Dragon",
      XP2_001: "Lost Islands",
      XP2_002: "Nansha",
      XP2_003: "Wavebreaker",
      XP2_004: "Mortar",
      XP3_MarketPl: "Market",
      XP3_Prpganda: "Propaganda",
      XP3_UrbanGdn: "Lumphini",
      XP3_WtrFront: "Sunken Dragon",
      XP4_Arctic: "Whiteout",
      XP4_SubBase: "Hammerhead",
      XP4_Titan: "Hangar",
      XP4_WlkrFtry: "Karelia",
      XP5_Night_01: "Zavod: Greveyard Shift",
      XP6_CMP: "Outbreak",
      XP7_Valley: "Dragon Valley"
    },
    gamemodes: {
      ConquestLarge0: "Conquest Large",
      ConquestSmall0: "Conquest Small"
    },
    countdown: {
      and: "and",
      day: "day",
      days: "days",
      hour: "hour",
      hours: "hours",
      minute: "minute",
      minutes: "minutes",
      second: "second",
      seconds: "seconds"
    },
    vote: {
      title: "Vote",
      subtitle: "Choose your maps",
      details: {
        target: "Participate in the community by voting for next week's maps!"
      },
      current: "Current vote",
      static: "These maps are by default in the map list",
      vote: (count: number) => `You can vote for the ${count} other maps which will be in the map list`,
      instructions: "Just click on a map to vote for it!",
      limit: (count: number) => `You can vote only for ${count} maps!`,
      saved: "Vote saved!",
      saving: "Saving...",
      notsaved: "Saving error",
      ended: "The vote is ended!",
      checkResults: "Look at the results just below",
      results: "During the last vote...",
      resultMaps: (count: number) => `The ${count} maps with the most votes are in the map list too`,
      noRedundancy: 'A map cannot be voted on 2 weeks in a row. Affected maps appear in <span class="legend-disabled">red</span>',
      deleteThisVote: "Delete"
    }
  }
};

// For convenience
type Primitive = string | number | bigint | boolean | undefined | symbol;

// To infinity and beyond >:D
export type TextPath<T, Prefix = ""> = {
  [K in keyof T]: T[K] extends Primitive | Array<any> ? `${string & Prefix}${string & K}` : `${string & Prefix}${string & K}` | TextPath<T[K], `${string & Prefix}${string & K}.`>;
}[keyof T];

function getValue(t: TextPath<Texts>, language: Language): unknown {
  type PathPart = { [key: string]: PathPart };
  const path = t.split(".");
  let currentObject: PathPart = translations[language] as unknown as PathPart;
  for (const part of path) {
    if (Object.prototype.hasOwnProperty.call(currentObject, part)) currentObject = currentObject[part];
    else return undefined;
  }
  return currentObject;
}

function I18n(props: { t: TextPath<Texts>; args?: Array<unknown>; component?: JSX.Element }): React.ReactElement {
  const context = useContext(LanguageContext);
  let value = getValue(props.t, context.language);
  if (typeof value == "function") value = value(...(props.args || []));
  if (props.component) {
    const Comp = props.component;
    return <Comp.type {...Comp.props} key={Comp.key} dangerouslySetInnerHTML={{ __html: value as string }}></Comp.type>;
  } else {
    return <>{value}</>;
  }
}

const getText = (t: TextPath<Texts>, language: Language, args?: Array<unknown>): string => {
  let value = getValue(t, language);
  if (typeof value == "function") value = value(...(args || []));
  return value as string;
};
const getFunction = <T extends Function>(t: TextPath<Texts>, language: Language): T => getValue(t, language) as T;
const getArray = <T extends Primitive | object>(t: TextPath<Texts>, language: Language): Array<T> => getValue(t, language) as Array<T>;

export const useI18n = () => {
  const context = useContext(LanguageContext);
  return {
    language: context.language,
    locale: context.language,
    getI18nText: (t: TextPath<Texts>, args?: Array<unknown>): string => getText(t, context.language, args),
    getI18nFunction: <T extends Function>(t: TextPath<Texts>): T => getFunction(t, context.language),
    getI18nArray: <T extends Primitive | object>(t: TextPath<Texts>): Array<T> => getArray(t, context.language)
  };
};
export default I18n;
