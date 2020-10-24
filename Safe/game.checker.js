//主要是检查锁状态以及清除死亡的creep
module.exports.creepMemoryCheck = function () {
    for (var name in Memory.rooms){
        if(!Game.rooms[name]){
            delete Memory.rooms[name]
        }
    }
    for (var locker in Memory.lock){
        if(Memory.lock[locker] in Game.creeps){
            continue
        }
        delete Memory.lock[locker]
        console.log('free Lock'+locker)
    }
    
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            
            try{
                if ('lock' in Memory.creeps[name]) {
                    var loc = Memory.creeps[name].lock
                    delete Memory.lock[loc]
                    console.log('Free Lock: ' + loc)
                }
                if('mission' in Memory.creeps[name]){
                    if('missionID'in Memory.creeps[name].mission){
                        let missionID = Memory.creeps[name].mission.missionID
                        if (missionID in Memory.Mission) Memory.Mission[missionID].Lock+=1
                        console.log(missionID+' FREE!')
                    }
                    //Memory['Mission'][missionID]['Lock']+=1
                    //console.log(Memory['Mission'][missionID]+'free!')
                }
            }catch{console.log('free error!!')}
            
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
};

module.exports.missionCheck = function () {
    if(Game.time %10) return
    for(let missionID in Memory.Mission){ //检测哪些mission到期
        if(global.spLogic.FinLogic[Memory.Mission[missionID].FinLogic]({mission:Memory.Mission[missionID]})){
            console.log('remove '+missionID)
            delete Memory.Mission[missionID]
        }
    }

}