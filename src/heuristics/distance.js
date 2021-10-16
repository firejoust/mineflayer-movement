/*
**  Determines how clear the terrain is in a certain direction.
*/

class distanceHeuristic extends costHeuristic {
    constructor(weighting, radius, count) {
        super(weighting);
        this.radius = radius;
        this.count = count;
    }
}