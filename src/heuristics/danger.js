const Vec3 = require("vec3")

module.exports.inject = function inject(bot, Set) {
    return class Danger {
        #weight  = 1

        #radius    = 5
        #count     = 20
        #depth     = 3
        #descend   = false
        #increment = 0.2

        radius    = Set(this, radius => this.#radius = radius)
        depth     = Set(this, depth => this.#depth = depth)
        count     = Set(this, count => this.#count = count)
        descend   = Set(this, descend => this.#descend = descend)
        increment = Set(this, increment => this.#increment = increment)

        constructor(weight) {
            this.#weight = weight
        }

        cost(yaw) {
            let cost = 0
            let radius = this.#radius

            const { x, y, z } = bot.entity.position

            const x1 = -Math.sin(yaw)
            const z1 = -Math.cos(yaw)
            
            {
                const total = this.#radius / this.#increment

                // verify there's no wall before checking depth
                for (let i = 0; i < total; i++) {
                    const pos = new Vec3(
                        x1 * this.#increment * i,
                        0,
                        z1 * this.#increment * i
                    )

                    // initial ray has intercepted with a block
                    if (bot.blockAt(pos.offset(x, y, z))?.boundingBox === 'block') {
                        radius = Math.sqrt(pos.x ** 2 + pos.z ** 2)
                        break
                    }
                }
            }

            {
                // skip the first position
                const count = Math.floor(this.#count * radius / this.#radius) - 1

                if (count > 0) {
                    const vectors = new Array(count)
                    const increment = radius / count

                    // initialise depth check rays
                    for (let i = 0; i < count; i++) {
                        const x2 = x1 * increment * i
                        const z2 = z1 * increment * i
                        vectors[i] = [x2, -this.#depth, z2]
                    }

                    // find the block depth intercept
                    for (let i = 0; i < count; i++) {

                        const length = this.#depth / this.#increment

                        // skip the first position
                        for (let j = 1; j <= length; j++) {
                            if (j === length) {
                                cost += 1
                                break
                            }

                            const pos = new Vec3(
                                vectors[i][0],
                                this.#increment * -j,
                                vectors[i][2]
                            )

                            if (bot.blockAt(pos.offset(x, y, z))?.boundingBox === 'block') {
                                cost += Math.abs(pos.y) / this.#depth
                                break
                            }
                        }
                    }

                    cost /= count
                }
            }

            return this.#descend
            ? (1 - cost) * this.#weight
            : cost * this.#weight
         }
    }
}