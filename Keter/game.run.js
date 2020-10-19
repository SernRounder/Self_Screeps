/**
 * 游戏整体相关逻辑
 */
var stateScanner = require('game.stateScanner')
var checker = require('game.checkCreeps')

module.exports = function () {
    if (Game.cpu.bucket > 9000) {
        try { Game.cpu.generatePixel(); }
        catch { }
    }
    //运行游戏状态记录& memory检测
    stateScanner()
    checker()

}
