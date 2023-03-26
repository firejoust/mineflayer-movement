const Vec3 = require("vec3")

const PI_HALF = Math.PI / 2
const PI_DOUBLE = Math.PI * 2
const PI_RATIO = Math.PI / 180

module.exports.inject = function inject(bot, Set) {
    return class Distance {
        #weight    = 1
        #radius    = 5
        #spread    = 90
        #count     = 5
        #width     = 0
        #increment = 0.2

        weight    = Set(this, weight => this.#weight = weight)
        radius    = Set(this, radius => this.#radius = radius)
        spread    = Set(this, spread => this.#spread = spread)
        count     = Set(this, count => this.#count = count)
        width     = Set(this, width => this.#width = width)
        increment = Set(this, increment => this.#increment = increment)

        cost(yaw) {
            let cost = 0
            const vectors1 = new Array(this.#count)
            const vectors2 = new Array(this.#count) // width

            {
                // angular components
                const total = this.#spread * PI_RATIO
                const increment = total / this.#count

                // initialise relative vectors
                for (let i = 0; i < this.#count; i++) {
                    const theta = increment * i

                    // get the horizontal/vertical 2D components
                    const h = Math.cos(theta)
                    const v = Math.sin(theta)

                    // find the actual x and z
                    const x1 = -Math.sin(yaw) * h
                    const z1 = -Math.cos(yaw) * h

                    // get vector perpendicular to x and z
                    const x2 = -Math.sin(yaw + PI_HALF) * h
                    const z2 = -Math.cos(yaw + PI_HALF) * h

                    // directional component only vector
                    vectors1[i] = [x1, v, z1]
                    vectors2[i] = [x2, z2]
                }
            }

            {
                const { x, y, z } = bot.entity.position

                // find where the raycasts intercept with blocks
                for (let i = 0; i < this.#count; i++) {

                    const length = this.#radius / this.#increment

                    // initialise raycast iterator
                    for (let j = 0; j < length; j++) {
                        const pos = new Vec3(
                            vectors1[i][0] * this.#increment * j,
                            vectors1[i][1] * this.#increment * j,
                            vectors1[i][2] * this.#increment * j
                        )

                        // add horizontal offset for the width
                        const offset = Math.cos(Math.random() * PI_DOUBLE)
                        pos.x += vectors2[i][0] * offset * this.#width
                        pos.z += vectors2[i][1] * offset * this.#width
                        
                        if (bot.blockAt(pos.offset(x, y, z))?.boundingBox === 'block') {
                            cost += 1 - Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2) / this.#radius
                            break
                        }
                    }
                }

                cost /= this.#count
            }

            return cost * this.#weight
        }
    }
}