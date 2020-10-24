var miner = {
    run: function (creep=Game.creeps[0]) {
        if (creep.store[RESOURCE_ENERGY] > 0) {
            let currPosStruct = creep.pos.lookFor(LOOK_STRUCTURES)
            for (let struct of currPosStruct) {
                if (struct.structureType == STRUCTURE_CONTAINER && struct.hits < struct.hitsMax) {
                    creep.repair(struct)
                    creep.say('修罐头')
                }
            }
        }
        var sources = creep.room.find(FIND_SOURCES);
        if (!('lock' in creep.memory)) {
            for (var source in sources) {
                var id = sources[source].id
                if (id in Memory.lock) {
                    continue
                }
                Memory.lock[id] = creep.name
                creep.memory.lock = id
                console.log(creep.name+' Lock '+id)
                break
            }
        }
        
        if(creep.harvest(Game.getObjectById(creep.memory.lock)) == ERR_NOT_IN_RANGE) {
            creep.moveTo(Game.getObjectById(creep.memory.lock), {visualizePathStyle: {stroke: '#66ccff'}});
        }
        if(creep.store[RESOURCE_ENERGY]>=10){
            if(!('nearLink' in creep.memory)){
                let link=creep.pos.findInRange(FIND_MY_STRUCTURES,1,{filter:function(struct){return struct.structureType==STRUCTURE_LINK}})
                if(link.length>0){
                    creep.memory.nearLink=link[0].id
                }else{
                    creep.memory.nearLink=false
                }
            }
            if(creep.memory.nearLink){
                let link=Game.getObjectById(creep.memory.nearLink)
                creep.transfer(link,RESOURCE_ENERGY)
            }
        }
    }
}
module.exports = miner;