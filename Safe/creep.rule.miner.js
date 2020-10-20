var miner = {
    run: function (creep) {
        var sources = creep.room.find(FIND_SOURCES);
        var chooser = -1
/*        if (!('lock' in creep.room.memory)){
            creep.room.memory['lock']={}
        }
  */      if (!('workPos' in creep.memory)) {
            for (var source in sources) {
                var id = sources[source].id
                if (!(id in Memory.lock)) {
                    Memory.lock[id] = creep.name
                    creep.memory.lock = id
                    creep.memory.workPos = source
                    console.log(creep.name+' Lock '+id)
                    break
                }
            }
        }
        
        if(creep.harvest(sources[creep.memory.workPos]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[creep.memory.workPos], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    }
}
module.exports = miner;