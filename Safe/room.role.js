var towerRule = require('room.struct.tower')
var spawnRule = require('room.struct.spawn')
const { creepNumberLimit } = require('./room.creep.def')
const { buildSite } = require('./room.struct.build')
const { terminalLogic } = require('./room.struct.terminal')
const { linkLogic } = require('./room.struct.link')
const { powerSpawnLogic } = require('./room.struct.powerSpawn')

var roomRole = {
    run: function (room = Game.rooms[0]) {
        //动态数量逻辑
        
        // var Towers = room.find(FIND_STRUCTURES, {
        //     filter: { structureType: STRUCTURE_TOWER }
        // })
        terminalLogic(room)
        if (!(room.name in global)) roomRole.init(room)
        try {
            let Towers = global[room.name].structList[STRUCTURE_TOWER]
            let spawns = global[room.name].structList[STRUCTURE_SPAWN]
            let buildsites = room.find(FIND_MY_CONSTRUCTION_SITES)
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
            //运行link
            linkLogic(room)
            //发布任务
            buildSite(buildsites)

            //如果房间等级达标
            if (room.controller && room.controller.level == 8) {
                powerSpawnLogic(room)
            }

        } catch (err) {

            console.log('roomROleERROR ', err)
        }
    },
    init: function (room) {
        //初始化内存
        room.memory.creepDelta = {
            carrier: 0,
            worker: 0,
            upgrader: 0
        }

        //挂载
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
            if (STRUCTURE_SPAWN in global[room.name]['structList']) {
                global[room.name]['store'] = room.getPositionAt(structList[STRUCTURE_SPAWN][0].pos.x + 1, structList[STRUCTURE_SPAWN][0].pos.y + 1) //选择spawn附近的一点作为能量集散点
            } else {
                global[room.name]['store'] = room.getPositionAt(25, 25)
            }

        } else {
            global[room.name]['store'] = global[room.name]['structList'][STRUCTURE_SPAWN][0].pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER
                }
            })//选择最近的container作为Store
        }
    }
    let totalSources = room.find(FIND_SOURCES)//规划房间内的资源以及可用采集点
    let sources = {}
    let roomTerrain = room.getTerrain()
    for (let source of totalSources) {
        let startX = source.pos.x - 1
        let startY = source.pos.y - 1
        let workPos = 0
        for (let x = startX; x <= startX + 2; x++) {
            for (let y = startY; y <= startY + 2; y++) {
                if (roomTerrain.get(x, y) != TERRAIN_MASK_WALL) {
                    workPos += 1
                }
            }
        }
        sources[source.id] = { workPos: workPos }
    }
    global[room.name].sources = sources

}

