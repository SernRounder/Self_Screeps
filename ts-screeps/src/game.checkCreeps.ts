//主要是检查锁状态以及清除死亡的creep
module.exports = function () {
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            if ('lock' in Memory.creeps[name]) {
                var loc = Memory.creeps[name].lock
                delete Memory.lock[loc]
                console.log('Free Lock: ' + loc)
            }
            if('mission' in Memory.creeps[name]){
                var missionID = Memory.creeps[name].mission
                Memory['Mission'][missionID]['Lock']+=1
                console.log(Memory['Mission'][missionID]+'free!')
            }
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
};