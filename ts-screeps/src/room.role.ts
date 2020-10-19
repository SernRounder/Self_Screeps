var towerRule = require('room.struct.tower')
var spawnRule = require('room.struct.spawn')

module.exports = {
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
        //针对structSite发布任务
        

    },
    init: function (room) {
        setStructure(room)
        calcLimit(room)
        balanceScreep(room)
    }
}

function setStructure(room = Game.rooms[0]) {//静态存储对象, 省的寻找了.
    var structures = room.find(FIND_MY_STRUCTURES)
    global[room.name] = {}
     //可用对象
    var structList = {}
    for (var structure of structures) {
        let strucType = structure.structureType
        let struc = structure
        if (!(strucType in structList)) {
            structList[strucType] = [struc]
        } else {
            structList[strucType].push(struc)
        }//储存对象列表

        if (strucType == STRUCTURE_STORAGE)//储存当前房间的资源集散点
        {
            global[room.name]['store'] = struc
        }
    }
    global[room.name]['structList'] = structList
    if (!('store' in global[room.name])) {//当前房间内没有Store
        if (!(STRUCTURE_CONTAINER in global[room.name]['structList'])) {//也没有container
            global[room.name]['store'] = room.getPositionAt(structList[STRUCTURE_SPAWN][0].pos.x+5,structList[STRUCTURE_SPAWN][0].pos.y+5 ) //选择spawn附近的一点作为能量集散点
            
        } else {
            global[room.name]['store'] = global[room.name]['structList'][STRUCTURE_SPAWN][0].pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER
                }
            })//选择最近的container作为Store
        }
    }
}

function calcLimit(room = Game.rooms[0]) {
    var maxEnergy = room.energyAvailable
    if (maxEnergy < 300) {
        maxEnergy = 300
    }
    let extralEnergy:number = maxEnergy - 50 //move
    let carrierBody = {}
    carrierBody['work'] = 0
    var tempCont:number = extralEnergy / 50 / 2 > 8 ? 8 : parseInt((extralEnergy / 50 / 2).toString())
    carrierBody['carry'] = tempCont
    tempCont = extralEnergy / 50 / 2 > 8 ? 8 : parseInt((extralEnergy / 50 / 2).toString())
    carrierBody['move'] = tempCont + 1

    let workerBody = {}
    tempCont = extralEnergy / 100 / 2 > 8 ? 8 : parseInt(extralEnergy / 100 / 2)
    workerBody['work'] = tempCont

    tempCont = extralEnergy / 50 / 4 > 4 ? 4 : parseInt(extralEnergy / 50 / 4)
    workerBody['carry'] = tempCont

    tempCont = extralEnergy / 50 / 4 > 6 ? 6 : parseInt(extralEnergy / 50 / 4)
    workerBody['move'] = tempCont + 1


    tempCont = extralEnergy / 100 * 0.6 > 5 ? 5 : parseInt(extralEnergy / 100 * 0.8)
    let minerBody = {}
    minerBody['work'] = tempCont
    tempCont = extralEnergy / 100 * 0.4 > 3 ? 3 : parseInt(extralEnergy / 100 * 0.2)
    minerBody['move'] = tempCont + 1

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
                creepCont[role] = creepCont[role] - 1
            }
        }
    }
    console.log(creepCont)

    //现在只需要往spawn.room.memory['spawnQueue']里push进去那些大于0的role
    for (let role in creepCont) {
        while (creepCont[role] > 0) {
            spawnQueue.push([role + Game.time + Math.random(), role, limit[role][1], 1])
            creepCont[role] -= 1
        }
    }



}


