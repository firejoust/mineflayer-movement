/*
**  This is an example class used for creating new heuristics
*/

const assert = require("assert/strict")

class Heuristic {
    setClient(client) {
        this.client = client
    }

    // initialises the heuristic config options
    constructor(...parameters) {
        let valid = true
        parameters.forEach(_ => valid &&= _)
        assert(valid, "all heuristic parameters must be a number & higher than zero")
    };

    // executed once before applying rotations
    init() {};

    // calculates the cost of each rotation
    cost(yaw, destination) {};
}

module.exports = Heuristic;