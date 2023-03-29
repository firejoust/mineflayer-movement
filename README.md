<div align="center">
  <h1>Mineflayer Movement</h1>
  <img src="https://img.shields.io/npm/v/mineflayer-movement?style=flat-square">
  <img src="https://img.shields.io/github/license/firejoust/mineflayer-movement?style=flat-square">
  <img src="https://img.shields.io/github/issues/firejoust/mineflayer-movement?style=flat-square">
  <img src="https://img.shields.io/github/issues-pr/firejoust/mineflayer-movement?style=flat-square">
</div>

### Description
"mineflayer-movement" is a plugin for mineflayer that allows for real-time terrain navigation without the need for a complex pathfinding algorithm. Instead of finding a pre-determined path, it behaves similarly to a real player, using raycasting within a certain field of vision to move around the environment. This gives the bot an advantage in terms of responsiveness, agility and performance.

Heuristics are used to modify behaviour, customising the bot's response to changing conditions and obstacles. This makes it ideal for situations where pathfinding isn't as effective, such as PVP or following a player. However, given it is unreliable over long distances, it should not be used for long-distance travel, or where destination accuracy is crucial (Ie. getting to a specific coordinate)
