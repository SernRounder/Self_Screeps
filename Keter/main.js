var roomRole=require('roomRole')
var checker=require('./checkCreeps')
const mount = require('./mount')
var creepsRun=require('./creep.run')



if (!('lock' in Memory)) {
    Memory.lock = {}
}

console.log('init finish')


module.exports.loop = function () {

    mount();
    //清理memory
    checker.run()

    //运行房间逻辑
    for (var roomName in Game.rooms){
        roomRole.run(Game.rooms[roomName])
    }
    //让每个creep跑
    creepsRun()

}