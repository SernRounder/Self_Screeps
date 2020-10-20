module.exports = {
    run: function (creep=Game.creeps[0]) {
        if(!('target' in creep.memory)){
            for (let flagName in Game.flags){
                let flag=Game.flags[flagName]
                if (flag.colog==COLOR_RED && flag.secondaryColor==COLOR_WHITE){
                    global[room.name]['store']
                    creep.memory.target=''
                    break
                }
            }
        }
       
    }
}