var spawn = {
    run: function (spawns) {
        for (var cont in spawns) {
            var spawn = spawns[cont]
            queue = spawn.room.memory['spawnQueue']

            if (!spawn.room.memory['spawnQueue']) {
                spawn.room.memory['spawnQueue'] = []
                //[[name,role,[part],weight],[name,role,[part],weight]]
            }

            else {
                if (!spawn.spawning) {
                    var data = spawn.room.memory['spawnQueue'].pop()
                    var name = data[0]
                    var role = data[1]
                    var body = data[2] 
                    spawn.memory['spawning']=data
                    if (spawn.spawnCreep(body, name, { memory: { role: role,born:spawn.room } }) != 0 ){
                        spawn.room.memory['spawnQueue'].push(data)
                    }
                }
            }


        }
    }
}
module.export = spawn
