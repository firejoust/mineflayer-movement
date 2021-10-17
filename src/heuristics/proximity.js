/*
**  Determines the angular ratio from a direction to the destination
*/

class proximityHeuristic extends costHeuristic {
    constructor(weighting) {
        super(weighting);
    }

    determineCost(yaw, destination) {
        if (!this.bot) throw Error("No client has been assigned!");
        let d = destination.minus(this.bot.entity.position);
        let r = (Math.atan2(d.z, d.x) - Math.PI) - yaw;
        return this.weighting * Math.abs(r/Math.PI); // get a ratio of required yaw / current yaw
    }
}