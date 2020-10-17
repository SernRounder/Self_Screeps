// 将拓展签入 Creep 原型

// 自定义的 Creep 的拓展
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
        this.fillSth(RESOURCE_ENERGY, towers)
        return true
    } else {
        //没有塔
        return false
    }
}

function getSource(target, sourceType = RESOURCE_ENERGY) { //从指定的建筑中拿source
    if (this.withdraw(target, sourceType) == ERR_NOT_IN_RANGE) {
        this.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
    }else{
        return false
    }
    return true
}

function fillSth(source = RESOURCE_ENERGY, dist) { // 使用source填充dist
    if (this.transfer(dist, source) == ERR_NOT_IN_RANGE) {
        this.moveTo(dist, { visualizePathStyle: { stroke: '#ffffff' } });
        
    }else{
        return false
    }
    return true
}

function saveSource() { //把当前拿的energy放到存储点
    try { this.fillSth("energy", global[this.room.name]['store']) }
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
            target['LockerID'].push(this.id)
            this.memory.mission.noMission = false
        } else {
            return false
        }
    } catch { console.log('LockMissionError!'); return false }
    return true
}


function pauseMission() {
    try {
        var missionID = this.memory.mission['missionID']
        var mission = Memory.Misssion[missionID]
        Memory.Mission[missionID]['Lock'] += 1//增加一个lock
        for (let i in mission['LockerID']) {
            let creepID = mission['LockerID'][i]
            if (creepID == this.id) {
                Memory.Mission[missionID].splice(i, 1)//从mission执行队列中移除自己
            }
        }
        this.memory.mission.noMission = true
        this.memory.mission.missionID = ''
        return true
    } catch (err) { console.log(err); return false }
}

function delMission() {
    try {
        var missionID = this.memory.mission.missionID
        var mission = Memory.Mission[missionID]
        for (let creepID of mission.LockerID) {
            try {
                let creep = Game.getObjectById(creepID)
                creep.memory.mission.missionID = ''
                creep.memory.mission.noMission = true
            } catch { continue }
        }
    } catch { }
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
    delMission,
    lockMission,
    pauseMission
}