// returns an angle's inverse, assuming it is between 0 and 360
function inverse(angle) {
    return angle < 0
    ? angle + Math.PI * 2
    : angle - Math.PI * 2
}

// returns the smaller difference between two angles
function difference(a, b) {
    let d1 = b - a
    let d2 = inverse(d1)
    // get the smaller angle difference
    return Math.abs(d1) < Math.abs(d2)
    ? d1
    : d2
}

module.exports = {
    inverse,
    difference
}