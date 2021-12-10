/*
**  This module contains methods that are used for raycast operations
*/

// determines the intercept closest to a coordinate
function closestIntercept(pos, posArray) {
    let d = null;
    let c = null;
    for (let i = 0, il = posArray.length; i < il; i++) {
        let qd = pos.distanceTo(posArray[i]);
        // queried position is closer to target
        if (d === null || qd < d) {
            d = qd;
            c = posArray[i];
        }
    }
    return c;
}

// determines the shortest distance an intercept lies from a coordinate
function closestDistance(pos, posArray) {
    let d = null;
    for (let i = 0, il = posArray.length; i < il; i++) {
        let qd = pos.distanceTo(posArray[i]);
        // queried position is closer to target
        if (d === null || qd < d) {
            d = qd;
        }
    }
    return d;
}

// iterates positions on a ray to determine blocks that it could intercept with (For use with line3.polyIntercept)
function blockIterator(bot, ray, length) {
    let sectors = ray.iterate(length);
    let blocks = [];

    for (let pos of sectors) {
        let block = bot.blockAt(pos);
        if (!block || block.shapes.length === 0 || block.boundingBox === 'empty') continue;
        let bp = block.position.floored();

        // transform polygons within a solid block
        for (let polygon of block.shapes) {
            blocks.push([bp.x + polygon[0], bp.y + polygon[1], bp.z + polygon[2], bp.x + polygon[3], bp.y + polygon[4], bp.z + polygon[5]]);
        }
    }
    return blocks;
}

module.exports = {
    closestIntercept,
    closestDistance,
    blockIterator,
}