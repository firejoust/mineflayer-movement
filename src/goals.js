module.exports = function Goals(bot) {
    this.Default = new bot.movement.Goal({
        'distance': bot.movement.heuristic.new('distance'),
        'danger': bot.movement.heuristic.new('danger'),
        'proximity': bot.movement.heuristic.new('proximity'),
        'conformity': bot.movement.heuristic.new('conformity')
    })
}