module.exports = {

    run: function (creep = Game.creeps[0]) {
        if (!('mission' in creep.memory)) {
            creep.memory.mission = { missionID: '', noMission: true }
        }
        if (creep.memory.mission.noMission) {
            if (getMission(creep)) {
                runMission(creep)
            } else {//任务拿取失败, 执行常规逻辑
                classicRole(creep)
            }
        } else {
            runMission(creep)
        }
    }
}

var findStructSource = function (creep, structType, sourceType = RESOURCE_ENERGY) {
}

//creep.memory.mission={missionID:'',noMission:True}

var getMission = function (creep) { //拿取当前可执行的权重最重的build mission
    try {
        if (!('mission' in creep.memory)) {
            creep.memory.mission = {}
        }
        if(Object.keys(Memory.Mission).length==0){
            return false
        }
        var chooseMission
        var heav = -999
        for (let missionID in Memory.Mission) {
            let mission = Memory.Mission[missionID]
            if (mission.Lock > 0 && mission.MissionType == 'worker') {
                let request = global.dynLogic[mission.RequestLogic](creep)
                if ((request) && (mission.Weight > heav)) {
                    heav = mission.Weight
                    chooseMission = mission
                }
            }
        }
    }
    catch {
        console.log('GETMISSION ERROR!')
        return false
    }

    if(creep.lockMission(chooseMission)){
        return true
    }
    return false
    
}

function runMission(creep = Game.creeps[0]) {
    var mission = Memory.Mission[creep.memory.mission.missionID]
    //检测mission是否完成
    if (global.dynLogic[mission.FinLogic](creep)) {
        creep.delMission()
        return true
    }
    //执行任务
    var dist = Game.getObjectById(mission.ToID)

    if (creep.memory.working == undefined) {
        creep.memory.working = false
    }

    if (creep.memory.working) {//建造状态
        if (creep.fillSth(sourceType, dist)) { //往建筑里放

        } else if (creep.pos.isEqualTo(dist)) { //往地上扔
            creep.drop(sourceType)
        } else {
            creep.moveTo(dist) //接近扔的地方
        }

    } else {//拿货状态
        if (creep.getSource(from, sourceType)) { // 从建筑里拿

        } else if (creep.pos.isNearTo(from)) { // 从地上拣
            creep.pickup(from)
        } else {
            creep.moveTo(from) // 靠近拣的地方
        }
    }
    if (creep.memory.working && creep.store[sourceType] == 0) { creep.memory.working = false } //状态机部分
    if ((!creep.memory.working) && creep.store.getFreeCapacity(sourceType) == 0) { creep.memory.working = true }
}

function classicRole(creep = Game.creeps[0]) {
    //初始化-> 去拿货 -> 拿货 -> 去卸货 -> 卸货 -> 去拿货
    if (creep.memory['working'] == undefined) {
        creep.memory['working'] = true
    }
    var resourceType = creep.memory['workingType']//应该搬运的物品类型
    if (!resourceType) {//未设定类型时默认搬运能量
        resourceType = RESOURCE_ENERGY
        creep.memory['workingType'] = resourceType
    }

    if (creep.memory.working && creep.store[creep.memory.workingType] == false) {//状态机部分代码, 确定应该是拿货还是卸货状态
        creep.say('Im Hungry')
        creep.memory.working = false
    }
    if ((creep.memory.working == false) && creep.store[resourceType] == creep.store.getCapacity(creep.memory.workingType)) {
        creep.say('Im Full')

        creep.memory.working = true
    }
    //TODO :当前持有的东西不是自己要搬运的东西时的卸货代码

    if (creep.memory.working) {//卸货状态
        if (creep.fillSpawn()) {//填充Spawn

        } else if (creep.fillTower()) {//填充塔

        } else {
            creep.saveSource()
        }
    } else { //拿货状态, 旗子标记的 > 掉落的 > 墓碑中的 > container中的
        //目前只实现了从container里拿和从地上捡
        let dropped = creep.room.find(FIND_DROPPED_RESOURCES)
        if (dropped) {
            dropped.sort((a, b) => b - a)
            if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(dropped)
            }
        } else {
            let containerSource = findStructSource(creep, STRUCTURE_CONTAINER)[0]
            if (containerSource) {
                creep.getSource(containerSource)
            }
        }
    }
}