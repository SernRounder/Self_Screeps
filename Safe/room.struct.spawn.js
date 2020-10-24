var spawn = {
    run: function (spawns) {
        for (var cont in spawns) {
            var spawn = spawns[cont]
            renewCreep(spawn)


            //孵化逻辑
            var partTable = {
                "work": WORK,
                'carry': CARRY,
                "move": MOVE,
                "attack": ATTACK,
                'rangeAttack': RANGED_ATTACK,
                'heal': HEAL,
                'claim': CLAIM,
                'tough':TOUGH
            }
            if(!('spawnQueue' in spawn.room.memory)){//没任务, 直接返回
                continue
            }
            if (spawn.room.memory['spawnQueue'].length == 0) {//正在孵化
                continue
                //[[name,role,{part},weight,workMod],[name,role,{part},weight,workMod]]
            }

            else {//开始准备孵化
                if (!spawn.spawning) {
                    var data = spawn.room.memory['spawnQueue'].pop()
                    var name = data[0]
                    var role = data[1]
                    var bodyOrder = data[2]
                    var workMod = data[4]
                    if (workMod == undefined) {
                        workMod = 'auto'
                    }
                    var body = []
                    for (let part in bodyOrder) {
                        body = body.concat(Array(bodyOrder[part]).fill(partTable[part]))
                    }
                    if (spawn.spawnCreep(body, name, {
                        memory: {
                            role: role,
                            born: spawn.room,
                            actionMod: workMod,
                            mission:{}
                        }
                    }) != 0) {
                        spawn.room.memory['spawnQueue'].push(data)
                        //Game.spawns['Spawn1'].room.memory['spawnQueue'].push(['carrier','carrier',{'move':1,'work':1,'claim':1},1,'direct'])
                    }
                }
            }


        }
    }
}
module.exports = spawn

function renewCreep(singleSpawn=Game.spawns[0]){
    if(singleSpawn.spawning) return
    let closeCreeps=singleSpawn.pos.findInRange(FIND_MY_CREEPS,1)
    if(closeCreeps.length){
        closeCreeps.sort((a,b)=>a.ticksToLive-b.ticksToLive)//从小到大排序, [0]是最快死的
        let creep=closeCreeps[0]
        if(creep.ticksToLive<600){
            creep.memory.needRenew=true
        }else if(creep.ticksToLive>1400){
            creep.memory.needRenew=false
        }
        if(creep.memory.needRenew){
            singleSpawn.renewCreep(creep)
        }
    }
}