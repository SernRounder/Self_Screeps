var checker = {//主要是检查锁状态以及清除死亡的creep
    run: function () {
        for (var name in Memory.creeps) {
            if (!Game.creeps[name]) {
                if ('lock' in Memory.creeps[name]) {
                    var loc = Memory.creeps[name].lock
                    delete Memory.lock[loc]
                    console.log('Free Lock: ' + loc)
                }
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    }
}
module.exports = checker;