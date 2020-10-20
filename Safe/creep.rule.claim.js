const { claimMission } = require("./mission.def")

var claimer = {
    run: function (creep) {
        if (!('mission' in creep.memory)) {
            creep.memory.mission = { missionID: '', noMission: true }
        }
        if (creep.memory.mission.noMission || !('noMission' in creep.memory.mission)) {
            if(creep.pickMission('claim')) runMission(creep)
            
            else creep.memory.mission.noMission=true
            
        }else{
            runMission(creep)
        }
    }
}

function runMission(creep=Game.creeps[0]){
   
    let mission=new claimMission
    mission=Memory.Mission[creep.memory.mission.missionID]
    let targetFlag=Game.flags[mission.TargetFlag]
    if(creep.move2Flag(targetFlag)){

    }else{
        creep.say(creep.claimController(targetFlag.pos.lookFor(LOOK_STRUCTURES)[0]))
    }
}


module.exports = claimer;