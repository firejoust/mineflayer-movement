module.exports = function Goals(bot) {
    this.Default = new bot.movement.Goal({
        distance: bot.movement.heuristic.new('distance')
            .configure({
                weight: 0.4,
                radius: 10,
                spread: 25,
                offset: 1,
                count: 5,
                increment: 0.2
            }),
        danger: bot.movement.heuristic.new('danger')
            .configure({
                weight: 0.6,
                radius: 3,
                count: 6,
                depth: 2,
                descend: false,
                increment: 0.2
            }),
        proximity: bot.movement.heuristic.new('proximity')
            .configure({
                weight: 0.6,
                avoid: false
            }),
        conformity: bot.movement.heuristic.new('conformity')
            .configure({
                weight: 0.2,
                avoid: false
            })
    })
}