function calcLimit(room = Game.rooms[0]) {

    //当矿工和搬运工齐全的时候, 等满了再生产
    let maxEnergy = room.energyAvailable
    let flag1 = false
    let flag2 = false//用于标记是否存在搬运工和矿工
    for (let name in Memory.creeps) {
        if (Memory.creeps[name].born.name == room.name) {
            if (Memory.creeps[name].role == 'carrier') {
                flag1 = true
            } else if (Memory.creeps[name].role == 'miner') {
                flag2 = true
            }
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
    let extralEnergy = maxEnergy - 200 //carry+work+move
    let carrierBody = {}
    carrierBody['work'] = 0 + 1
    var tempCont = extralEnergy / 50 / 2 > 8 ? 8 : parseInt(extralEnergy / 50 / 2)
    carrierBody['carry'] = tempCont + 1
    tempCont = extralEnergy / 50 / 2 > 4 ? 4 : parseInt(extralEnergy / 50 / 2)
    carrierBody['move'] = tempCont + 1

    let workerBody = {}
    tempCont = extralEnergy / 100 / 2 > 9 ? 9 : parseInt(extralEnergy / 100 / 2)
    workerBody['work'] = tempCont + 1

    tempCont = extralEnergy / 50 / 4 > 9 ? 9 : parseInt(extralEnergy / 50 / 6)
    workerBody['carry'] = tempCont + 1

    tempCont = extralEnergy / 50 / 4 > 9 ? 9 : parseInt(extralEnergy / 50 / 4)
    workerBody['move'] = tempCont + 1


    tempCont = extralEnergy / 100 > 4 ? 4 : parseInt(extralEnergy / 100)
    let minerBody = {}
    minerBody['work'] = tempCont + 1
    tempCont = (extralEnergy - (tempCont * 100)) / 50 > 3 ? 3 : parseInt((extralEnergy - (tempCont * 100)) / 50)
    minerBody['move'] = tempCont + 1
    minerBody['carry'] = 0 + 1

    let CQCBody = {}
    CQCBody.tough = 2
    CQCBody.attack = 1
    CQCBody.heal = 3
    CQCBody.rangeAttack = 4
    CQCBody.move = 10

    let RangeBody = Array(8).fill(TOUGH).concat(Array(8).fill(MOVE)).concat(Array(8).fill(RANGED_ATTACK)).concat([MOVE])

    let healerBody = Array(8).fill(TOUGH).concat(Array(8).fill(MOVE)).concat(Array(8).fill(HEAL)).concat([MOVE])

    let claimBody = {}
    claimBody.move = 4
    claimBody.claim = 1

    let harvesterBody={
        move:10,
        work:40
    }


    calcDeltaCreep(room)
    var numberLimit = new creepNumberLimit
    let limit
    try {
        limit = {
            miner: [numberLimit[room.name].miner, minerBody],
            carrier: [numberLimit[room.name].carrier, carrierBody],
            worker: [numberLimit[room.name].worker, workerBody],
            upgrader: [numberLimit[room.name].upgrader, workerBody],
            attackerCQC: [numberLimit[room.name].attackerCQC, CQCBody],
            attackerRange: [numberLimit[room.name].attackerRange, RangeBody],
            healer: [numberLimit[room.name].healer, healerBody],
            claimer: [numberLimit[room.name].claimer, claimBody],
            attacker: [numberLimit[room.name].attacker, CQCBody],
            harvester:[numberLimit[room.name].harvester,harvesterBody]
        }
    } catch (err) {
        limit = {
            miner: 2,
            carrier: 2,
            worker: 1,
            upgrader: 1
        }
        console.log('calc limit err,', err)
    }
    if ('creepDelta' in room.memory) {//动态修改
        for (let creepRole in limit) {
            if(creepRole in room.memory.creepDelta){
                limit[creepRole][0] += room.memory.creepDelta[creepRole]
            }
            
        }
    } else {
        room.memory.creepDelta = {}
    }


    room.memory['roomLimit'] = limit

}

function calcDeltaCreep(room){ //动态计算数量
    if (room.controller) {
        if (!('creepDelta' in room.memory)) {
            room.memory.creepDelta = {
                carrier: 0,
                worker: 0,
                upgrader: 0
            }
        }
        if (room.controller.level == 8 && room.terminal && room.storage) {
            if (room.terminal.store[RESOURCE_POWER] + room.storage.store[RESOURCE_POWER] < 199) {
                room.memory.creepDelta.carrier = 0
            } else {
                room.memory.creepDelta.carrier = 1
            }
            if (room.controller.ticksToDowngrade > 190000) {
                room.memory.creepDelta.worker = -1
            } else {
                room.memory.creepDelta.worker = 0
            }
        }
        if (room.storage) {
            if (room.storage.store.getUsedCapacity() < 100000) {
                room.memory.creepDelta.upgrader = -2
            } else if (room.storage.store.getUsedCapacity() > 50000) {
                room.memory.creepDelta.upgrader = 0
            }
            if(room.find(FIND_MINERALS)[0].mineralAmount==0){
                room.memory.creepDelta.harvester = -99
            }else{
                room.memory.creepDelta.harvester = 0
            }
        }
    }
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
    //专门保存carrier & miner
    let carrierNumber = 0
    let minerNumber = 0
    for (let creepName in Game.creeps) {
        let creep = Game.creeps[creepName]
        if (creep.memory.born.name == room.name) {
            let role = creep.memory.role
            if (!(role in creepCont)) {
                creepCont[role] = 0
            } else {
                creepCont[role] = creepCont[role] - 1
            }
            if (role == 'carrier') carrierNumber += 1
            if (role == 'miner') minerNumber += 1
        }
    }

    //现在只需要往spawn.room.memory['spawnQueue']里push进去那些大于0的role
    for (let role in creepCont) {
        while (creepCont[role] > 0) {
            let heavy = 1
            if (role == 'miner') heavy = minerNumber > 0 ? 2 : 9
            else if (role == 'carrier') heavy = carrierNumber > minerNumber ? 2 : 3
            spawnQueue.push([role + Game.time + Math.random().toString().substr(2, 8), role, limit[role][1], heavy])
            creepCont[role] -= 1
        }
    }
    spawnQueue.sort((orderA, orderB) => orderA[3] - orderB[3])
    room.memory['spawnQueue'] = spawnQueue


}


module.exports = roomRole;