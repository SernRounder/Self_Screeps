const { workMission } = require("./mission.def")

module.exports = {

    run: function (creep = Game.creeps[0]) {
        if (!('mission' in creep.memory)) {
            creep.memory.mission = { missionID: '', noMission: true }
        }
        if (creep.memory.mission.noMission) {
            if (creep.pickMission('work')) {
                runMission(creep)
            } else {//任务拿取失败, 执行常规逻辑
                classicRole(creep)
            }
        } else {
            runMission(creep)
        }
    }
}

//creep.memory.mission={missionID:'',noMission:True}

function runMission(creep = Game.creeps[0]) {
    
    var mission = Memory.Mission[creep.memory.mission.missionID]
    if (!mission) {
        creep.memory.mission.missionID = ''
        creep.memory.mission.noMission = true
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

        if(creep.getSource(global[creep.room.name].store, sourceType)){
              // 从当前
        }else{
            creep.getSource(global[creep.memory.born.name].store,sourceType)
        }
        //房间里的物资集散点里拿
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