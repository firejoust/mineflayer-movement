const PI_DOUBLE = Math.PI * 2

// returns an angle's inverse, assuming it is between 0 and 360
module.exports.inverse = function(angle) {
    return angle < 0
    ? angle + PI_DOUBLE
    : angle - PI_DOUBLE
}

// returns the smaller difference between two angles
module.exports.difference = function(a, b) {
    let d1 = b - a
    let d2 = module.exports.inverse(d1)
    // get the smaller angle difference
    return Math.abs(d1) < Math.abs(d2)
    ? d1
    : d2
}