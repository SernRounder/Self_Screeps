const { carryMission, workMission, claimMission } = require("./mission.def")

module.exports.spLogic = {
    init: function () {
        let spLogic = {
            commonLogic: {
                publishMission: publishMission,
                claim: claim
            },
            FinLogic: {
                struFull: strFull,
                noTarget: noTarget,
                afteTime: function (args = {}) { return args.mission.EndTime <= Game.time },
                never: function (args = {}) { return false }
            },
            AccLogic: {
                haveWork: haveWork,
                haveCarry: haveCarry,
                haveAttack: haveAttack,
                haveClaim: haveClaim,
                anyone: function (args = {}) { return true }
            }
        }
        global.spLogic = spLogic
    },
    run: function () {

    }
}
function strFull(args = {}) {

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

}
function publishMission(args = {}) {
    let missionType = args.type
    let mission
    if (missionType == 'carry') {
        mission = new carryMission()
        for (let key in mission) {
            if (key in args) {
                mission[key] = args[key]
            }
        }
    } else if (missionType == 'work') {
        mission = new workMission()
        for (let key in mission) {
            if (key in args) {
                mission[key] = args[key]
            }
        }
    } else if (missionType == 'claim') {
        mission = new claimMission()
        for (let key in mission) {
            if (key in args) {
                mission[key] = args[key]
            }
        }
    } else {
        return false
    }
    let newMissionID = Math.random().toString().substr(2, 10)
    mission.MissionID = newMissionID
    Memory.Mission[newMissionID] = mission
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

