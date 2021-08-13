function inject(bot, options) {
    bot.movement = new plugin(bot, options);
}

class plugin {
    #proximity_multiplier = 1;
    #distance_multilier = 0.8;
    #direction_multiplier = 0.5;
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