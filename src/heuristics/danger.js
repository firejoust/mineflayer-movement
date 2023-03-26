const Vec3 = require("vec3")

module.exports.inject = function inject(bot, Set) {
    return class Danger {
        #weight    = 1
        #radius    = 5
        #count     = 20
        #depth     = 3
        #descend   = false
        #increment = 0.2

        weight    = Set(this, weight => this.#weight = weight)
        radius    = Set(this, radius => this.#radius = radius)
        depth     = Set(this, depth => this.#depth = depth)
        count     = Set(this, count => this.#count = count)
        descend   = Set(this, descend => this.#descend = descend)
        increment = Set(this, increment => this.#increment = increment)

        cost(yaw) {
            let cost = 0
            let radius = this.#radius

            const x1 = -Math.sin(yaw)
            const z1 = -Math.cos(yaw)
            
            {
                const total = this.#radius / this.#increment

                // verify there's no wall before checking depth
                for (let i = 0; i < total; i++) {
                    const x2 = x1 * this.#increment * i
                    const z2 = z1 * this.#increment * i
                    const pos = bot.entity.position.offset(x2, 0, z2)

                    // initial ray has intercepted with a block
                    if (bot.blockAt(pos)?.boundingBox === 'block') {
                        radius = Math.sqrt(z2 ** 2 + z2 ** 2)
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

                            // offset depth vector from original vector 
                            const x2 = vectors[i][0]
                            const y2 = this.#increment * -j
                            const z2 = vectors[i][2]
                            const pos = bot.entity.position.offset(x2, y2, z2)

                            // depth intercept with block
                            if (bot.blockAt(pos)?.boundingBox === 'block') {
                                cost += Math.abs(y2) / this.#depth
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