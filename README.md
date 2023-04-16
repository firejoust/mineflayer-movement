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

Heuristics are used to modify behaviour, customising the bot's response to changing conditions and obstacles. This makes it ideal for situations where pathfinding isn't as effective, such as PVP or following a player. However, given it is unreliable over long distances, it should not be used where accuracy is critical (Ie. getting to a specific coordinate)

### Heuristics
Here is a general explanation of how heuristics work:
- Each heuristic will compute a "cost" between 0 to 1 per yaw rotation within the fov.
- Heuristics are configurable with a "weight" acting as a multiplier on the final cost.
- The rotation with the lowest cost will be the yaw angle returned by `getYaw`.

Note: The `blend` argument in `getYaw` can be used to get an average of **'𝑛'** adjacent rotation costs *(in both directions)* for all rotations, increasing reliability in finding a suitable angle and reducing the chances of getting stuck *(incorrectly selecting a rotation)*

There are currently **four** heuristics that can be used:
1. Distance (Checks for vertical block obstruction in a certain direction)
2. Danger (Checks for dangerous blocks and hazardous depth in a certain direction)
3. Proximity (Checks how close a direction is to the target coordinates)
4. Conformity (Checks how close a direction is to where the bot is currently facing)

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
    // load heuristics with default configuration
    const { Default } = bot.movement.goals
    bot.movement.setGoal(Default)
    // set control states
    bot.setControlState("forward", true)
    bot.setControlState("sprint", true)
    bot.setControlState("jump", true)
})

bot.once("spawn", function start() {
    bot.on("physicsTick", function tick() {
        const entity = bot.nearestEntity(entity => entity.type === "player")
        if (entity) {
            // set the proximity target to the nearest entity
            bot.movement.heuristic.get('proximity')
                .target(entity.position)
            // move towards the nearest entity
            const yaw = bot.movement.getYaw(240, 15, 1)
            bot.movement.steer(yaw)
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
  Initialises a new goal from the heuristics specified.
  
  Arguments:
  heuristics (object): A key/value object mapping labels to heuristics
*/
const goal = new bot.movement.Goal(heuristics)

/*
  Resets and registers all heuristics using the goal specified.
  
  Arguments:
  goal (Goal) The goal containing the new heuristics to be registered
*/
bot.movement.setGoal(goal)

/*
  Returns the optimal yaw angle in any given tick.
  
  Arguments:
  fov       (Number, optional) The player's frame of vision, in degrees (Default: 240)
  rotations (Number, optional) How many directions to check within the FOV (Default: 15)
  blend     (Number, optional) Averages or "blends" adjacent costs in a radius of N rotations (Default: 1)
*/
const yaw = bot.movement.getYaw(fov?, rotations?, blend?)

/*
  Abstraction of bot.look; steers towards the yaw angle specified and returns a promise.
  
  Arguments:
  yaw   (Number) The yaw that the player will face
  force (Boolean, optional) Whether to snap towards the given yaw (Default: true)
*/
bot.movement.steer(yaw, force?)
```
#### Methods - Heuristics
```js
/*
  Returns a new heuristic instance.
  
  Arguments:
  type (HeuristicType) The type of heuristic that is being assigned
*/
bot.movement.heuristic.new(type)

/*
  Registers a new heuristic instance and returns it.
  
  Arguments:
  type  (HeuristicType) The type of heuristic that is being assigned
  label (String, optional) The heuristic's unique identifier; defaults to its type
*/
bot.movement.heuristic.register(type, label?)

/*
  Returns a previously registered heuristic.
  
  Arguments:
  label (String) The heuristic's label
*/
bot.movement.heuristic.get(label)
```
#### Configuration - Setters
- Heuristic behaviour such as radius, weight, etc. can be modified by accessing its setters.
- It is important to have a good understanding of how a heuristic works before modifying the default values.
```js
bot.movement.heuristic.register('distance')
  .weight(number)    // multiplier for final cost
  .radius(number)    // how far each raycast will travel
  .height(number)    // maximum height that raycasts can climb blocks
  .count(number)     // how many raycasts in a particular direction
  .avoid(object)     // key/value object mapping avoid block names to booleans
  .increment(number) // distance between block checks
  
bot.movement.heuristic.register('danger')
  .weight(number)     // multiplier for the final cost
  .radius(number)     // the length of the initial raycast
  .height(number)     // maximum height that raycasts can climb blocks
  .descent(number)    // maximum depth that raycasts can descend
  .depth(number)      // how deep raycasts can descend from a block
  .count(number)      // how many raycasts in a particular direction
  .avoid(object)      // key/value object mapping avoid block names to booleans
  .increment(number)  // distance between block checks

bot.movement.heuristic.register('proximity')
  .weight(number) // multiplier for the final cost
  .target(Vec3)   // the proximity target/destination coordinates
  .avoid(boolean) // whether to avoid the target (reverses cost)
  
bot.movement.heuristic.register('conformity')
  .weight(number) // multiplier for the final cost
  .avoid(boolean) // avoid travelling in the same direction (reverses cost)
```
#### Configuration - Objects
- Alternatively, heuristics can be configured using a key/value object for more concise syntax:
```js
// Example!

bot.movement.heuristic.register('distance')
  .configure({
    weight?: number,
    radius?: number,
    height?: number,
    count?: number,
    increment?: number
  })
```
#### Configuration - Goals
- Goals provide an effective way of combining multiple heuristics to achieve a desired movement pattern.
- This makes it easier to reconfigure multiple heuristics at once, particularly for changing terrain conditions.
```ts
// Example!

const MovementGoal = new bot.movement.Goal({
  'distance': bot.movement.heuristic.new('distance')
    .configure({
      weight?: number,
      radius?: number,
      height?: number,
      count?: number,
      increment?: number
    })
})

bot.movement.setGoal(MovementGoal)
```
