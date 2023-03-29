<div align="center">
  <h1>Mineflayer Movement</h1>
  <img src="https://img.shields.io/npm/v/mineflayer-movement?style=flat-square">
  <img src="https://img.shields.io/github/license/firejoust/mineflayer-movement?style=flat-square">
  <img src="https://img.shields.io/github/issues/firejoust/mineflayer-movement?style=flat-square">
  <img src="https://img.shields.io/github/issues-pr/firejoust/mineflayer-movement?style=flat-square">
</div>

### Description
"mineflayer-movement" is a plugin for mineflayer that allows for real-time terrain navigation without the need for a complex pathfinding algorithm. Instead of following a pre-determined path, it behaves similarly to a real player, using raycasting within a certain field of vision to move around the environment. This gives the bot an advantage in terms of responsiveness, agility and performance.

Heuristics are used to modify behaviour, customising the bot's response to changing conditions and obstacles. This makes it ideal for situations where pathfinding isn't as effective, such as PVP or following a player. However, given it is unreliable over long distances, it should not be used for long-distance travel, or where destination accuracy is crucial (Ie. getting to a specific coordinate)
### Installation
- Using npm, install the package into your project directory:
```sh
npm install mineflayer-movement
```
### Example
```js
const mineflayer = require("mineflayer")
const movement = require("mineflayer-movement")

const bot = mineflayer.createBot({
    host: "localhost",
    port: 25565,
    username: "bot"
})

bot.loadPlugin(movement.plugin)

bot.once("login", function init() {
    // set control states
    {
        bot.setControlState("forward", true)
        bot.setControlState("sprint", true)
        bot.setControlState("jump", true)
    }

    // load heuristics
    {
        bot.movement.heuristic.register('distance')
            .weight(0.3)
            .count(5)
            .radius(10)
            .spread(50)
            .increment(0.2)

        bot.movement.heuristic.register('danger')
            .weight(0.6)
            .radius(3)
            .count(6)
            .depth(2)

        bot.movement.heuristic.register('proximity')
            .weight(0.6)

        bot.movement.heuristic.register('conformity')
            .weight(0.2)
    }
})

bot.once("spawn", function start() {
    bot.on("physicsTick", function tick() {
        const entity = bot.nearestEntity(entity => entity.type === "player")
        if (entity) {
            // set the proximity target to the nearest entity
            bot.movement.heuristic.get('proximity')
                .target(entity.position)
            
            // move towards the nearest entity
            const yaw = bot.movement.getYaw(160, 15, 2)
            bot.movement.steer(yaw, true)
        }
    })
})
```
### API
