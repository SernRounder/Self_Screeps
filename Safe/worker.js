var worker = {
    run: function (creep) {
        if (! 'working' in creep.memory){
            creep.memory['working']=true
        }
        if (creep.memory.working && !creep.store[RESOURCE_ENERGY]) {//状态机部分代码, 确定应该是拿货还是卸货状态
            creep.say('Going to Harving')
            creep.memory.working = false
        }
        if ((creep.memory.working == false) && creep.store[RESOURCE_ENERGY] == creep.store.getCapacity(RESOURCE_ENERGY)) {
            creep.say('Going to building')
            creep.memory.working = true
        }
        if (creep.memory.working) { //建造
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (targets.length) {
                if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else {//升级控制器
                if (creep.pos.getRangeTo(creep.room.controller) > 2) {
                    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
                } else {
                    creep.upgradeController(creep.room.controller)
                }
            }
        }else{//拿货
            var sources = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER
                }
            });
            if(sources.length){
                creep.getSource(sources[0],RESOURCE_ENERGY)
            }else{
                creep.mine()
            }
            
        }
    }
}
module.exports = worker;