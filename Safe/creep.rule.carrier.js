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
                creep.memory.mission.noMission = true
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
    if (!sources) return false
    let choose = []
    for (let source of sources) {
        //creep.say(source.store.getUsedCapacity(sourceType))
        if (source.store.getUsedCapacity(sourceType) > creep.store.getFreeCapacity(sourceType)) choose.push(source)
    }
    //sources.sort((a, b) => b.store[sourceType] - a.store[sourceType]);
    if(choose.length==0) return []
    let finchoose = creep.pos.findClosestByRange(choose)
    return [finchoose]
}

//creep.memory.mission={missionID:'',noMission:True}

function runMission(creep = Game.creeps[0]) {
    creep.memory.fromStorage = false
    var mission = Memory.Mission[creep.memory.mission.missionID]
    if (!mission) {
        creep.memory.mission.missionID = ''
        creep.memory.mission.noMission = true
        return false
    }
    var sourceType = mission.SourceType
    for (let source in creep.store) { //丢掉所有不是目标资源类型的资源
        if (source != sourceType) {
            if (creep.transfer(creep.room.storage, source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.storage)
            }
            return
        }
    }


    if (creep.memory.sending && creep.store[sourceType] == 0) { creep.memory.sending = false } //状态机部分
    if ((!creep.memory.sending) && creep.store[sourceType] != 0) { creep.memory.sending = true }
    //检测任务完成
    let missionID = creep.memory.mission.missionID
    if (global.spLogic.FinLogic[Memory.Mission[missionID].FinLogic]({ mission: Memory.Mission[missionID] })) {
        console.log('remove ' + missionID)
        delete Memory.Mission[missionID]
    }
    //执行任务
    var from = Game.getObjectById(mission.FromID)
    var dist = Game.getObjectById(mission.ToID)

    if (creep.memory.sending == undefined) {
        creep.memory.sending = false
    }

    if (creep.memory.sending) {//卸货状态
        Game.map.visual.line(creep.pos, dist.pos,
            { color: '#66ccff', lineStyle: 'dashed' });
        if (creep.fillSth(sourceType, dist)) { //往建筑里放

        } else if (creep.pos.isEqualTo(dist)) { //往地上扔
            creep.drop(sourceType)
        } else {
            creep.moveTo(dist) //接近扔的地方
        }

    } else {//拿货状态
        Game.map.visual.line(creep.pos, from.pos,
            { color: '#ff0000', lineStyle: 'dashed' });
        if (creep.withdraw(from, sourceType) == ERR_NOT_IN_RANGE) { // 从建筑里拿
            creep.moveTo(from)
        } else if (creep.pos.isNearTo(from)) { // 从地上拣
            creep.pickup(from)
        } else {
            creep.moveTo(from) // 靠近拣的地方
        }

    }

}

