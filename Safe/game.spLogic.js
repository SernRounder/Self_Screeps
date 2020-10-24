const { carryMission, workMission, claimMission, attackMission } = require("./mission.def")

module.exports.spLogic = {
    init: function () {
        let spLogic = {
            commonLogic: {
                publishMission: publishMission,
                claim: claim,
                pubCarryMission: pubCarryMission
            },
            FinLogic: {
                dstFull: dstFull,
                sourEmpty: sourEmpty,
                noTarget: noTarget,
                afteTime: function (args = {}) { return args.mission.EndTime <= Game.time },
                never: function (args = {}) { return false }
            },
            AccLogic: {
                haveWork: haveWork,
                haveCarry: haveCarry,
                haveAttack: haveAttack,
                haveClaim: haveClaim,
                bornRoom: bornRoom,
                anyone: function (args = {}) { return true }
            }
        }
        global.spLogic = spLogic
    },
    run: function () {

    }
}

function pubCarryMission(args = {
    FromID: '', 
    ToID: '', 
    AccLogic: 'bornRoom', 
    SourceType:'',
    bornRoom:'W2S41',
    Weight:1,
}) { //发布一个运输任务
    args.type='carry'
    
}
function dstFull(args = {}) {
    let mission = args.mission
    let dest = Game.getObjectById(mission.ToID);
    if (dest.store.getFreeCapacity(mission.SourceType) > 0) {
        return false
    }
    return true
}

function sourEmpty(args = {}) {
    let mission = args.mission
    let sour = Game.getObjectById(mission.FromID)
    if (sour.store[mission.SourceType] > 0) {
        return false
    }
    return true
}
function bornRoom(args = {}) {
    let creep = args.creep
    let mission = args.mission
    return creep.memory.born.name == mission.bornRoom
}
function haveWork(args = {}) {

}
function haveCarry(args = {}) {

}
function haveClaim(args = {}) {

}
function haveAttack(args = {}) {

}
function noTarget(args = {}) {
    return Game.getObjectById(args.mission.TargetID) == null
}
function publishMission(args = {}) {
    let missionType = args.type
    let mission
    if (missionType == 'carry') {
        mission = new carryMission()
        for (let key in args) {
            mission[key] = args[key]
        }
    } else if (missionType == 'work') {
        mission = new workMission()
        for (let key in args) {
            mission[key] = args[key]
        }
    } else if (missionType == 'claim') {
        mission = new claimMission()
        for (let key in args) {
            mission[key] = args[key]

        }
    } else if (missionType == 'attack') {
        mission = new attackMission()
        for (let key in args) {
            mission[key] = args[key]
        }
    } else {
        return false
    }
    let newMissionID = missionType + Math.random().toString().substr(2, 10)
    mission.MissionID = newMissionID
    Memory.Mission[newMissionID] = mission
    console.log('New Mission Publishd: ', newMissionID)
    return true
}

var moveAndAttack = function (creep) {

}
var claim = function (creep = Game.creeps[0]) {
    var choose
    for (var flag of Game.flags) {
        if (flag.name == 'claim') {
            choose = flag
        }
    }
    if (!creep.move2Flag(choose, 1)) {
        var target = creep.room.lookForAt(LOOK_STRUCTURES, choose.pos)
        creep.claimController(target)
    }
}

