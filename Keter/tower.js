var tower = {
    run: function (Towers) {
        let MiniSave=900
        const NeedsFix = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
            filter: object => object.hits < object.hitsMax
        });

        NeedsFix.sort((a, b) => a.hits - b.hits);

        if (NeedsFix.length > 0) {
            var fixer = NeedsFix
        } else {
            var fixer = false
        }
        //attack
        const targets = Game.spawns['Spawn1'].room.find(FIND_HOSTILE_CREEPS);
        console.log(targets.length)

        if (targets.length > 0) {
            var enemy = targets
        } else {
            var enemy = false
        }

        for (var cont in Towers) {
            var tower = Towers[cont]
            console.log(tower.store.getUsedCapacity(RESOURCE_ENERGY))
            if (enemy) {
                //直接打
                console.log(enemy.length)
                tower.attack(enemy[0])
            } else if (fixer && tower.store.getUsedCapacity(RESOURCE_ENERGY) > MiniSave) {
                //没敌人, 而且剩的能量多了再修
                tower.repair(fixer[0])
            }

        }
    }
}
module.export=tower
