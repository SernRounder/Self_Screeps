var minerRule = require('creep.rule.miner');
var workerRule=require('creep.rule.worker');
var carrierRule=require('creep.rule.carrier');
var upgraderRule=require('creep.rule.upgrader')
var directRule=require('creep.rule.direct')
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
        if (creep.memory.actionMod == 'direct') {
            directRule.run(creep)
        } else {
            try {
                switcher[creep.memory.role].run(creep);
            } catch {
                try{
                    directRule.run(creep)
                }catch(error){
                    console.log(error)
                    creep.suicide()//鲨了计划外的creep
                }
            }
        }
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
                console.log(part.type,body[part.type])
            }
            
            Game.rooms[creep.memory.born].memory['spawnQueue'].push([creep.memory.role+Game.time,creep.memory.role,body,2])
        }
        //switcher['miner'].run(creep)
    }
}