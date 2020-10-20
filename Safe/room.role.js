var towerRule = require('room.struct.tower')
var spawnRule = require('room.struct.spawn')
const { creepNumberLimit } = require('./room.creep.def')

var roomRole = {
    run: function (room = Game.rooms[0]) {
        // var Towers = room.find(FIND_STRUCTURES, {
        //     filter: { structureType: STRUCTURE_TOWER }
        // })
        try {
            let Towers = global[room.name].structList[STRUCTURE_TOWER]
            let spawns = global[room.name].structList[STRUCTURE_SPAWN]
            // 计算各种part
            // 平衡creep
            setStructure(room) //获取当前房间状态等信息.
            if (Game.time % 10 == 0) {
                calcLimit(room)
                balanceScreep(room)

            }

            //运行塔
            towerRule.run(Towers)
            //运行spawn
            spawnRule.run(spawns)
            //发布任务

        } catch(err) {
            console.log('roomROleERROR ',err)
        }
    },
    init: function (room) {
        setStructure(room)
        calcLimit(room)
        balanceScreep(room)
    }
}

function setStructure(room = Game.rooms[0]) {//静态存储对象, 省的寻找了.
    var structures = room.find(FIND_STRUCTURES)
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
            if(STRUCTURE_SPAWN in global[room.name]['structList']){
                global[room.name]['store'] = room.getPositionAt(structList[STRUCTURE_SPAWN][0].pos.x + 1, structList[STRUCTURE_SPAWN][0].pos.y + 1) //选择spawn附近的一点作为能量集散点
            }else{
                global[room.name]['store'] = room.getPositionAt(25,25)
            }

        } else {
            global[room.name]['store'] = global[room.name]['structList'][STRUCTURE_SPAWN][0].pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER
                }
            })//选择最近的container作为Store
        }
    }
}

function calcLimit(room = Game.rooms[0]) {

    //当矿工和搬运工齐全的时候, 等满了再生产
    let maxEnergy = room.energyAvailable
    let flag1 = false
    let flag2 = false//用于标记是否存在搬运工和矿工
    for (let name in Memory.creeps) {
        if (Memory.creeps[name].role == 'carrier') {
            flag1 = true
        } else if (Memory.creeps[name].role == 'miner') {
            flag2 = true
        }
        if (flag1 && flag2) {
            break
        }
    }
    if (flag1 && flag2) {
        maxEnergy = room.energyCapacityAvailable
    }

    if (maxEnergy < 300) {
        maxEnergy = 300
    }
    let extralEnergy = maxEnergy - 50 //move
    let carrierBody = {}
    carrierBody['work'] = 0
    var tempCont = extralEnergy / 50 / 2 > 8 ? 8 : parseInt(extralEnergy / 50 / 2)
    carrierBody['carry'] = tempCont
    tempCont = extralEnergy / 50 / 2 > 8 ? 8 : parseInt(extralEnergy / 50 / 2)
    carrierBody['move'] = tempCont + 1

    let workerBody = {}
    tempCont = extralEnergy / 100 / 2 > 8 ? 8 : parseInt(extralEnergy / 100 / 2)
    workerBody['work'] = tempCont

    tempCont = extralEnergy / 50 / 4 > 4 ? 4 : parseInt(extralEnergy / 50 / 4)
    workerBody['carry'] = tempCont

    tempCont = extralEnergy / 50 / 4 > 6 ? 6 : parseInt(extralEnergy / 50 / 4)
    workerBody['move'] = tempCont + 1


    tempCont = extralEnergy / 100 > 5 ? 5 : parseInt(extralEnergy / 100)
    let minerBody = {}
    minerBody['work'] = tempCont
    tempCont = (extralEnergy - (tempCont * 100)) / 50 > 3 ? 3 : parseInt((extralEnergy - (tempCont * 100)) / 50)
    minerBody['move'] = tempCont + 1

    let CQCBody = Array(8).fill(TOUGH).concat(Array(8).fill(MOVE)).concat(Array(8).fill(ATTACK)).concat([MOVE])

    let RangeBody = Array(8).fill(TOUGH).concat(Array(8).fill(MOVE)).concat(Array(8).fill(RANGED_ATTACK)).concat([MOVE])

    let healerBody = Array(8).fill(TOUGH).concat(Array(8).fill(MOVE)).concat(Array(8).fill(HEAL)).concat([MOVE])

    let claimBody = {}
    claimBody.move = 4
    claimBody.claim = 1
    var numberLimit = new creepNumberLimit
    var limit = {
        miner: [numberLimit.miner, minerBody],
        carrier: [numberLimit.carrier, carrierBody],
        worker: [numberLimit.worker, workerBody],
        upgrader: [numberLimit.upgrader, workerBody],
        attackerCQC: [numberLimit.attackerCQC, CQCBody],
        attackerRange: [numberLimit.attackerRange, RangeBody],
        healer: [numberLimit.healer, healerBody],
        claimer: [numberLimit.claimer, claimBody]
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
    var spawnQueue = []

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

    //现在只需要往spawn.room.memory['spawnQueue']里push进去那些大于0的role
    for (let role in creepCont) {
        while (creepCont[role] > 0) {
            let heavy = 1
            if (role == 'miner') heavy = 3
            else if (role == 'carrier') heavy = 2
            spawnQueue.push([role + Game.time + Math.random().toString().substr(2, 8), role, limit[role][1], heavy])
            creepCont[role] -= 1
        }
    }
    spawnQueue.sort((orderA, orderB) => orderA[3] - orderB[3])
    room.memory['spawnQueue'] = spawnQueue


}


module.exports = roomRole;