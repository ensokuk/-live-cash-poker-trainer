const Coach = {
  leakAdvice: {
    "too-passive": {
      title: "Too Passive",
      advice:
        "You are missing value. In low-stakes live games, especially against loose-passive players, your default should be to raise strong hands preflop and value bet aggressively postflop."
    },
    "hero-calling": {
      title: "Too Many Hero Calls",
      advice:
        "Passive players rarely fire big river bluffs. Against nits and loose-passive players, big river aggression is usually value-heavy. Fold more often without strong blockers or a clear bluffing read."
    },
    "bad-bluffs": {
      title: "Bad Bluff Targets",
      advice:
        "Do not bluff players who hate folding. Calling stations should be value-owned, not bluffed. Save your bluffs for players who can actually fold."
    },
    "thin-value-missed": {
      title: "Missed Thin Value",
      advice:
        "You are checking back too many medium-strong hands. Against players who call too wide, top pair and overpairs often deserve one more value bet."
    },
    "draws-too-expensive": {
      title: "Calling Draws Too Expensively",
      advice:
        "You are paying too much for draws. Count your outs, compare pot odds, and remember that implied odds are lower against short stacks and passive players who may not pay off."
    },
    "early-position-too-loose": {
      title: "Too Loose in Early Position",
      advice:
        "Tighten up UTG and MP. Hands like KTo, QJo, weak suited aces and low suited connectors look playable but become expensive in multiway pots."
    },
    "position-underused": {
      title: "Position Underused",
      advice:
        "You are not using the button and cutoff enough. In position, you can isolate limpers wider, control pot size, and value bet more accurately."
    },
    "overplaying-one-pair": {
      title: "Overplaying One Pair",
      advice:
        "One pair is not a stack-off hand by default, especially multiway or against passive strength. Slow down when passive players show major aggression."
    },
    "bet-sizing-too-small": {
      title: "Bet Sizing Too Small",
      advice:
        "Your value bets are too small. In live low-stakes games, players call too much. Size up with strong hands, especially on wet boards."
    },
    "villain-profile-ignored": {
      title: "Villain Profile Ignored",
      advice:
        "The same hand can be a call against a maniac and a fold against a nit. Always start with the opponent type before choosing your line."
    }
  },

  categoryMap: {
    Preflop: "preflop",
    Flop: "flop",
    Turn: "turn",
    River: "river"
  },

  getLeakTitle(leakKey) {
    return this.leakAdvice[leakKey]?.title || "Unknown Leak";
  },

  getLeakAdvice(leakKey) {
    return this.leakAdvice[leakKey]?.advice || "Play more spots to generate a clearer recommendation.";
  },

  calculateScores(stats) {
    const totalPlayed = stats.played || 0;
    const totalCorrect = stats.correct || 0;

    const accuracy = totalPlayed
      ? Math.round((totalCorrect / totalPlayed) * 100)
      : 0;

    const categoryScores = {
      preflop: this.calculateCategoryScore(stats, "Preflop"),
      flop: this.calculateCategoryScore(stats, "Flop"),
      turn: this.calculateCategoryScore(stats, "Turn"),
      river: this.calculateCategoryScore(stats, "River"),
      profiling: this.calculateProfilingScore(stats),
      value: this.calculateValueScore(stats)
    };

    const overall = Math.round(
      (
        categoryScores.preflop +
        categoryScores.flop +
        categoryScores.turn +
        categoryScores.river +
        categoryScores.profiling +
        categoryScores.value
      ) / 6
    );

    return {
      accuracy,
      overall,
      ...categoryScores
    };
  },

  calculateCategoryScore(stats, category) {
    const played = stats.categoryPlayed?.[category] || 0;
    const correct = stats.categoryCorrect?.[category] || 0;

    if (!played) return 0;

    return Math.round((correct / played) * 100);
  },

  calculateProfilingScore(stats) {
    const profilingLeaks =
      (stats.leaks?.["villain-profile-ignored"] || 0) +
      (stats.leaks?.["hero-calling"] || 0) +
      (stats.leaks?.["bad-bluffs"] || 0);

    const base = stats.played ? 80 : 0;
    return Math.max(0, base - profilingLeaks * 8);
  },

  calculateValueScore(stats) {
    const valueLeaks =
      (stats.leaks?.["too-passive"] || 0) +
      (stats.leaks?.["thin-value-missed"] || 0) +
      (stats.leaks?.["bet-sizing-too-small"] || 0);

    const base = stats.played ? 80 : 0;
    return Math.max(0, base - valueLeaks * 8);
  },

  getMainLeaks(stats, limit = 3) {
    const leaks = stats.leaks || {};

    return Object.entries(leaks)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key, count]) => ({
        key,
        count,
        title: this.getLeakTitle(key),
        advice: this.getLeakAdvice(key)
      }));
  },

  getTrainingPlan(stats) {
    const leaks = this.getMainLeaks(stats, 1);

    if (!stats.played || stats.played < 5) {
      return "Play at least 5 spots to unlock a useful training plan.";
    }

    if (!leaks.length) {
      return "Your decisions look solid so far. Continue with mixed spots, then focus on river and villain-profile situations.";
    }

    const main = leaks[0];

    return `Main focus: ${main.title}. ${main.advice}`;
  },

  analyzeHand(hand) {
    const text = [
      hand.position,
      hand.villain,
      hand.stack,
      hand.cards,
      hand.preflop,
      hand.flop,
      hand.turn,
      hand.river,
      hand.notes
    ]
      .join(" ")
      .toLowerCase();

    const findings = [];

    if (hand.villain === "Calling Station") {
      findings.push({
        leak: "bad-bluffs",
        message:
          "Against a calling station, bluff less and value bet more. If your line included a big bluff, that is likely a leak."
      });
    }

    if (hand.villain === "Nit") {
      findings.push({
        leak: "hero-calling",
        message:
          "Against a nit, big turn or river aggression is heavily value-weighted. Avoid paying off large bets too lightly."
      });
    }

    if (hand.villain === "Maniac") {
      findings.push({
        leak: "villain-profile-ignored",
        message:
          "Against a maniac, widen your bluff-catching range but avoid emotional stack-offs without showdown value."
      });
    }

    if (
      text.includes("check") &&
      (
        text.includes("top pair") ||
        text.includes("overpair") ||
        text.includes("set") ||
        text.includes("two pair")
      )
    ) {
      findings.push({
        leak: "thin-value-missed",
        message:
          "You may have missed value. In low-stakes games, many players call too wide with second-best hands."
      });
    }

    if (
      text.includes("flush draw") ||
      text.includes("straight draw") ||
      text.includes("gutshot")
    ) {
      findings.push({
        leak: "draws-too-expensive",
        message:
          "Check whether your draw call had correct pot odds and implied odds. Many live players overpay for draws."
      });
    }

    if (
      text.includes("limp") &&
      (
        text.includes("aa") ||
        text.includes("kk") ||
        text.includes("qq") ||
        text.includes("ak")
      )
    ) {
      findings.push({
        leak: "too-passive",
        message:
          "Avoid fancy limps with premium hands. Low-stakes players call raises too often, so build the pot for value."
      });
    }

    if (!findings.length) {
      findings.push({
        leak: "villain-profile-ignored",
        message:
          "No obvious automatic leak detected. Review stack depth, position, bet sizing and villain type street by street."
      });
    }

    return findings;
  }
};
