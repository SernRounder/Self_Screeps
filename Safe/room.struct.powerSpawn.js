module.exports.powerSpawnLogic = function (room = Game.rooms[0]) {
    let myPBs = room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_POWER_SPAWN } })

    if (myPBs.length) {
        let myPB = myPBs[0]
        if (myPB.processPower() == ERR_NOT_ENOUGH_RESOURCES) {
            for (let sourceType of [RESOURCE_POWER, RESOURCE_ENERGY]) {
                if (myPB.store[sourceType] == 0) {
                    call2fill(myPB, sourceType)
                }
            }
        }
    }
}
function call2fill(myPB, sourceType) {
    for (let missionID in Memory.Mission) {
        let mission = Memory.Mission[missionID]
        if (mission.MissionType == 'carry' && mission.ToID == myPB.id) return
    }
    let source = myPB.pos.findClosestByRange(FIND_STRUCTURES, { filter: function (stru) { return (stru.structureType == STRUCTURE_STORAGE || stru.structureType == STRUCTURE_TERMINAL) && stru.store[sourceType] > myPB.store.getFreeCapacity(sourceType) } })
    if (!source) return
    let args = {
        type: 'carry',
        FinLogic: 'dstFull',
        AccLogic: 'bornRoom',
        FromID: source.id,
        ToID: myPB.id,
        bornRoom: myPB.room.name,
        SourceType: sourceType
    }
    global.spLogic.commonLogic.publishMission(args)
    console.log('Need 2 fill', sourceType)
}