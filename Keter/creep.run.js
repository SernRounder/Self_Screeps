var minerRule = require('miner');
var workerRule=require('builder');
var senderRule=require('sender');
var soldierRule=require('soldier');
var claimer=require('claim')
var switcher = {
    'miner': minerRule, //重点在采矿的creep
    'worker': workerRule,  //平均的creep
    'sender': senderRule, //需要侧重carry和move的creep
    'soldier': soldierRule, //用于进攻的creep
    'claimer': claimer //用于宣称的creep
};

module.exports = function () {
    //针对creep执行逻辑
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        switcher[creep.memory.role].run(creep);
        //快死了
        if (creep.ticksToLive==10){
            // 创造接班人
            Game.rooms[creep.memory.born].memory['spawnQueue'].push([creep.memory.role+Game.time,creep.memory.role,creep.body,2])
        }
        //switcher['miner'].run(creep)
    }
}