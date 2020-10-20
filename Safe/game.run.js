/**
 * 游戏整体相关逻辑
 */
const { creepMemoryCheck, missionCheck } = require('./game.checker');

module.exports = function () {
    if (Game.cpu.bucket > 9000) {
        try { Game.cpu.generatePixel(); }
        catch { }
    }
    //运行游戏状态记录& memory检测
    
    creepMemoryCheck()
    missionCheck()
}
