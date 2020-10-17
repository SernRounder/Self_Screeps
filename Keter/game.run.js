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

    //游戏所需结构体定义
    //Memory.Mission={MissionID:{carrierMission},MissionID2:{carrierMission2}}
    const carrierMission = {
        'MissionType':'carrier',
        'MissionID': '',
        'FromID': '',
        'ToID': '',
        'SourceType': RESOURCE_ENERGY,
        "Lock": 1,
        "LockerID": [],
        "FinLogic": '',
        "RequestLogic":'',
        'Weight': 1
    }

}
