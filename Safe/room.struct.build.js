module.exports.buildSite=function(stuSites){
    for(let building of stuSites){
        let publishd=false
        for (let missionID in Memory.Mission){
            if (Memory.Mission[missionID].MissionType=='work' && Memory.Mission[missionID].TargetID==building.id){
                publishd=true
                break
            }
        }
        if(!publishd){
            let args={
                type:'work',
                TargetID:building.id,
                FinLogic:'noTarget',
                Lock:5
            }
            global.spLogic.commonLogic.publishMission(args)
        }
    }
}