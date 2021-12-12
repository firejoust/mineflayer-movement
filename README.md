<div align="center">
  <h1>mineflayer-movement</h1>
  <i>Raycast based steering & obstacle avoidance implementation for mineflayer</i>
  <br>
  <h2>Disclaimer</h1>
  <b>This plugin is not currently in a useable state, nor is there a definite list of things that need to be done.</b>
</div>

## API
### Heuristics
- Heuristics calculate a cost for every direction, determining the most efficient direction of travel.
- Each direction will have a total cost defined by the supplement of all the heuristics that are used.
- Unlike A* implementations, a higher cost will actually correlate to a safer and more preferrable direction in this case.
```js
/*
**  Heuristics
*/

// The base class for a heuristic, being mutually inclusive with all other heuristics. Only required for creating new heuristic by extending itself.
bot.movement.heuristics.generic(options) /* valid properties: weighting */

// Determines a cost based on the difference between where the bot's facing vs. where it needs to face. Generally, smaller differences scale to a higher and therefore preferrable cost.
bot.movement.heuristic.proximity(options) /* valid properties: weighting */

// Evaluates the average distance from obstacles and determines a cost. A closer proximity will result in a lower cost (i.e. less preferrable)
bot.movement.heuristic.distance(options) /* valid properties: weighting, radius, sectorLength, count, pitch */

// Assesses terrain depth in order to discover the safest direction to travel. Unsafe (deep) terrain will correlate to a low cost, and shallow terrain to a high cost
bot.movement.heuristic.danger(options) /* valid properties: weighting, radius, sectorLength, depth, seperation */

options = {
  weighting: number, // The multiplier for a heuristic's final cost. Higher values will have a more considerable impact over the final costs.
  radius: number, // How far horizontally rays should traverse. Higher values dull reaction speed, however result in smoother avoidance.
  sectorLength: number, // The distance between block intercept checks on a ray. Smaller values increase reliability in finding intercepts, however result in slower performance.
  count: number, // (distance heuristic only) how many rays are cast vertically in a single direction. Higher values increase reliability in determining obstacles. The total collective spread between rays is 90°.
  pitch: number, // (distance heuristic only) The pitch offset (in radians) of the angle in which the middle ray is cast from. Influences overall where obstacles are detected, however should remain 0 in most cases.
  depth: number, // (danger heuristic only) How deep in blocks that depth rays should be cast. Higher values dull the urgency to avoid shallow holes.
  seperation: number, // (danger heuristic only) The distance between depth rays casted from the primary ray (if confused, see src/heuristics/danger.js). Smaller values increase reliability in determining an average depth, however result in slower performance.
}
```
