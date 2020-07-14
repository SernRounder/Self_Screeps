var towerRule=require('tower')

var room = {
    run: function (room = Game.rooms[0]) {
        var Towers = room.find(FIND_STRUCTURES, {//塔
            filter: { structureType: STRUCTURE_TOWER }
        })
        var contain = room.find(FIND_STRUCTURES, {//存储器
            filter: { structureType: STRUCTURE_CONTAINER }
        })
        var storage = room.find(FIND_STRUCTURES, {//储藏箱
            filter: { structureType: STRUCTURE_STORAGE }
        })
        var extensions = room.find(FIND_MY_STRUCTURES, {//扩展
            filter: { structureType: STRUCTURE_EXTENSION }
        })
        var spawns = room.find(FIND_MY_STRUCTURES, {//孵化场
            filter: { structureType: STRUCTURE_SPAWN }
        })

        var structure=room.find(FIND_STRUCTURES)
        for ( var i in structure){
            structure[i].str
        }


        var maxEnergy=calMaxEnergy(extensions,spawns) 
        if (maxEnergy>600){
            Memory['stats']=2
        }
        //运行塔
        towerRule.run(Towers)
        

    }
}
var calMaxEnergy=function(extensions=[],spawns=[]){ // 计算最大能孵化的creep
    return extensions.length*extensions[0].store.getCapacity()+spawns.length*300
}
module.exports = room;