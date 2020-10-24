const { attackMission } = require("./mission.def")

module.exports.flagLogic={
    run:function(){
        for(let flagName in Game.flags){
            let published=false
            if('published' in Game.flags[flagName].memory){
                continue
            }
            for(let missionID in Memory.Mission){
                if('TargetFlag' in Memory.Mission[missionID]){
                    if(Memory.Mission[missionID].TargetFlag==flagName){
                        //console.log(flagName,'already publishd')
                        published=true
                        break
                    }
                }
            }
            if(published){
                continue;
            }
            let checkAttack=flagName.indexOf('attack')
            if(checkAttack!=-1 ){
                let args={
                    type:'attack',
                    EndTime:Game.time+10000,
                    TargetFlag:flagName,
                    Lock:4
                }
                global.spLogic.commonLogic.publishMission(args)
            }
            let checkClaim=flagName.indexOf('claim')
            if(checkClaim!=-1){
                let args={
                    type:'claim',
                    EndTime:Game.time+10000,
                    TargetFlag:flagName,
                    Lock:1
                }
                global.spLogic.commonLogic.publishMission(args)
            }
            let checkcarry=flagName.indexOf('fill')
            if(checkcarry!=-1){
                let choose
                let currentStor=0
                for(let roomName in Game.rooms){
                    let storage=Game.rooms[roomName].storage
                    if(storage){
                        if(currentStor<storage.store[RESOURCE_ENERGY]){
                            currentStor=storage.store[RESOURCE_ENERGY]
                            choose=storage.id
                        }
                    }
                }
                let args={
                    type:'carry',
                    FinLogic:'dstFull',
                    FromID:choose,
                    ToID:Game.flags[flagName].pos.lookFor(LOOK_STRUCTURES)[0].id,
                    Lock:1
                }
                global.spLogic.commonLogic.publishMission(args)
                Game.flags[flagName].memory.published=true
                console.log('publish carry mission! ')
            }
        }
    }
}