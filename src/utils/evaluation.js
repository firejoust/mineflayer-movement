function cheapest(costs, angles) {
    let index = 0
    for (let i = 1; i < costs.length; i++) {
        if (costs[i] > costs[index]) index = i
    }
    return angles[index]
}

function average(costs, angles) {
    let x, z
    x = z = 0

    // add up all the angle differences to determine a new center
    for (let i = 0, il = costs.length; i < il; i++) {
        z += costs[i] * Math.cos(angles[i])
        x += costs[i] * Math.sin(angles[i])
    }

    return Math.atan2(x, z)
}

module.exports = [
    cheapest,
    average,
]