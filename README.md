<div align="center">
  <h1>mineflayer-movement</h1>
  <img src="https://img.shields.io/npm/v/mineflayer-movement?style=flat-square">
  <img src="https://img.shields.io/github/license/firejoust/mineflayer-movement?style=flat-square">
  <img src="https://img.shields.io/github/issues/firejoust/mineflayer-movement?style=flat-square">
  <img src="https://img.shields.io/github/issues-pr/firejoust/mineflayer-movement?style=flat-square">
  <p><i>Raycast based steering & obstacle avoidance implementation for mineflayer</i></p>
</div>

## Features
### Overview
- Smooth & dynamic player movement towards a destination
- Obstacle avoidance through raycast assisted application of directional heuristics
- Responsiveness & adaptation to rapidly changing environmental conditions 
### Usage Case
- Please note that this is NOT a pathfinding algorithm; It is unreliable over long distances and will not effectively get you from [point A to B](https://github.com/PrismarineJS/mineflayer-pathfinder)
- The goal of this project is to account for cases where pathfinding doesn't work as well or may be overkill, for example PvP, following a player, etc
- Unlike pathfinding, evaluation is done instantaneously to "steer" you in a general direction towards the destination

## API
### Heuristics
- Heuristics calculate a cost for every direction, determining the most efficient direction of travel.
- Each direction will have a total cost defined by the supplement of all the heuristics that are used.
- A higher total cost will correlate to a safer and more preferrable direction, which is then evaluated to determine the final angle.
```js
/*
**  Heuristic classes
*/

// The base class for a heuristic, being mutually inclusive with all other heuristics. Only required for creating new heuristics by extending itself.
bot.movement.heuristics.generic(options) /* valid properties: weighting */

// Determines a cost based on the difference between where the bot's facing vs. where it needs to face. Generally, smaller differences scale to a higher and therefore preferrable cost.
bot.movement.heuristic.proximity(options) /* valid properties: weighting */

// Prevents the player straying from the direction its currently heading by determining a difference between the angle it's facing vs. the direction of the heuristic.
bot.movement.heuristic.conformity(options) /* valid properties: weighting */

// Evaluates the average distance from obstacles and determines a cost. A closer proximity will result in a lower cost (i.e. less preferrable)
bot.movement.heuristic.distance(options) /* valid properties: weighting, radius, sectorLength, count, pitch */

// Assesses terrain depth in order to discover the safest direction to travel. Unsafe (deep) terrain will correlate to a low cost, and shallow terrain to a high cost
bot.movement.heuristic.danger(options) /* valid properties: weighting, radius, sectorLength, depth, seperation */

options = {
  weighting: number, // (Prox: 0.65, Conf: 0.2, Dir: 1, Dan: 1) The multiplier for a heuristic's final cost. Higher values will have a more considerable impact over the final costs.
  radius: number, // (Dir: 3, Dan: 1) How far horizontally rays should traverse. Higher values dull reaction speed, however result in smoother avoidance.
  sectorLength: number, // (Dir: 0.25, Dan: 0.5) The distance between block intercept checks on a ray. Smaller values increase reliability in finding intercepts, however result in slower performance.
  count: number, // (distance heuristic only) (Default: 5)  how many rays are cast vertically in a single direction. Higher values increase reliability in determining obstacles. The total collective spread between rays is 90°.
  pitch: number, // (distance heuristic only) (Default: 0) The pitch offset (in radians) of the angle in which the middle ray is cast from. Influences overall where obstacles are detected, however should remain 0 in most cases.
  depth: number, // (danger heuristic only) (Default: 3) How deep in blocks that depth rays should be cast. Higher values dull the urgency to avoid shallow holes.
  seperation: number, // (danger heuristic only) (Default: 0.25) The distance between depth rays casted from the primary ray (if confused, see src/heuristics/danger.js). Smaller values increase reliability in determining an average depth, however result in slower performance.
}

/*
**  Loading heuristics
*/

// NOTE: this only needs to be done ONCE. If heuristics need to be reset, then the plugin must be loaded again with bot.loadPlugin.
bot.movement.loadHeuristic(heuristic)
bot.movement.loadHeuristics(heuristics...)

// P.S. Heuristic options can be changed from its instance, E.g. disabling a heuristic: heuristic.weighting = 0
```
### Movement
- "Movement" is technically done by the developer, however this plugin helps steer towards the safest direction.
- This is achievable by applying each heuristic in surrounding directions defined by the number of `rotations`.
- After accounting for all costs retrieved by directional heuristics, `evaluation` will determine the safest direction.
- The result is omnidirectional, continuous movement that does not rely upon a set path.
```js
/*
**  Movement/steering functions
*/

// rotates the player's yaw towards the safest angle required to reach the destination. Returns a promise.
async bot.movement.steer(destination, rotations, evaluation)

// returns the safest yaw angle required to reach the destination.
bot.movement.steerAngle(destination, rotations, evaluation)

// retrieves a record of angles to costs after being calculated by directional heuristrics.
bot.movement.costAngles(destination, rotations)

destination = vec3 // A position where the player must move towards. (https://github.com/PrismarineJS/node-vec3)
rotations = number // (Default: 8) How many directions heuristics should be applied in, circularly. Higher values gather more information regarding the surrounding environment (Typically should be an exponent of two!)
evaluation = string // (Default: "cheapest") Which evaluation method to use whilst determining the final angle. Valid options are "cheapest" & "average".
```

## Examples
- See [simple.js](examples/simple.js) for an example of how a bot can follow the closest player.
