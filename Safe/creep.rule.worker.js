const { workMission } = require("./mission.def")

module.exports = {

    run: function (creep = Game.creeps[0]) {
        if (creep.store[RESOURCE_ENERGY] > 0) {
        let currPosStruct = creep.pos.lookFor(LOOK_STRUCTURES)
        for (let struct of currPosStruct) {
            if (struct.structureType == STRUCTURE_ROAD && struct.hits < struct.hitsMax) {
                creep.repair(struct)
                creep.say('fix road')
            }
        }
    }
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
    if (!target) {
        delete Memory.Mission[creep.memory.mission.missionID]
        creep.memory.mission.missionID = ''
        creep.memory.mission.noMission = true
        return true
    }
    let sourceType = RESOURCE_ENERGY


    if (creep.memory.working == undefined) {
        creep.memory.working = false
    }
    
    if (creep.memory.working && creep.store[sourceType] == 0) { creep.memory.working = false } //状态机部分
    if ((!creep.memory.working) && creep.store.getFreeCapacity(sourceType) == 0) { creep.memory.working = true }

    if (creep.memory.working) {//建造状态
        Game.map.visual.line(creep.pos, target.pos,
            {color: '#ee82ee', lineStyle: 'dashed'});
        if (creep.build(target) == ERR_NOT_IN_RANGE) {
            
            if(Game.cpu.getUsed()<10){
                creep.moveTo(target,{visualizePathStyle:{}})
            }else{
                creep.moveTo(target,{noPathFinding: true,visualizePathStyle:{}})
            }
            
        }
    } else {//拿资源状态

        if(creep.getSource(global[creep.room.name].store, sourceType)){
              // 从当前
        }else /*if(creep.getSource(global[creep.memory.born.name].store,sourceType)){
           
        }else*/{
            let contain=creep.pos.findClosestByPath(FIND_STRUCTURES,{filter:(stru)=>{return (stru.amount>creep.store.getCapacity()+50 && stru.structureType==STRUCTURE_CONTAINER)}})
            if(contain){
                if(creep.withdraw(contain,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                    creep.moveTo(contain)
                    return
                }
            }
            let dorp = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES,{filter:(stru)=>{return (stru.amount>creep.store.getCapacity()+50)}})
            if(dorp){
                if(creep.pickup(dorp)==ERR_NOT_IN_RANGE){
                    creep.moveTo(dorp,{visualizePathStyle:{}})
                    
                }
                return
            }
            creep.mine()
        }
        //房间里的物资集散点里拿
    }
}

function classicRole(creep = Game.creeps[0]) {
    
     if(!('target' in creep.memory)){
            creep.memory.target=false
        }
        if(creep.memory.target){
            let target=Game.getObjectById(creep.memory.target)
            if(!target) {
                creep.memory.target=false
                return
            }
            if(!creep.pos.isNearTo(target)){
                creep.moveTo(target,{visualizePathStyle: {stroke: '#00ccff'}})
                return
            }else{
                creep.memory.target=false
            }
        }
    
    if (creep.room.name != creep.memory.born.name) {//在其他房间
        //creep.moveTo(Game.rooms[creep.memory.born.name].getPositionAt(25,25),{visualizePathStyle:{}})
        //    return
        creep.say(creep.memory.born.name)
        if (creep.memory.target == false) {
            creep.moveTo(Game.rooms[creep.memory.born.name].getPositionAt(25, 25), { visualizePathStyle: {} })
            return
        }
    }
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
        } else if(global[creep.room.name].structList[STRUCTURE_TOWER].length==0) {
            creep.say('Fix')
            const NeedsFix = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.hits < structure.hitsMax  && structure.hitsMax < 200000000)
                }
            });
            if(NeedsFix.length>0){  
            NeedsFix.sort((a, b) => a.hits - b.hits);
            if(creep.repair(NeedsFix[0])==ERR_NOT_IN_RANGE){
                creep.memory.target=NeedsFix[0].id
            }
                
            }else if (creep.upgradeController(global[creep.room.name].structList[STRUCTURE_CONTROLLER][0]) == ERR_NOT_IN_RANGE) {
                creep.memory.target=global[creep.room.name].structList[STRUCTURE_CONTROLLER][0].id
            }
        }else {
            if (creep.upgradeController(global[creep.room.name].structList[STRUCTURE_CONTROLLER][0]) == ERR_NOT_IN_RANGE) {
                creep.memory.target=global[creep.room.name].structList[STRUCTURE_CONTROLLER][0].id
        }}
    } else {
        if(creep.getSource(global[creep.room.name].store, sourceType)){
            return
        }else{
            if(creep.store[RESOURCE_ENERGY]==creep.store.getCapacity(RESOURCE_ENERGY)) return
            let contain=creep.pos.findClosestByPath(FIND_STRUCTURES,{filter: function(struct){return struct.structureType==STRUCTURE_CONTAINER && struct.store[RESOURCE_ENERGY]>creep.store.getCapacity()}})
            
            if(contain){
                if(creep.withdraw(contain,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                    creep.moveTo(contain)
                    creep.memory.target=contain.id
                    creep.say('容器!')
                    return
                }
            }
            var source=creep.room.find(FIND_SOURCES)
            
            if(creep.harvest(source[1])==ERR_NOT_IN_RANGE){
                creep.moveTo(source[1],{visualizePathStyle:{}})
            }
        }
        
    }

}