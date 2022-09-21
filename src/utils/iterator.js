const sign = [1, -1]
const condition = [
    (a, b) => a <= b,
    (a, b) => a >= b
]

function Direction(vec) {
    this.x = sign[Number(vec.x < 0)]
    this.y = sign[Number(vec.y < 0)]
    this.z = sign[Number(vec.z < 0)]
}

function Condition(vec) {
    this.x = condition[Number(vec.x < 0)]
    this.y = condition[Number(vec.y < 0)]
    this.z = condition[Number(vec.z < 0)]
}

// this ensures that the line will intercept with the closest block
function iterBlocks(line, callback) {
    let floored = line.getFloor()
    let diff = floored.b.minus(floored.a)
    let iter = new Direction(diff)
    let comp = new Condition(diff)

    for (let x = 0, xc = comp.x(0, diff.x); xc; x += iter.x) {
        for (let y = 0, yc = comp.y(0, diff.y); yc; y += iter.y) {
            for (let z = 0, zc = comp.z(0, diff.z); zc; z += iter.z) {

                if (
                    callback(
                        x + floored.a.x,
                        y + floored.a.y, 
                        z + floored.a.z
                    )
                )
                return

                zc = comp.z(z, diff.z)
            }
            yc = comp.y(y, diff.y)
        }
        xc = comp.x(x, diff.x)
    }
}

module.exports = {
    iterBlocks
}