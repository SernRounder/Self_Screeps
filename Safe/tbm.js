var tbm = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.inPos != true){
            var sources = creep.room.find(FIND_SOURCES);
            for (var source in sources){
                console.log(source)
            }
        }
    }
};

module.exports = tbm;