var roomRole = require('room.role')
const mount = require('mount')
var creepsRun = require('creep.run')
var gameRun = require('game.run')
const { stateScanner } = require('./game.stateScanner')
const { spLogic } = require('./game.spLogic')


let startCPU=Game.cpu.getUsed()
if (!('lock' in Memory)) {
    Memory.lock = {}
    
}
if(!('Mission' in Memory)){
    Memory.Mission = {}
}

for (var roomName in Game.rooms) {
    roomRole.init(Game.rooms[roomName])
}
spLogic.init()
console.log('init finish')
console.log('init use: ',Game.cpu.getUsed()-startCPU)

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
    
    //搜集信息
    try{
        stateScanner()

    }

    catch{}
}