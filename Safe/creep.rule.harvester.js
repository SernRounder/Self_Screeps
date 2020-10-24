module.exports = {
    run: function (creep) {
        
        mineMineral(creep)
        call2carry(creep)

    }
}
function call2carry(creep = Game.creeps[0]) {
    if (creep.memory.workContain) {
        let contain = Game.getObjectById(creep.memory.workContain)
        if (contain) {
            if (contain.store[creep.memory.mineType] / CONTAINER_CAPACITY > 0.6) {
                for (let missionID in Memory.Mission) {
                    if (Memory.Mission[missionID].MissionType != 'carry') continue
                    if (creep.memory.workContain == Memory.Mission[missionID].FromID) return
                }
                let args = {
                    type: 'carry',
                    FromID: creep.memory.workContain,
                    ToID: creep.room.storage.id,
                    AccLogic: 'bornRoom',
                    FinLogic: 'sourEmpty',
                    bornRoom: creep.room.name,
                    SourceType:creep.memory.mineType
                }
                global.spLogic.commonLogic.publishMission(args)
            }
        } else {
            creep.memory.workContain = false
        }
    } else if (creep.memory.inPos) {
        let stus = creep.pos.lookFor(LOOK_STRUCTURES)
        let contain
        for (let stu of stus) {
            if (stu.structureType == STRUCTURE_CONTAINER) {
                contain = stu
                break
            }
        }
        creep.memory.workContain = contain.id
    }
}

function mineMineral(creep = Game.creeps[0]) {
    if ('mineID' in creep.memory) {

    } else {
        let mineral = creep.room.find(FIND_MINERALS)
        creep.memory.mineType = mineral[0].mineralType
        creep.memory.mineralID=mineral[0].id
        let exacts = mineral[0].pos.lookFor(LOOK_STRUCTURES)
        
        if (exacts.length == 0) {
            creep.memory.mineID = false
            return false
        }
        let exact = exacts[0]
        creep.memory.mineID = exact.id
        creep.memory.inPos = false
    }
    if (creep.memory.mineID) {
        let exact = Game.getObjectById(creep.memory.mineID)
        if (!creep.pos.isNearTo(exact)) {
            creep.moveTo(exact)
            return true
        }
        creep.memory.inPos = true
        if (exact.cooldown) return true
        let mineral=Game.getObjectById(creep.memory.mineralID)
        creep.say(creep.harvest(mineral))
        return true
    }


}