module.exports  = {
    init: function () {
        var dynLocic = {
            'm&a': moveAndAttack,//到达并攻击flag标记的地点
            'cla': claim
        }
        global['dynLogic'] = dynLogic
    },
    run: function () {

    }
}

var moveAndAttack = function (creep) {

}
var claim = function (creep = Game.creeps[0]) {
    var choose
    for (var flag of Game.flags) {
        if (flag.name == 'claim') {
            choose = flag
        }
    }
    if (!creep.move2Flag(choose, 1)) {
        var target = creep.room.lookForAt(LOOK_STRUCTURES, choose.pos)
        creep.claimController(target)
    }
}

