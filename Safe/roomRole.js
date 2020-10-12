var towerRule = require('tower')
var spawnRule = require('spawn')

var roomRole = {
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
        if (Game.time % 100 == 0) {
            calcLimit(room)
            balanceScreep(room)
        }

        //运行塔
        towerRule.run(Towers)
        //运行spawn
        spawnRule.run(spawns)

    },
    init: function(room){
        calcLimit(room)
        balanceScreep(room)
    }
}

function calcLimit(room = Game.rooms[0]) {
    var maxEnergy = room.energyAvailable
    if (maxEnergy < 300) {
        maxEnergy = 300
    }
    let extralEnergy=maxEnergy-50 //move
    let carrierBody = {}
    carrierBody['work']=0
    var tempCont=extralEnergy/50/2 > 8 ? 8 : parseInt(extralEnergy/50/2)
    carrierBody['carry']=tempCont
    tempCont=extralEnergy/50/2 > 8 ? 8 : parseInt(extralEnergy/50/2)
    carrierBody['move']=tempCont+1

    let workerBody={}
    tempCont=extralEnergy/100/2 > 8 ? 8 : parseInt(extralEnergy/100/2)
    workerBody['work']=tempCont

    tempCont=extralEnergy/50/4 > 4 ? 4 : parseInt(extralEnergy/50/4)
    workerBody['carry']=tempCont

    tempCont=extralEnergy/50/4 > 6 ? 6 : parseInt(extralEnergy/50/4)
    workerBody['move']=tempCont+1


    tempCont=extralEnergy/100*0.6 > 5 ? 5 : parseInt(extralEnergy/100*0.8)
    let minerBody = {}
    minerBody['work']=tempCont
    tempCont=extralEnergy/100*0.4 > 3 ? 3 : parseInt(extralEnergy/100*0.2)
    minerBody['move']=tempCont+1

    let CQCBody = Array(8).fill(TOUGH).concat(Array(8).fill(MOVE)).concat(Array(8).fill(ATTACK)).concat([MOVE])

    let RangeBody = Array(8).fill(TOUGH).concat(Array(8).fill(MOVE)).concat(Array(8).fill(RANGED_ATTACK)).concat([MOVE])

    let healerBody = Array(8).fill(TOUGH).concat(Array(8).fill(MOVE)).concat(Array(8).fill(HEAL)).concat([MOVE])
    var limit = {
        miner: [2, minerBody],
        carrier: [2, carrierBody],
        worker: [1, workerBody],
        upgrader: [1, workerBody],
        attackerCQC: [0, CQCBody],
        attackerRange: [0, RangeBody],
        healer: [0, healerBody]
    }
    room.memory['roomLimit'] = limit

}

function balanceScreep(room = Game.rooms[0]) {
    var limit = room.memory['roomLimit']
    //初始化生成数组
    var creepCont = {}
    for (let role in limit) {
        creepCont[role] = limit[role][0]
    }
    room.memory['spawnQueue'] = []
    var spawnQueue = room.memory['spawnQueue']
    /*重置队列, 不需要计算了
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
    for (let creepName in Game.creeps) {
        let creep = Game.creeps[creepName]
        if (creep.room == room) {
            let role = creep.memory.role
            if (!(role in creepCont)) {
                creepCont[role] = 0
            } else {
                creepCont[role] = creepCont[role]-1
            }
        }
    }
    console.log(creepCont)
    
    //现在只需要往spawn.room.memory['spawnQueue']里push进去那些大于0的role
    for (let role in creepCont) {
        while (creepCont[role] > 0) {
            spawnQueue.push([role + Game.time+Math.random(), role, limit[role][1], 1])
            creepCont[role] -= 1
        }
    }



}


module.exports = roomRole;