var spawn = {
    run: function (spawns) {
        for (var cont in spawns) {
            var spawn = spawns[cont]
            var partTable = {
                "work": WORK,
                'carry': CARRY,
                "move": MOVE,
                "attack": ATTACK,
                'rangeAttack': RANGED_ATTACK,
                'heal': HEAL,
                'claim': CLAIM
            }

            if (spawn.room.memory['spawnQueue'].length == 0) {
                break
                //[[name,role,{part},weight,workMod],[name,role,{part},weight,workMod]]
            }

            else {
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