function classicRole(creep = Game.creeps[0]) {
    if (creep.memory['sending'] == undefined) {
        creep.memory['sending'] = true
    }
    var resourceType = creep.memory['sendingType']//应该搬运的物品类型
    if (!resourceType) {//未设定类型时默认搬运能量
        resourceType = RESOURCE_ENERGY
        creep.memory['sendingType'] = resourceType
    }
    for (let source in creep.store) { //丢掉所有不是目标资源类型的资源
        if (source != resourceType) {
            if (creep.transfer(creep.room.storage, source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.storage)
            }
            return
        }
    }

    if (creep.memory.sending && creep.store[creep.memory.sendingType] == false) {//状态机部分代码, 确定应该是拿货还是卸货状态
        //creep.say('Im Hungry')
        creep.memory.sending = false
        creep.memory.target = false
    }
    if ((creep.memory.sending == false) && creep.store[resourceType] == creep.store.getCapacity(creep.memory.sendingType)) {
        //creep.say('Im Full')
        creep.memory.target = false
        creep.memory.sending = true
    }
    if (creep.store[RESOURCE_ENERGY] > 0) {//修路
        let currPosStruct = creep.pos.lookFor(LOOK_STRUCTURES)
        for (let struct of currPosStruct) {
            if (struct.structureType == STRUCTURE_ROAD && struct.hits < struct.hitsMax) {
                creep.repair(struct)
                creep.say('fix road')
            }
        }
    }

    if (!('target' in creep.memory)) {
        creep.memory.target = false
    }
    if (creep.memory.target) {
        let target = Game.getObjectById(creep.memory.target)
        if (!target) {
            creep.memory.target = false
            return
        }
        if (!creep.pos.isNearTo(target)) {
            creep.moveTo(target, { visualizePathStyle: { ignoreCreeps: true, stroke: '#66ccff' } })
            return
        } else {
            creep.memory.target = false
        }
    }

    //初始化-> 去拿货 -> 拿货 -> 去卸货 -> 卸货 -> 去拿货
    if (creep.room.name != creep.memory.born.name) {//在其他房间
        //creep.moveTo(Game.rooms[creep.memory.born.name].getPositionAt(25,25),{visualizePathStyle:{}})
        //    return
        creep.say(creep.memory.born.name)
        if (creep.memory.target == false) {
            creep.moveTo(Game.rooms[creep.memory.born.name].getPositionAt(25, 25), { visualizePathStyle: {} })
            return
        }
    }



    //TODO :当前持有的东西不是自己要搬运的东西时的卸货代码

    if (creep.memory.sending) {//卸货状态
        if (creep.fillSpawn()) {//填充Spawn

        } else if (creep.fillTower()) {//填充塔

        } else if (!creep.room.storage) {
            try {
                if (global[creep.room.name].store.structureType == STRUCTURE_CONTAINER) {
                    if (creep.transfer(global[creep.room.name].store, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.memory.target = global[creep.room.name].store.id
                    }
                }
            } catch { }
            if (creep.pos.isEqualTo(global[creep.room.name].store)) {
                creep.drop(creep.memory.sendingType)
            } else {
                creep.memory.target = global[creep.room.name].store.id
                creep.moveTo(global[creep.room.name].store)

            }

        } else {
            if (creep.room.terminal) {

                if (creep.room.storage.store.getUsedCapacity('energy') > 500000 && creep.room.terminal.store.getUsedCapacity('energy') < 100000) {
                    creep.say('填终端')
                    if (creep.transfer(creep.room.terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.terminal)

                    }
                    return
                }
            }
            let myNukes = creep.room.find(FIND_MY_STRUCTURES, { filter: function (stru) { return stru.structureType == STRUCTURE_NUKER } })
            if (myNukes.length && creep.room.storage.store.getUsedCapacity('energy') > 500000) {
                let myNuke = myNukes[0]
                if (myNuke.store[RESOURCE_ENERGY] < myNuke.store.getCapacity(RESOURCE_ENERGY)) {
                    creep.say('填核弹')
                    if (creep.transfer(myNuke, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(myNuke)
                        return
                    }
                }
            }
            if(creep.memory.fromStorage) return
            creep.say(creep.memory.fromStorage)
            for (let resType in creep.store) {
                
                if (creep.transfer(creep.room.storage, resType) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage)
                    break
                }
            }

        }
    } else { //拿货状态, 旗子标记的 > 掉落的 > 墓碑中的 > container中的
        //目前只实现了从container里拿和从地上捡
        //或者从stroage里拿
        creep.memory.fromStorage=false
        const tomb = creep.pos.findClosestByRange(FIND_TOMBSTONES, {//拣墓碑
            filter: function (object) {
                return object.store.getUsedCapacity() > creep.store.getFreeCapacity() * 0.4;
            }
        });
        if (tomb) {
            //if(false){
            creep.say('TOMB!')
            if (!creep.pos.isNearTo(tomb)) {
                creep.memory.target = tomb.id
                creep.moveTo(tomb)
                return
            }
            for (sourceType in tomb.store) {
                creep.withdraw(tomb, sourceType)
            }
            return
        }

        //拣残骸
        const ruin = creep.pos.findClosestByRange(FIND_RUINS, {
            filter: function (object) {
                return object.store.getUsedCapacity() > creep.store.getFreeCapacity() * 0.4;
            }
        });
        if (ruin) {
            //if(false){
            creep.say('RUIN!')
            if (!creep.pos.isNearTo(ruin)) {
                creep.memory.target = ruin.id
                creep.moveTo(ruin)
                return
            }
            for (sourceType in ruin.store) {
                creep.withdraw(ruin, sourceType)
            }
            return
        }

        let dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, { filter: (stru) => { return (stru.amount > creep.store.getCapacity() + 50) && stru.pos != global[creep.room.name].store && stru.pos != global[creep.room.name].store.pos } })

        if (dropped) {
            creep.say('pick')
            if (creep.pickup(dropped) == ERR_NOT_IN_RANGE) {
                creep.memory.target = dropped.id
            }
        } else {
            let containerSource = findStructSource(creep, STRUCTURE_CONTAINER)
            if (containerSource.length > 0) {
                creep.getSource(containerSource[0])
            } else if (creep.room.storage ) {
                creep.getSource(creep.room.storage)
                creep.memory.fromStorage=true
            }
        }

    }
}