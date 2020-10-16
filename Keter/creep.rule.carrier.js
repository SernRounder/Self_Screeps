module.exports = {

    run: classicRole
}

var findStructSource = function (creep, structType, sourceType = RESOURCE_ENERGY) {
    let sources = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == structType) &&
                structure.store[sourceType] > creep.store.getFreeCapacity(sourceType);
        }
    });
    sources.sort((a, b) => b.store[sourceType] - a.store[sourceType]);
    return sources
}

//creep.memory.mission={}

var getMission = function (creep) { //拿取当前可执行的权重最重的mission
    if (!('mission' in creep.memory)) {
        creep.memory.mission={}
    }
    var chooseMission
    var heav=-99999999
    for (let missionID in Memory.Mission){
        let mission=Memory.Mission[missionID]
        if(mission.Lock>0){
            let request=global.dynLogic[mission.RequestLogic](creep)
            if((request)&&(mission.Weight > heav)){
                heav=mission.Weight
                chooseMission=mission
            }
        }
    }
    creep.lockMission(chooseMission)
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
        creep.say('Im Hungry')
        creep.memory.sending = false
    }
    if ((creep.memory.sending == false) && creep.store[resourceType] == creep.store.getCapacity(creep.memory.sendingType)) {
        creep.say('Im Full')

        creep.memory.sending = true
    }
    //TODO :当前持有的东西不是自己要搬运的东西时的卸货代码

    if (creep.memory.sending) {//卸货状态
        if (creep.fillSpawn()) {//填充Spawn

        } else if (creep.fillTower()) {//填充塔

        } else if (creep.fillFlag(NeedsToFill)) { //填充其他东西
            //应该优先填充red-red flag标记的地方

        }
        else {
            creep.saveSource()
        }
    } else { //拿货状态, 旗子标记的 > 掉落的 > 墓碑中的 > container中的
        //目前只实现了从container里拿资源
        for (let flag in Game.flags) {
            //优先捡拾blue-blue flag标记的地方
            //靠近旗子
        }

        let containerSource = findStructSource(creep, STRUCTURE_CONTAINER)[0]
        if (containerSource) {
            creep.getSource(containerSource)
        }

    }
}