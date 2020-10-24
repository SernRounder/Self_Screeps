var tower = {
    run: function (Towers) {
        let MiniSave = 700

        for (let cont in Towers) {


            var tower = Towers[cont]

            const NeedsFix = tower.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL )//&&  structure.structureType != STRUCTURE_ROAD )
                }
            });
            
            NeedsFix.sort((a, b) => a.hits - b.hits);

            if (NeedsFix.length > 0) {
                var fixer = NeedsFix
            } else {
                var fixer = false
            }
            //attack
            const targets = tower.room.find(FIND_HOSTILE_CREEPS);


            if (targets.length > 0) {
                var enemy = targets
            } else {
                var enemy = false
            }
           
            if (enemy) {
                //直接打
                tower.attack(enemy[0])
            } else if (fixer && tower.store.getUsedCapacity(RESOURCE_ENERGY) > MiniSave) {
                if(fixer[0].hits>1000000) return //剩下的血多, 不修
                //没敌人, 而且剩的能量多了再修
                tower.repair(fixer[0])
            }
        }
    }
}
module.exports = tower
