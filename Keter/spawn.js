var spawn = {
    run: function (spawns) {
        for (var cont in spawns) {
            var spawn = spawns[cont]
            var partTable={
                "work":WORK,
                'carry':CARRY,
                "move":MOVE,
                "attack":ATTACK,
                'rangeAttack':RANGED_ATTACK,
                'heal':HEAL,
                'claim':CLAIM
            }

            if (spawn.room.memory['spawnQueue'].length==0) {
                break
                //[[name,role,[part],weight],[name,role,[part],weight]]
            }

            else {
                if (!spawn.spawning) {
                    var data = spawn.room.memory['spawnQueue'].pop()
                    var name = data[0]
                    var role = data[1]
                    var bodyOrder = data[2]
                    var body=[]
                    for (let part in bodyOrder){
                        body=body.concat(Array(bodyOrder[part]).fill(partTable[part]))
                    } 
                    if (spawn.spawnCreep(body, name, { memory: { role: role,born:spawn.room } }) != 0 ){
                        spawn.room.memory['spawnQueue'].push(data)
                        console.log(spawn.spawnCreep(body, name, { memory: { role: role,born:spawn.room } }))
                    }
                }
            }


        }
    }
}
module.exports = spawn
