var roomRole = require('room.role')
const mount = require('mount')
var creepsRun = require('creep.run')
var gameRun = require('game.run')

if (!('lock' in Memory)) {
    Memory.Missions = {}
}

for (var roomName in Game.rooms) {
    roomRole.init(Game.rooms[roomName])
}

console.log('init finish')

module.exports.loop = function () {
    //结构体定义

    //挂载各种附加逻辑.
    mount();
    //执行游戏整体逻辑
    gameRun();

    //运行房间逻辑
    for (var roomName in Game.rooms) {
        roomRole.run(Game.rooms[roomName])
    }
    //执行creep逻辑
    creepsRun()

}