// 将拓展签入 Creep 原型
module.exports = function () {
    _.assign(Creep.prototype, creepExtension)
}

// 自定义的 Creep 的拓展
const creepExtension = {
    fillSpawn() {
        if (this.memory.SendingType != RESOURCE_ENERGY) {
            // return false
        }
        //寻找Spawn和Extension
        var targets = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                    structure.energy < structure.energyCapacity;
            }
        });
        if (targets) { //填充最近的
            this.fillSth(RESOURCE_ENERGY, targets)
            return true
        } else {//没有需要填充的
            return false
        }
    },

    // 填充所在房间所有 tower
    fillTower(PowerLimit = 700) {
        //寻找剩下的能量在700以下的塔

        var towers = this.pos.findClosestByRange(global[this.room.name]['structList'][STRUCTURE_TOWER], {
            filter: (structure) => {
                return structure.store[RESOURCE_ENERGY] <= PowerLimit;
            }
        });
        if (towers) {
            //填充塔
            this.fillSth(RESOURCE_ENERGY, towers)
            return true
        } else {
            //没有塔
            return false
        }
    },

    // 从target处获得source
    getSource(target, sourceType = RESOURCE_ENERGY) {
        if (this.withdraw(target, sourceType) == ERR_NOT_IN_RANGE) {
            this.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
        }

    },

    // 使用source填充dist
    fillSth(source = RESOURCE_ENERGY, dist) {
        if (this.transfer(dist, source) == ERR_NOT_IN_RANGE) {
            this.moveTo(dist, { visualizePathStyle: { stroke: '#ffffff' } });
        }
    },

    //将携带的能量就近存入store
    saveSource() {
        try {
            this.fillSth("energy", global[this.room.name]['store'])
        }
        catch {
            return false
        }
        return true
    },

    //填充red-red flag标记的东西
    fillFlag() {
        for (let flagName in Game.flags) {
            var flag = Game.flags[flagName]
            if (flag.color == flag.secondaryColor && flag.color == COLOR_RED) {
                var target = this.room.lookForAt(LOOK_STRUCTURES, flag.pos)
            }
        }
        return false
    },

    //对指定对象加锁(实现锁队列)
    getLock(target) {

    },

    //到达指定flag所在房间
    move2Flag(flag = Game.flags[0], dis = 1) {
        if (!('visited' in this.memory)) {
            this.memory['visited'] = {}
        }
        if (!(flag.name in this.memory.visited)) {
            if (this.pos.getRangeTo(flag.pos) > dis) {
                this.moveTo(flag.pos)
                return true
            }
            else {
                this.memory.visited[flag.name] = 1
            }
        }
        return false

    },
    // 挖矿
    mine() {
        var sources = creep.room.find(FIND_SOURCES);
    }
}