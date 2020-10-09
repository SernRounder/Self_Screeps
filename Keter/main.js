var room=require('room')
var checker=requier('./checker')

var creepsRun=require('./creep.run')
var mount=require('./mount')


if (!('lock' in Memory)) {
    Memory.lock = {}
}

console.log('init finish')


module.exports.loop = function () {
    //挂载扩展
    mount()
    
    //清理memory
    checker.run()

    //运行房间逻辑
    for (var roomName in Game.rooms){
        room.run(roomName)
    }
    //让每个creep跑
    creepsRun()

}