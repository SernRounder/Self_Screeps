const { workerMission } = require("./mission.def")

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
            classicRole(creep)
        }
    }
}

var findStructSource = function (creep, structType, sourceType = RESOURCE_ENERGY) {//寻找指定类型的存有指定资源的建筑

    let sources = global[creep.room.name].structList[structType]
    sources.sort((a, b) => b.store[sourceType] - a.store[sourceType]);
    return sources
}

//creep.memory.mission={missionID:'',noMission:True}

var getMission = function (creep) { //拿取当前可执行的权重最重的mission
    try {
        if (!('mission' in creep.memory)) {
            creep.memory.mission = {}
        }
        if (Object.keys(Memory.Mission).length == 0) {
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

    if (creep.lockMission(chooseMission)) {
        return true
    }
    return false

}

function runMission(creep = Game.creeps[0]) {
    var mission = Memory.Mission[creep.memory.mission.missionID]
    if (!mission) {
        creep.memory.mission.missionID = ''
        creep.memory.mission.noMission = true
        return false
    }
    //检测mission是否完成
    if (global.dynLogic[mission.FinLogic](creep)) {
        creep.delMission()
        return false
    }
    //执行任务
    let target = Game.getObjectById(mission.TargetID)
    let sourceType = RESOURCE_ENERGY


    if (creep.memory.working == undefined) {
        creep.memory.working = false
    }

    if (creep.memory.working) {//建造状态
        if (creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target)
        }
    } else {//拿资源状态

        creep.say(global[creep.room.name].store)
        creep.getSource(global[creep.room.name].store, sourceType)  // 从当前房间里的物资集散点里拿
        creep.say(global[creep.room.name].store)
    }
    if (creep.memory.working && creep.store[sourceType] == 0) { creep.memory.working = false } //状态机部分
    if ((!creep.memory.working) && creep.store.getFreeCapacity(sourceType) == 0) { creep.memory.working = true }
}

function classicRole(creep = Game.creeps[0]) {
    var sourceType=RESOURCE_ENERGY
    if (!('working' in creep.memory)) {
        creep.memory.working = false
    }
    if (creep.memory.working && creep.store[sourceType] == 0) {
        creep.memory.working = false
    } //状态机部分
    
    if (!(creep.memory.working) && creep.store.getFreeCapacity(sourceType) == 0) {
        creep.memory.working = true
        creep.say('work')
    }
    
    if (creep.memory.working) {


        var site = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
        
        if (site) {
            if (creep.build(site) == ERR_NOT_IN_RANGE) {
                creep.moveTo(site)
            }
        } else {
            
            const NeedsFix = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.hits < structure.hitsMax  && structure.hitsMax < 200000000)
                }
            });
            if(NeedsFix.length>0){
                
            
            NeedsFix.sort((a, b) => a.hits - b.hits);
            if(creep.repair(NeedsFix[0])==ERR_NOT_IN_RANGE){
                creep.moveTo(NeedsFix[0])
            }
                
            }else if (creep.upgradeController(global[creep.room.name].structList[STRUCTURE_CONTROLLER][0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(global[creep.room.name].structList[STRUCTURE_CONTROLLER][0])
            }
        }
    } else {
        creep.getSource(global[creep.room.name].store, sourceType)
        
    }

}