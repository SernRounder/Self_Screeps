var upgrader = {
    run: function (creep) {
        if (creep.memory['upgrading']==undefined){
            creep.memory['upgrading']=true
        }

        if (creep.memory.upgrading && !creep.store[RESOURCE_ENERGY]) {//状态机部分代码, 确定应该是拿货还是卸货状态
            creep.say('Going to Harving')
            creep.memory.upgrading = false
        }
        if ((creep.memory.upgrading == false) && creep.store[RESOURCE_ENERGY] == creep.store.getCapacity(RESOURCE_ENERGY)) {
            creep.say('Going to Update')
            creep.memory.upgrading = true
        }
        if (creep.memory.upgrading) { //升级
            if (creep.pos.getRangeTo(creep.room.controller) > 2) {
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
            } else {
                creep.upgradeController(creep.room.controller)
            }

        } else {//拿货
            var sources = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_STORAGE
                }
            });
            creep.getSource(sources[0], RESOURCE_ENERGY)
        }

    }
}
module.exports = upgrader;