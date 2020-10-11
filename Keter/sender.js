var sender = {
    //初始化-> 去拿货 -> 拿货 -> 去卸货 -> 卸货 -> 去拿货
    run: function (creep = Game.creeps[0]) {
        var NeedsToFill = {
            STRUCTURE_EXTENSION: 1,
            STRUCTURE_LINK: 1,
            STRUCTURE_POWER_BANK: 1,
            STRUCTURE_POWER_SPAWN: 1,
            STRUCTURE_LAB: 1,
            STRUCTURE_TERMINAL: 1,
            STRUCTURE_NUKER: 1,
            STRUCTURE_FACTORY: 1
        }

        var resourceType = creep.memory['SendingType']//应该搬运的物品类型
        if (!resourceType) {//未设定类型时默认搬运能量
            resourceType = RESOURCE_ENERGY
            creep.memory['SendingType'] = resourceType
        }

        
        if (creep.memory.sending && creep.store[creep.memory.sendingType] == 0) {//状态机部分代码, 确定应该是拿货还是卸货状态
            creep.say('Im Hungry')
            creep.memory.sending = false
        }
        if (!creep.memory.sending && creep.store[resourceType] == creep.store.getCapacity) {
            creep.say('Im Full')
            creep.memory.sending = true
        }
        //TODO :当前持有的东西不是自己要搬运的东西时的卸货代码

        if (creep.memory.sending) {//卸货状态
            if (creep.fillSpawn()) {//填充Spawn

            } else if (creep.fillTower()) {//填充塔

            } else if (creep.fillFlag(NeedsToFill)) { //填充其他东西
                //应该优先填充red-red flag标记的地方

            }
            else {
                creep.saveSource()
            }
        } else { //拿货状态, 旗子标记的 > 掉落的 > 墓碑中的 > container中的
            for (let flag in Game.flags) {
                //优先捡拾blue-blue flag标记的地方
                //靠近旗子
            }
        }
    }
}
module.exports = sender;