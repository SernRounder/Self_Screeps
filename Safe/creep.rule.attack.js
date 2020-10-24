module.exports = {
    run: function (creep) {

        if (!('mission' in creep.memory)) {
            creep.memory.mission = { missionID: '', noMission: true }
        }
        if (creep.memory.mission.noMission || !('noMission' in creep.memory.mission)) {
          
            if (creep.pickMission('attack')) {
                
                runMission(creep)
            }
            else creep.memory.mission.noMission = true

        } else {

            runMission(creep)
        }
    }
}

function runMission(creep = Game.creeps[0]) {
    //creep.say((creep.memory.mission.missionID in Memory.Mission))
    if (!(creep.memory.mission.missionID in Memory.Mission)) {
        creep.memory.mission = { noMission: true, missionID: '' }
        return false
    }
    creep.say('哇哦~')
    mission = Memory.Mission[creep.memory.mission.missionID]
    let targetFlag = Game.flags[mission.TargetFlag]
    if (!targetFlag) {
        delete Memory.Mission[creep.memory.mission.missionID]
        creep.memory.mission.missionID = ''
        creep.memory.mission.noMission = true
    }


    if (creep.move2Flag(targetFlag)) {

    } else {
        const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        try{
            let teamCreep=creep.pos.findInRange(FIND_MY_CREEPS,1,{filter:function(team){return team.hits<team.hitsMax}})
            if(teamCreep.length){
                teamCreep.sort((a,b)=>a.hits-b.hits)
                creep.heal(teamCreep[0])
            }else{
                if(creep.hits<creep.hitsMax){
                    creep.heal(creep)
                }
            }
        }catch(err){console.log('fight',err)}
        if (target) {
            try{
            if(creep.pos.inRangeTo(target,5)){
                creep.say(creep.move(getReverse(creep.pos.getDirectionTo(target))))
                creep.say('catch me')
            }}catch(err){console.log(err)}
            if(creep.rangedAttack(target)==ERR_NOT_IN_RANGE){
                creep.moveTo(target)
                creep.say('Fvck you')
            }
            
        } else {
            let sttarget = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
            if (sttarget) {
                if (creep.attack(sttarget) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sttarget)
                }
                if(creep.rangedAttack(sttarget)==ERR_NOT_IN_RANGE){
                creep.moveTo(sttarget)
                creep.say('Fvck you')
            }
            }else{
                delete creep.memory.visited
                creep.memory.visited={}
            }
        }
    }
}
function getReverse(number){
    let rev=[0,5,6,7,8,1,2,3,4]
    return rev[number]
}


