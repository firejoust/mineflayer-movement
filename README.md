<div align="center">
  <h1>Mineflayer Movement</h1>
  <img src="https://img.shields.io/npm/v/mineflayer-movement?style=flat-square">
  <img src="https://img.shields.io/github/license/firejoust/mineflayer-movement?style=flat-square">
  <img src="https://img.shields.io/github/issues/firejoust/mineflayer-movement?style=flat-square">
  <img src="https://img.shields.io/github/issues-pr/firejoust/mineflayer-movement?style=flat-square">
</div>

### Features
- Smooth and realistic player movement towards a destination
- Obstacle avoidance including blocks, walls, holes, players, etc.
- Real time adaption to rapidly changing terrain conditions

### Description
"mineflayer-movement" is a mineflayer plugin that allows for real-time terrain navigation without using a complex pathfinding algorithm. Instead of following a pre-determined path, it behaves similarly to a real player, using raycasting within a certain field of vision to move around the environment. This gives the bot an advantage in terms of responsiveness, agility and performance.

Heuristics are used to modify behaviour, customising the bot's response to changing conditions and obstacles. This makes it ideal for situations where pathfinding isn't as effective, such as PVP or following a player. However, given it is unreliable over long distances, it should not be used where accuracy is crucial (Ie. getting to a specific coordinate)

### Heuristics
There are currently 4 heuristics that can be used:
1. Distance (Checks for vertical block obstruction in a certain direction)
2. Danger (Verifies the average terrain depth in a certain direction)
3. Proximity (How close a direction is to target coordinates)
4. Conformity (How close a direction is to where the bot is currently facing)

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

    // load heuristics (use default configuration)
    {
        bot.movement.heuristic.register('distance')
        bot.movement.heuristic.register('danger')
        bot.movement.heuristic.register('proximity')
        bot.movement.heuristic.register('conformity')
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
#### Types
```ts
type HeuristicType = 'distance' | 'danger' | 'proximity' | 'conformity'
```
#### Methods
```js
/*
  Registers a new heuristic. Returns a new instance of the heuristic, allowing access to its setters.
  
  Arguments:
  type  (HeuristicType) The type of heuristic that is being assigned
  label (String, optional) The heuristic's label; defaults to its type
*/
bot.movement.heuristic.register(type, label?)

/*
  Returns a previous instance of a heuristic, allowing access to its setters.
  
  Arguments:
  label (String) The registered heuristic's label
*/
bot.movement.heuristic.get(label)

/*
  Returns the optimal yaw angle in any given tick.
  
  Arguments:
  fov       (Number, optional) The player's frame of vision, in degrees (Default: 240)
  rotations (Number, optional) How many directions to check within the FOV (Default: 15)
  blend     (Number, optional) Averages or "blends" adjacent costs in a radius of N rotations (Default: 2)
*/
bot.movement.getYaw(fov?, rotations?, blend?)

/*
  Abstraction of bot.look; steers towards the yaw angle specified and returns a promise.
  
  Arguments:
  yaw   (Number) The yaw that the player will face
  force (Boolean, optional) Whether to snap towards the given yaw. (Default: true)
*/
bot.movement.steer(yaw, force?)
```
