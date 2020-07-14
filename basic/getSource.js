var getSource ={
    run:function(creep=Game.creeps[0]){
        var sources = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER) &&
                    structure.energy > creep.store.getCapacity() *2;
            }
        });
        if (creep.withdraw(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#66ccff' } });
        } 
    }
}
module.exports=getSource