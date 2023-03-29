<div align="center">
  <h1>Mineflayer Movement</h1>
  <img src="https://img.shields.io/npm/v/mineflayer-movement?style=flat-square">
  <img src="https://img.shields.io/github/license/firejoust/mineflayer-movement?style=flat-square">
  <img src="https://img.shields.io/github/issues/firejoust/mineflayer-movement?style=flat-square">
  <img src="https://img.shields.io/github/issues-pr/firejoust/mineflayer-movement?style=flat-square">
</div>

### Features
- Smooth and realistic player movement towards a destination
- Obstacle avoidance including blocks, holes, walls, players, etc.
- Real time adaption to actively changing terrain conditions

### Description
"mineflayer-movement" is a mineflayer plugin that allows for real-time terrain navigation without using a complex pathfinding algorithm. Instead of following a pre-determined path, it behaves similarly to a real player, using raycasting within a certain field of vision to move around the environment. This gives the bot an advantage in terms of responsiveness, agility and performance.

Heuristics are used to modify behaviour, customising the bot's response to changing conditions and obstacles. This makes it ideal for situations where pathfinding isn't as effective, such as PVP or following a player. However, given it is unreliable over long distances, it should not be used where accuracy is crucial (Ie. getting to a specific coordinate)

### Heuristics
Here is a general explanation of how heuristics work:
- Each heuristic will compute a "cost" between 0 to 1 per yaw rotation within the fov.
- Heuristics are configurable with a "weight" acting as a multiplier on the final cost.
- The rotation with the lowest cost will be the yaw angle returned by `getYaw`.

Note: The `blend` argument in `getYaw` can be used to get an average of **'𝑛'** adjacent rotation costs *(in both directions)* for all rotations, increasing reliability in finding a suitable angle and reducing the chances of getting stuck.

There are currently **four** heuristics that can be used:
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
type HeuristicType = 'distance' | 'danger' | 'proximity' | 'conformity';
type Vec3 = { x, y, z }; // https://github.com/PrismarineJS/node-vec3
```
#### Methods
```js
/*
  Registers a new heuristic. Returns a new instance of the heuristic, allowing access to its setters.
  
  Arguments:
  type  (HeuristicType) The type of heuristic that is being assigned
  label (String, optional) The heuristic's unique identifier; defaults to its type
*/
bot.movement.heuristic.register(type, label?)

/*
  Returns a registered instance of a heuristic, allowing access to its setters.
  
  Arguments:
  label (String) The heuristic's label
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
  force (Boolean, optional) Whether to snap towards the given yaw (Default: true)
*/
bot.movement.steer(yaw, force?)
```
### Setters
- Heuristic behaviour such as radius, weight, etc. can be modified by accessing its setters.
- It is important to have a good understanding of how a heuristic works before modifying the default values.
```js
bot.movement.heuristic.register('distance')
  .weight(number)    // multiplier for final cost
  .radius(number)    // the length of each raycast
  .count(number)     // how many rays will be cast vertically
  .spread(number)    // the total spread of all vertical raycasts, in degrees
  .increment(number) // distance between block checks
  
bot.movement.heuristic.register('danger')
  .weight(number)    // multiplier for the final cost
  .radius(number)    // the length of the initial raycast
  .count(number)     // how many rays will be cast downwards
  .depth(number)     // the maximum depth of the downwards raycasts
  .increment(number) // distance between block checks
  .descend(boolean)  // whether to favour depth rather than avoid it (reverses cost)
  
bot.movement.heuristic.register('proximity')
  .weight(number) // multiplier for the final cost
  .target(Vec3)   // the proximity target/destination coordinates
  .avoid(boolean) // whether to avoid the target (reverses cost)
  
bot.movement.heuristic.register('conformity')
  .weight(number) // multiplier for the final cost
```
