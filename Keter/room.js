var towerRule = require('tower')
var spawnRule = require('spawn')

var room = {
    run: function (room = Game.rooms[0]) {
        var Towers = room.find(FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_TOWER }
        })
        var extensions = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        })
        var spawns = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_SPAWN }
        })
        // 计算各种part
        // 平衡creep
        if (Game.time % 100 == 0){
            calcLimit(room)
            balanceScreep(room)
        }

        //运行塔
        towerRule.run(Towers)
        //运行spawn
        spawnRule.run(spawns)

    }
}

function calcLimit(room=Game.rooms[0]){

}

function balanceScreep(room = Game.rooms[0]) {
    var limit = room.memory['roomLimit']
    if (!limit) {

        let carrierBody =Array(0).fill(WORK).concat(Array(8).fill(CARRY)).concat(Array(8).fill(MOVE))

        let workerBody = Array(8).fill(WORK).concat(Array(6).fill(MOVE)).concat(Array(4).fill(CARRY))

        let minerBody = Array(5).fill(WORK).concat(Array(0).fill(CARRY)).concat(Array(3).fill(MOVE))

        let CQCBody=Array(8).fill(TOUGH).concat(Array(8).fill(MOVE)).concat(Array(8).fill(ATTACK)).concat([MOVE])

        let RangeBody=Array(8).fill(TOUGH).concat(Array(8).fill(MOVE)).concat(Array(8).fill(RANGED_ATTACK)).concat([MOVE])

        let healerBody=Array(8).fill(TOUGH).concat(Array(8).fill(MOVE)).concat(Array(8).fill(HEAL)).concat([MOVE])
        limit = {
            miner: [2, minerBody],
            carrier: [2, carrierBody],
            worker: [1, workerBody],
            upgrader:[1,workerBody],
            attackerCQC:[0,CQCBody],
            attackerRange:[0,RangeBody],
            healer:[0,healerBody]
        }
        room.memory['roomLimit']=limit
    }
    //初始化生成数组
    var creepCont={}
    for (let role in limit){
        creepCont[role]=limit[role][0]
    }
    room.memory['spawnQueue']=[]
    var spawnQueue=room.memory['spawnQueue']
/*重置队列
    //计算在队列里的creep
    var spawnQueue=room.memory['spawnQueue']
    if (!spawnQueue){
        spawnQueue=[]
        room.memory['spawnQueue']=spawnQueue
    }else{
        for (let cont in spawnQueue){
            data=spawnQueue[cont]
            let role = data[1]
            if (! (role in creepCont) ){
                creepCont[role]=-1
            }else{
                creepCont[role]-=1
            }
        }
    }
*/


    //计算存活的creep
    for (let creepName in Game.creeps){
        let creep=Game.creeps[creepName]
        if (creep.room==room){
            let role=creep.memory.role
            if (! (role in creepCont) ){
                creepCont[role]=-1
            }else{
                creepCont[role]-=1
            }
        }
    }
    //现在只需要往spawn.room.memory['spawnQueue']里push进去那些大于0的role
    for (let role in creepCont){
        while (creepCont[role]>0){
            spawnQueue.push([role+Game.time,role,limit[role][1],1])
            creepCont[role]-=1
        }
    }

    

}


module.exports = room;