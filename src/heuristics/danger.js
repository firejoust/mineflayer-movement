/*
**  Determines how dangerous the terrain is in a certain direction
*/

class dangerHeuristic extends costHeuristic {
    constructor(weighting, radius, depth) {
        super(weighting);
        this.radius = radius;
        this.depth = depth;
    }
}