<div align="center">
  <h1>Mineflayer Movement</h1>
  <img src="https://img.shields.io/npm/v/mineflayer-movement?style=flat-square">
  <img src="https://img.shields.io/github/license/firejoust/mineflayer-movement?style=flat-square">
  <img src="https://img.shields.io/github/issues/firejoust/mineflayer-movement?style=flat-square">
  <img src="https://img.shields.io/github/issues-pr/firejoust/mineflayer-movement?style=flat-square">
</div>

### Features
#### Overview
- Smooth & realistic player movement towards a destination
- Obstacle avoidance through raycast assisted application of directional heuristics
- Real time adaptation & responsiveness to changing environmental conditions 
#### Usage Case
- The goal of this project is to account for cases where pathfinding doesn't work as well (e.g. PvP, following a player)
- Evaluation is done instantaneously to "steer" you in a general direction towards the destination
- Please note that this plugin is unreliable over long distances and will not effectively get you from [point A to B](https://github.com/PrismarineJS/mineflayer-pathfinder)!

### API
#### Loading the Plugin
```js
const mineflayer = require("mineflayer")
const movement = require("mineflayer-movement")

const {
  ProximityHeuristic,
  ConformityHeuristic,
  DistanceHeuristic,
  DangerHeuristic
} = movement.heuristics

const plugin = movement.getPlugin(
  new ProximityHeuristic(1),
  new ConformityHeuristic(0.5),
  new DistanceHeuristic(1, 5, 5),
  new DangerHeuristic(1, 2, 5, 0.25)
)

const bot = mineflayer.createBot()
bot.loadPlugin(plugin)
```
#### Heuristics
- Each heuristic will calculate a cost for a direction of travel
- Directions with a high cost generally have suitable terrain (depending on the heuristic)
- The directional costs will then be evaluated to determine the final angle
```js
// how close the rotation angle is to the destination
class ProximityHeuristic(weight);

// how close the rotation angle is to where the player is actually facing
class ConformityHeuristic(weight);

// the distance from block/wall collisions in a certain direction
class DistanceHeuristic(weight, radius, count);

// assesses terrain depth in order to find the safest direction of travel
class DangerHeuristic(weight, radius, depth, spread);

options = {
  weight: number, // a multiplier for the heuristic's final cost. higher values correspond to increased sensitivity for that heuristic
  radius: number, // how far the rays will traverse. A high radius is better for predicting terrain changes, but dulls the sensitivity when getting close
  count: number,  // the number of rays that are cast vertically. The collective spread between all rays is 90°. odd numbers are recommended
  depth: number,  // the maximum depth for rays that are cast downwards
  spread: number, // the distance between rays that are cast downwards. values < 1 are recommended
}
```
#### Methods
```js
// sets the player's yaw to the most suitable angle towards the destination
async bot.movement.steer(destination, rotations, average)

// returns a yaw angle pointing towards the destination
bot.movement.getYaw(destination, rotations, average)

// returns an object including the yaw angle with its associated cost
bot.movement.getRotation(destination, rotations, average)

// returns an object including rotations and costs
bot.movement.getRotations(destination, rotations)

options = {
  destination: Vec3, // the position to move towards
  rotations: number, // how many directions surrounding the player are checked
  average: boolean?   // whether to evaluate all directional costs instead of selecting one
}
```

### Examples
- Behaviour is highly configurable and differs based on the terrain; You'll have to tweak the heuristics to get your desired movement
- See [simple.js](assets/simple.js) for an example of how a bot can follow the closest player
