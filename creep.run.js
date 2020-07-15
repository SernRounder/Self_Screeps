var minerRule = require('miner');
var workerRule=require('builder');
var senderRule=require('sender');
var soldierRule=require('soldier');
var claimer=require('claim')
var switcher = {
    'miner': minerRule, //只需要5work和1move的creep
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
        //switcher['miner'].run(creep)
    }
}