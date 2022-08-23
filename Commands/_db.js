const economy = {
  default: {
    currencyCapacity: 2000,
    power: 0,
    patreonBonuses: {
      power: {
        levels: 10,
        untilLevel: 50
      },
      dailyBonus: 20,
      researchSpeed: 5
    },
    gaining: {
      chat: 0.5,
      voice: 0,
      work: 0,
      daily: 0
    },
    skills: {
      currency_bonus_percentage: {
        percentage: 18,
        firstPrice: 100,
        lvlUpCooldown: 4.5
      },
      currency_bonus_absolute: {
        percentage: 18,
        firstPrice: 1000,
        lvlUpCooldown: 210
      },
      research_speed_percentage: {
        percentage: 18,
        firstPrice: 100000,
        lvlUpCooldown: 840
      },
      research_bonus_percentage: {
        percentage: 18,
        firstPrice: 10000,
        lvlUpCooldown: 24
      },
      power: {
        percentage: 18,
        firstPrice: 250,
        lvlUpCooldown: 24
      },
      defense: {
        percentage: 18,
        firstPrice: 50,
        lvlUpCooldown: 12
      },
      capacity: {
        percentage: 18,
        firstPrice: 2000,
        lvlUpCooldown: 48
      },
      slave_capacity: {
        percentage: 18,
        firstPrice: 1000000,
        lvlUpCooldown: 168
      }
    }
  },
  USERID: {
    currency: Number, //Number of Money
    currencyCapacity: Number, //Max Number of Money
    power: Number, //Number of Power
    defense: Number, //Number of Defense
    dailyStreak: Number, //Daily Streak Number
    slaves: Number, //Number of current slaves the user has
    maxSlaves: Number, //The maximum Number of slaves the user can hold
    gaining: {
      chat: Number, //Number of souls per chat message (with cooldown)
      voice: Number, //Number of souls per active minute in voice
      work: Number, //Number of souls per execution of work command
      daily: Number, //Number of souls per execution of the daily command
    },
    skills: {
      SKILL_NAME: {
        percentage: Number, //Number of percent cost increase per level
        lastPrice: Number, //Last payed price for the item
        lvl: Number, //current item lvl
        lvlUpCooldown: Number //Time in hours it takes to upgrade this item
      },
      currency_bonus_percentage: {
        percentage: 18,
        lastPrice: 0,
        lvl: 0,
        lvlUpCooldown: 4.5
      },
      currency_bonus_absolute: {
        percentage: 18,
        lastPrice: 0,
        lvl: 0,
        lvlUpCooldown: 210
      },
      research_speed_percentage: {
        percentage: 18,
        lastPrice: 0,
        lvl: 0,
        lvlUpCooldown: 840
      },
      research_bonus_percentage: {
        percentage: 18,
        lastPrice: 0,
        lvl: 0,
        lvlUpCooldown: 24
      },
      power: {
        percentage: 18,
        lastPrice: 0,
        lvl: 0,
        lvlUpCooldown: 24
      },
      defense: {
        percentage: 18,
        lastPrice: 0,
        lvl: 0,
        lvlUpCooldown: 12
      },
      currency_capacity: {
        percentage: 18,
        lastPrice: 0,
        lvl: 0,
        lvlUpCooldown: 48
      },
      slave_capacity: {
        percentage: 18,
        lastPrice: 0,
        lvl: 0,
        lvlUpCooldown: 168
      }
    }
  }
}