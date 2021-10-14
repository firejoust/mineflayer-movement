/**
 * @typedef dangerOptions
 * @property multiplier
 * @property maxX
 * @property maxY
 */

/**
 * @typedef distanceOptions
 * @property multiplier
 * @property maxX
 * @property rayTotal (ODD)
 */

/**
 * @typedef proximityOptions
 * @property multiplier
 */

function inject(bot, options) {
    bot.movement = new plugin(bot, options);
}

class plugin {
    constructor(bot, options) {
        this.bot = bot;
        this.options = options;
    }
}

/*
**  bot.movement.set(options);
**  // updates currently stored values
**
**  bot.movement.follow(positionfunc);
**  // begins following a dynamic position returned from the specified function
**
**  bot.movement.stop();
**  // stops following the target
*/