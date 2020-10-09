var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var minerRule = require('miner');
const mount = require('./mount')

if (!('lock' in Memory)) {
    Memory.lock = {}
}
module.exports.loop = function () {
    mount();
    if (Game.cpu.bucket > 9000) {
        Game.cpu.generatePixel();
    }
    for (var name in Memory.creeps) {
        for (var name in Memory.creeps) {
            if (!Game.creeps[name]) {
                if ('lock' in Memory.creeps[name]) {
                    var loc = Memory.creeps[name].lock
                    delete Memory.lock[loc]
                    console.log('Free Lock: ' + loc)
                }
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    }

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    //console.log('Harvesters: ' + harvesters.length);
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    //console.log('up: ' + upgraders.length);
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    //console.log('builder: ' + builders.length);
    var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
    //console.log('miner: ' + miners.length);
    if (miners.length < 2) {
        var newName = 'miner' + Game.time;
        console.log('Spawning new miner: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE], newName,
            { memory: { role: 'miner' } });
    } else {
        if (harvesters.length < 2) {
            var newName = 'Harvester' + Game.time;
            console.log('Spawning new harvester: ' + newName);
            Game.spawns['Spawn1'].spawnCreep([CARRY,CARRY,CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,MOVE, MOVE, MOVE, MOVE], newName,
                { memory: { role: 'harvester' } });
        } else {
            let workerTemp = [WORK, WORK, WORK, WORK,WORK,WORK,WORK,WORK,
                CARRY, CARRY, CARRY, CARRY,
                MOVE, MOVE, MOVE, MOVE,MOVE,MOVE]
            if (upgraders.length < 1) {
                var newName = 'upgraders' + Game.time;
                console.log('Spawning new upgraders: ' + newName);
                Game.spawns['Spawn1'].spawnCreep(workerTemp, newName,
                    { memory: { role: 'upgrader' } });
            }
            if (builders.length < 1) {
                var newName = 'builder' + Game.time;
                Game.spawns['Spawn1'].spawnCreep(workerTemp, newName, { memory: { role: 'builder' } });
            }

            if (Game.spawns['Spawn1'].spawning) {
                var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
                Game.spawns['Spawn1'].room.visual.text(
                    '🛠️' + spawningCreep.memory.role,
                    Game.spawns['Spawn1'].pos.x + 1,
                    Game.spawns['Spawn1'].pos.y,
                    { align: 'left', opacity: 0.8 });
            }
        }
    }
    //fix
    const targets1 = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
        //filter: object => object.hits < object.hitsMax
        filter: (structure) => {
            return (structure.hits < structure.hitsMax && structure.hits<7770000)
        }
    });

    targets1.sort((a, b) => a.hits - b.hits);

    if (targets1.length > 0) {
        var fixer = targets1
    } else {
        var fixer = false
    }
    //attack
    const targets = Game.spawns['Spawn1'].room.find(FIND_HOSTILE_CREEPS);
    //console.log(targets.length)

    if (targets.length > 0) {
        var enemy = targets
    } else {
        var enemy = false
    }

    var Towers = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_TOWER)
        }
    });
    for (var cont in Towers) {
        var tower = Towers[cont]
        //console.log(tower.store.getUsedCapacity(RESOURCE_ENERGY))
        if (enemy) {
            //console.log(enemy.length)
            tower.attack(enemy[0])
        } else if (fixer && tower.store.getUsedCapacity(RESOURCE_ENERGY) > 700) {
            tower.repair(fixer[0])
        }

    }

    ////
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if (creep.memory.role == 'miner') {
            minerRule.run(creep)
        }
    }
}