const { carryMission } = require("./mission.def")

module.exports.linkLogic = function (room = Game.rooms[0]) {
    if (STRUCTURE_LINK in global[room.name].structList) {
        let links = [new StructureLink]
        links = global[room.name].structList[STRUCTURE_LINK]

        if (!('masterLink' in global[room.name])) {
            if (!room.storage) return
            let master = room.storage.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: function (struct) { return struct.structureType == STRUCTURE_LINK } })//离stroe 最近的link
            global[room.name].masterLink = master.id
        }
        for (let link of links) {
            if (link.id != global[room.name].masterLink) {
                if (link.cooldown == 0 && link.store.getCapacity(RESOURCE_ENERGY) - link.store[RESOURCE_ENERGY] <= 450) {
                    link.transferEnergy(Game.getObjectById(global[room.name].masterLink))
                }
            } else {
                if (link.store.getCapacity(RESOURCE_ENERGY) - link.store[RESOURCE_ENERGY] <= 150) {
                    holdMission(link)
                }
            }
        }
    }
}

function holdMission(link) {
    for (let missionID in Memory.Mission) {
        let mission = Memory.Mission[missionID]
        if (mission.MissionType != 'carry') continue
        if (mission.FromID == link.id) return
    }
    let args = {
        type: 'carry',
        FromID: link.id,
        ToID: link.room.storage.id,
        FinLogic: 'sourEmpty',
        AccLogic:'bornRoom',
        bornRoom: link.room.name
    }
    global.spLogic.commonLogic.publishMission(args)
    console.log('NEW CARRY Mission')
}
