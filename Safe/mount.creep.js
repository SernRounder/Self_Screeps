// 将拓展签入 Creep 原型

// 自定义的 Creep 的拓展
function move2Target() {
    if (!('target' in this.memory)) {
        this.memory.target = false
    }
    if (this.memory.target) {
        let target = Game.getObjectById(this.memory.target)
        if (!target) {
            this.memory.target = false
            return false
        }
        if (!this.pos.isNearTo(target)) {
            this.moveTo(target,{stroke:'#00ffff'})
            return true
        } else {
            this.memory.target = false
            return false
        }
    }
}

function fillSpawn() { //填充spawn
    if (this.memory.SendingType != RESOURCE_ENERGY) {
        // return false
    }
    //寻找Spawn和Extension
    var targets = this.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                structure.energy < structure.energyCapacity;
        }
    });
    if (targets) { //填充最近的
        this.memory.target = targets.id
        if (this.move2Target()) {
            return true
        }
        this.fillSth(RESOURCE_ENERGY, targets)
        return true
    } else {//没有需要填充的
        return false
    }
}

function fillTower(PowerLimit = 700) {
    //寻找剩下的能量在700以下的塔

    var towers = this.pos.findClosestByRange(global[this.room.name]['structList'][STRUCTURE_TOWER], {
        filter: (structure) => {
            return structure.store[RESOURCE_ENERGY] <= PowerLimit;
        }
    });
    if (towers) {
        //填充塔
        this.memory.target = towers.id
        if (this.move2Target()) {
            return true
        }
        this.fillSth(RESOURCE_ENERGY, towers)
        return true
    } else {
        //没有塔
        return false
    }
}

function getSource(target, sourceType = RESOURCE_ENERGY) { //从指定的对象中拿source, 可以指定建筑/墓碑/残骸/掉落资源
    try {
        if (target.store[sourceType] < this.store.getFreeCapacity(sourceType)) {
            return false
        }
    } catch { }

    this.memory.target = target.id
    if (this.move2Target()) {
        return true
    }
    if (this.withdraw(target, sourceType) !=ERR_INVALID_TARGET) {
        if (target.store[sourceType] < this.store.getFreeCapacity(sourceType)) {
            return false
        }
        this.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
        return true
    } else {
        let source = this.room.lookForAt(LOOK_RESOURCES, target)[0]
        if (this.pickup(source) == ERR_NOT_IN_RANGE) {
            this.moveTo(source)
            return true
        }
        else {
            return false
        }
    }

}

function fillSth(source = RESOURCE_ENERGY, dist) { // 使用source填充dist
    if (this.transfer(dist, source) == ERR_NOT_IN_RANGE) {
        this.moveTo(dist, { visualizePathStyle: { stroke: '#ffffff' } });

    } else {
        return false
    }
    return true
}

function saveSource() { //把当前拿的energy放到存储点
    try {
        var a = Game.rooms[0]
        if (this.room.storage && this.room.terminal) {
            if (this.room.storage.store[RESOURCE_ENERGY] > 0.5 * this.room.storage.store.getCapacity(RESOURCE_ENERGY)) {
                for(let sourType in this.store){
                    this.fillSth(sourType, global[this.room.name]['store'])
                }
            }
        }
        for(let sourType in this.store){
            this.fillSth(sourType, global[this.room.name]['store'])
        }
        
    }
    catch { return false }
    return true
}

function move2Flag(flag = Game.flags[0], dis = 1) {  //到达指定flag所在房间
    if (!('visited' in this.memory)) {
        this.memory['visited'] = {}
    }
    if (!(flag.name in this.memory.visited)) {
        if (this.pos.getRangeTo(flag.pos) > dis) {
            this.moveTo(flag.pos)
            return true
        }
        else {
            this.memory.visited[flag.name] = 1
        }
    }
    return false

}

function lockMission(target) {
    try {

        if (target['Lock'] > 0) {
            this.memory.mission.missionID = target.MissionID
            target['Lock'] -= 1
            this.memory.mission.noMission = false
        } else {
            return false
        }
    } catch (error) { console.log('LockMissionError!' + error); return false }
    return true
}


function pauseMission() {
    try {
        var missionID = this.memory.mission['missionID']
        Memory.Mission[missionID]['Lock'] += 1//增加一个lock
        this.memory.mission.noMission = true
        this.memory.mission.missionID = ''
        return true
    } catch (err) { console.log('pause' + err); return false }
}

function pickMission(missionType) {
    if (!('mission' in this.memory)) {
        this.memory.mission = {}
    }
    if (Object.keys(Memory.Mission).length == 0) {
        return false
    }
    var chooseMission
    var heav = -999

    for (let missionID in Memory.Mission) { //挑选任务

        let mission = Memory.Mission[missionID]
        if (missionType == 'claim') {
            this.say(mission.Lock)
        }
        if (mission.Lock > 0 && mission.MissionType == missionType) {
            let request = global.spLogic.AccLogic[mission.AccLogic]({ 'creep': this ,'mission':mission})
            this.say(request)
            if ((request) && (mission.Weight > heav)) {
                heav = mission.Weight
                chooseMission = mission

            }
        }
    }
    if (heav == -999) return false
    if (this.lockMission(chooseMission)) {
        console.log(this.name,' lock ',chooseMission.MissionID)
        if (!('SourceType' in chooseMission)) {
            return true
        }
        return true
    }
    return false
}

function mine() {

    var source = this.room.find(FIND_SOURCES_ACTIVE)
    let chooseable = []
    for (let single of source) {
        if(this.pos.isNearTo(single)){
            chooseable=[single]
            break
        }
        if (single.pos.findInRange(FIND_CREEPS, 1).length > global[this.room.name].sources[single.id].workPos) {
            continue
        }
        chooseable.push(single)
    }
    if(chooseable.length==0){
        creep.say('挖是不可能挖的')
        return false
    }
    chooseable.sort((a,b)=>-global[this.room.name].sources[a.id].workPos+global[this.room.name].sources[b.id].workPos)
    
    let choose = chooseable[0]
    if (this.harvest(choose) == ERR_NOT_IN_RANGE) {
        this.moveTo(choose, { visualizePathStyle: {} })
    }
    creep.say('挖tmd')
    return true
}

module.exports = function () {
    _.assign(Creep.prototype, creepExtension)
}
const creepExtension = {
    fillSpawn,
    fillTower,
    getSource,
    fillSth,
    saveSource,
    move2Flag,
    lockMission,
    pauseMission,
    pickMission,
    move2Target,
    mine
}