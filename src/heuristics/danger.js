module.exports.inject = function inject(bot, Set) {
    return class Danger {
        #weight    = 0.6
        #radius    = 3
        #count     = 6
        #depth     = 2
        #descend   = false
        #increment = 0.2

        weight    = Set(this, weight => this.#weight = weight)
        radius    = Set(this, radius => this.#radius = radius)
        depth     = Set(this, depth => this.#depth = depth)
        count     = Set(this, count => this.#count = count)
        descend   = Set(this, descend => this.#descend = descend)
        increment = Set(this, increment => this.#increment = increment)

        configure = Set(this, object => {
            for (let key in object) {
                try {
                    this[key](object[key])
                } catch (e) {
                    throw new Error(`Cannot configure invalid heuristic option ${key}`)
                }
            }
        })

        cost(yaw) {
            let cost = 0
            let radius = this.#radius

            const x = -Math.sin(yaw)
            const z = -Math.cos(yaw)

            const box = new Float64Array(2)

            if (Math.abs(x) > Math.abs(z)) {
                box[0] = Math.sign(x)
                box[1] = z * Math.abs(1 / x)
            } else {
                box[0] = x * Math.abs(1 / z)
                box[1] = Math.sign(z)
            }

            box[0] *= 0.3
            box[1] *= 0.3
            
            {
                const total = this.#radius / this.#increment

                // verify there's no wall before checking depth
                for (let i = 0; i < total; i++) {
                    const x1 = x * this.#increment * i
                    const z1 = z * this.#increment * i

                    // initial raycast offset
                    const pos = bot.entity.position.offset(x1, 0, z1)
                    pos.x += box[0]
                    pos.z += box[1]

                    // initial ray has intercepted with a block
                    if (bot.blockAt(pos)?.boundingBox === 'block') {
                        radius = Math.sqrt(z1 ** 2 + z1 ** 2)
                        break
                    }
                }
            }

            {
                const count = Math.floor(this.#count * radius / this.#radius)
                const vectors = new Array(count)
                const increment = radius / count

                // initialise depth check rays
                for (let i = 0; i < count; i++) {
                    const x1 = x * increment * i
                    const z1 = z * increment * i
                    vectors[i] = [x1, -this.#depth, z1]
                }

                // find the block depth intercept
                for (let i = 0; i < count; i++) {

                    const length = this.#depth / this.#increment

                    // skip the first position
                    for (let j = 0; j <= length; j++) {
                        // no intercept found
                        if (j === length) {
                            cost += 1
                            break
                        }

                        // offset depth vector from raycast vector
                        const x1 = vectors[i][0]
                        const z1 = vectors[i][2]
                        const y = this.#increment * -j

                        // set boundingbox offset (half player width)
                        const pos = bot.entity.position.offset(x1, y, z1)
                        pos.x += box[0]
                        pos.z += box[1]
                        
                        // depth intercept with block
                        if (bot.blockAt(pos)?.boundingBox === 'block') {
                            cost += Math.abs(y) / this.#depth
                            break
                        }
                    }
                }

                if (count > 0)
                    cost /= count
                else
                    cost = 1
            }

            return this.#descend
            ? (1 - cost) * this.#weight
            : cost * this.#weight
         }
    }
}