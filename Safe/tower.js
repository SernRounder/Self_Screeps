var tower = {
    run: function (Towers) {
        let MiniSave = 700

        for (let cont in Towers) {


            var tower = Towers[cont]

            const NeedsFix = tower.room.find(FIND_STRUCTURES, {
                filter: object => object.hits < object.hitsMax
            });

            NeedsFix.sort((a, b) => a.hits - b.hits);

            if (NeedsFix.length > 0) {
                var fixer = NeedsFix
            } else {
                var fixer = false
            }
            //attack
            const targets = tower.room.find(FIND_HOSTILE_CREEPS);
            console.log(targets.length)

            if (targets.length > 0) {
                var enemy = targets
            } else {
                var enemy = false
            }
           
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
module.exports = tower
