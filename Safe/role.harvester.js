var roleHarvester = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.work && creep.carry.energy == 0) {
            creep.memory.work = false
        }
        if (!creep.memory.work && creep.carry.energy == creep.carryCapacity) {
            creep.memory.work = true
        }

        if (!creep.memory.work) {
            var dropped=creep.room.find(FIND_DROPPED_RESOURCES)
            if(dropped){
                dropped.sort((a,b)=>-a.amount+b.amount)
                if (creep.pickup(dropped[0])==ERR_NOT_IN_RANGE){
                    creep.moveTo(dropped[0])
                }
            }else{
                var containers=creep.room.find(FIND_STRUCTURES,{filter:(stru)=>{return stru.structureType==STRUCTURE_CONTAINER}})
                if (containers){
                    containers.sort((a,b)=>-a.store[RESOURCE_ENERGY]+b.store[RESOURCE_ENERGY])
                    if (creep.withdraw(containers[0],RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                        creep.moveTo(containers[0])
                    }
                }else{
                    var eme=creep.room.find(FIND_STRUCTURES,{filter:(stru)=>{return stru.structureType==STRUCTURE_STORAGE}})[0]
                    if (creep.withdraw(eme[0],RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                        creep.moveTo(eme[0])
                    }
                }
            }

        }
        else {
            /*
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                        structure.energy < structure.energyCapacity;
                }
            });*/
            var targets=creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                        structure.energy < structure.energyCapacity;
                }
            });
            
            if (targets) {
                //if(false){
                if (creep.transfer(targets, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
            else {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER) &&
                            structure.energy <= structure.energyCapacity-299;
                    }
                });
                if (targets.length > 0) {
                    //if(false){
                    if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
                    }
                }
                else {
                    var targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_STORAGE) 
                            //&& structure.energy < structure.energyCapacity;
                        }
                    });
                    if (targets.length > 0) {
                        //if(false){
                        if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
                        }
                    }

                }
            }
        }
    }
}


module.exports = roleHarvester;