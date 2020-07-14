var minerRule = require('miner');
var workerRule=require('builder');
var senderRule=require('sender');
var soldierRule=require('soldier')
var room=require('room')
var checker=requier('checker')
var spawnRule=require('spawn')
var switcher = {
    'miner': minerRule, //只需要5work和1move的creep
    'worker': workerRule,  //平均的creep
    'sender': senderRule, //需要侧重carry和move的creep
    'soldier': soldierRule//用于进攻的creep
};

if (!('lock' in Memory)) {
    Memory.lock = {}
}

console.log('init finish')


module.exports.loop = function () {
    //清理memory
    checker.run()

    //运行房间逻辑
    for (var roomName in Game.rooms){
        room.run(roomName)
    }
    //运行spawn逻辑
    spawnRule.run(Game.spawns)
    
    

    //让每个creep跑
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        switcher[creep.memory.role].run(creep);
        //switcher['miner'].run(creep)
    }

}