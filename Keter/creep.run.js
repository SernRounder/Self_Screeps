var minerRule = require('miner');
var workerRule=require('worker');
var carrierRule=require('carrier');
var upgraderRule=require('upgrader')
//var soldierRule=require('soldier');
//var claimer=require('claim')
var switcher = {
    'miner': minerRule, //重点在采矿的creep
    'worker': workerRule,  //平均的creep
    'upgrader':upgraderRule,
    'carrier': carrierRule, //需要侧重carry和move的creep
//    'soldier': soldierRule, //用于进攻的creep
//    'claimer': claimer //用于宣称的creep
};

module.exports = function () {
    //针对creep执行逻辑
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        switcher[creep.memory.role].run(creep);
        //快死了
        if (creep.ticksToLive==10){
            // 创造接班人
            let body={}
            for (let part in creep.body){
                if (!(part.type in body)){
                    body[part.type]=1
                }else{
                    body[part.type]+=1
                }
            }
            Game.rooms[creep.memory.born].memory['spawnQueue'].push([creep.memory.role+Game.time,creep.memory.role,body,2])
        }
        //switcher['miner'].run(creep)
    }
}