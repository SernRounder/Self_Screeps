var roleBuilder = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }

        if (creep.memory.building) {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (targets.length) {
                if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
            else {
                const targets = creep.room.find(FIND_STRUCTURES, {
                    filter: object => object.hits < object.hitsMax
                });

                targets.sort((a, b) => a.hits - b.hits);

                //if (targets.length > 0) {
                if (false) {
                    if (creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                } else {

                    if (creep.memory.building && creep.carry.energy == 0) {
                        creep.memory.upgrading = false;
                        creep.say('🔄 harvest');
                    }
                    if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
                        creep.memory.upgrading = true;
                        creep.say('⚡ upgrade');
                    }

                    if (creep.memory.building) {
                                    if(  creep.pos.getRangeTo(creep.room.controller)>2) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }else{
                creep.upgradeController(creep.room.controller)
            }
                    }
                    else {
                        //var sources = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
                        var sources = creep.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_CONTAINER) &&
                                    structure.energy > 500;
                            }
                        });
                        if (creep.withdraw(sources[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                        }
                    }
                }
            }
        }
        else {
            var sources = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE) &&
                        structure.store[RESOURCE_ENERGY] > creep.store.getFreeCapacity(RESOURCE_ENERGY);
                }
            });
            sources.sort((a, b) => b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]);
            if (creep.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
            } else {
                const target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
                if (target) {
                    if (creep.pickup(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
            }
        }
    }
};

module.exports = roleBuilder;