window.spots = [

  {
    title: "AJs Button vs Limpers",
    category: "Preflop",
    difficulty: "Basic",
    leak: "too-passive",

    question:
      "CHF 1/2 home game. Two loose-passive players limp. You are on the Button with A♠ J♠.\nWhat is the best play?",

    answers: [
      "Fold",
      "Call",
      "Raise to 8 CHF",
      "Raise to 16-20 CHF"
    ],

    best: 3,

    explanation:
      "Against limpers you should isolate aggressively. AJs performs very well in position and dominates many limp-calling ranges."
  },

  {
    title: "KTo UTG",
    category: "Preflop",
    difficulty: "Basic",
    leak: "early-position-too-loose",

    question:
      "8-handed game. You are UTG with K♦ T♣.\nSeveral players behind you call too much preflop.",

    answers: [
      "Fold",
      "Open Raise",
      "Limp",
      "All-in"
    ],

    best: 0,

    explanation:
      "KTo looks attractive but performs poorly UTG. You will often be dominated and play difficult multiway pots."
  },

  {
    title: "99 in the Cutoff",
    category: "Preflop",
    difficulty: "Basic",
    leak: "too-passive",

    question:
      "Folds to you in the Cutoff. You hold 9♣ 9♦.\nButton is tight and blinds are passive.",

    answers: [
      "Fold",
      "Call",
      "Open Raise",
      "All-in"
    ],

    best: 2,

    explanation:
      "Clear open raise. You are ahead of many calling hands and can often take down the blinds."
  },

  {
    title: "AQo vs Nit 3-Bet",
    category: "Preflop",
    difficulty: "Medium",
    leak: "hero-calling",

    question:
      "You open AQo from MP. A very tight player on the Button makes a large 3-bet.\nHe has barely played a hand all evening.",

    answers: [
      "Fold",
      "Call",
      "4-Bet Bluff",
      "Jam"
    ],

    best: 0,

    explanation:
      "Against a true nit, AQo is frequently dominated by AK, QQ+ and sometimes JJ."
  },

  {
    title: "Top Set on Wet Board",
    category: "Flop",
    difficulty: "Basic",
    leak: "thin-value-missed",

    question:
      "You hold Q♠ Q♦.\nFlop: Q♥ J♥ 9♣.\nThree opponents see the flop.\nWhat is best?",

    answers: [
      "Check",
      "Bet 20%",
      "Bet 80-100%",
      "Fold"
    ],

    best: 2,

    explanation:
      "Wet boards require value and protection. Many draws and weaker made hands will pay."
  },

  {
    title: "Missed Flush Draw vs Calling Station",
    category: "River",
    difficulty: "Basic",
    leak: "bad-bluffs",

    question:
      "You missed a flush draw.\nVillain is a calling station.\nPot 70 CHF.\nVillain checks.",

    answers: [
      "Check",
      "Bet 25 CHF",
      "Bet Pot",
      "Jam"
    ],

    best: 0,

    explanation:
      "Calling stations hate folding. Bluff less, value bet more."
  }

];
