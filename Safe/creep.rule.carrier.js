const { carryMission } = require("./mission.def")

module.exports = {

    run: function (creep = Game.creeps[0]) {
        if (!('mission' in creep.memory)) {
            creep.memory.mission = { missionID: '', noMission: true }
        }
        if (creep.memory.mission.noMission) {
            if (creep.pickMission('carry')) {
                runMission(creep)
            } else {//任务拿取失败, 执行常规逻辑
                creep.memory.mission.noMission=true
                classicRole(creep)
            }
        } else {
            runMission(creep)
        }
    }
}

var findStructSource = function (creep, structType, sourceType = RESOURCE_ENERGY) {//寻找指定类型的存有指定资源的建筑
    // let sources = creep.room.find(FIND_STRUCTURES, {
    //     filter: (structure) => {
    //         return (structure.structureType == structType) &&
    //             structure.store[sourceType] > creep.store.getFreeCapacity(sourceType);
    //     }
    // });
    let sources = global[creep.room.name].structList[structType]
    let choose=[]
    for (let source of sources){
        if (source.store.getUsedCapacity(sourceType)>creep.store.getFreeCapacity(sourceType)) choose.push(source)
    }
    //sources.sort((a, b) => b.store[sourceType] - a.store[sourceType]);
    let finchoose=creep.pos.findClosestByRange(choose)
    return [finchoose]
}

//creep.memory.mission={missionID:'',noMission:True}

function runMission(creep = Game.creeps[0]) {
    var mission = Memory.Mission[creep.memory.mission.missionID]
    if(!mission){
        creep.memory.mission.missionID=''
        creep.memory.mission.noMission=true
        return false
    }
    //执行任务
    var from = Game.getObjectById(mission.FromID)
    var dist = Game.getObjectById(mission.ToID)
    var sourceType = mission.SourceType

    if (creep.memory.sending == undefined) {
        creep.memory.sending = false
    }

    if (creep.memory.sending) {//卸货状态
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
    if (creep.memory.sending && creep.store[sourceType] == 0) { creep.memory.sending = false } //状态机部分
    if ((!creep.memory.sending) && creep.store.getFreeCapacity(sourceType) == 0) { creep.memory.sending = true }
}

function classicRole(creep = Game.creeps[0]) {
    //初始化-> 去拿货 -> 拿货 -> 去卸货 -> 卸货 -> 去拿货
    if (creep.memory['sending'] == undefined) {
        creep.memory['sending'] = true
    }
    var resourceType = creep.memory['sendingType']//应该搬运的物品类型
    if (!resourceType) {//未设定类型时默认搬运能量
        resourceType = RESOURCE_ENERGY
        creep.memory['sendingType'] = resourceType
    }

    if (creep.memory.sending && creep.store[creep.memory.sendingType] == false) {//状态机部分代码, 确定应该是拿货还是卸货状态
        //creep.say('Im Hungry')
        creep.memory.sending = false
    }
    if ((creep.memory.sending == false) && creep.store[resourceType] == creep.store.getCapacity(creep.memory.sendingType)) {
        //creep.say('Im Full')

        creep.memory.sending = true
    }
    //TODO :当前持有的东西不是自己要搬运的东西时的卸货代码

    if (creep.memory.sending) {//卸货状态
        if (creep.fillSpawn()) {//填充Spawn

        } else if (creep.fillTower()) {//填充塔

        } else if (!creep.room.storage) {
            if(creep.pos.isEqualTo(global[creep.room.name].store)){
                creep.drop(creep.memory.sendingType)
            }else{
                creep.moveTo(global[creep.room.name].store)
                
            }
            
        }else{
            
            if(creep.transfer(creep.room.storage,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                creep.moveTo(creep.room.storage)
            }
        }
    } else { //拿货状态, 旗子标记的 > 掉落的 > 墓碑中的 > container中的
        //目前只实现了从container里拿和从地上捡
        let dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES,{filter:(stru)=>{return (stru.amount>creep.store.getCapacity()+50)&&stru.pos!=global[creep.room.name].store}})
        
        if (dropped) {
            if (creep.pickup(dropped) == ERR_NOT_IN_RANGE) {
                creep.moveTo(dropped)
            }
        } else {
            let containerSource = findStructSource(creep, STRUCTURE_CONTAINER)[0]
            
            if (containerSource ) {
                creep.getSource(containerSource)
            }
        }
    }
}