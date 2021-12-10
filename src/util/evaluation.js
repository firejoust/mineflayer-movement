/*
**  A collection of functions which find the best angle, accounting for all directional costs
**  - All of these operations assume that "costs" and "angles" have been sorted
*/

// gets the cheapest cost and therefore the safest direction
function cheapest(costs, angles) {
    let c;
    for (let i = 0, il = costs.length; i < il; i++) {
        if (typeof c === "undefined" || costs[i] > costs[c]) c = i;
    }
    return angles[c];
}

// accounts for all costs and averages them to find a suitable direction
function average(costs, angles) {
    let x, z;
    x = z = 0;

    // add up all the angle differences to determine a new center
    for (let i = 0, il = costs.length; i < il; i++) {
        z += costs[i] * Math.cos(angles[i]);
        x += costs[i] * Math.sin(angles[i]);
    }

    return Math.atan2(x, z);
}

module.exports = {
    cheapest,
    average,
}