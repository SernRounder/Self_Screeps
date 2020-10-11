var sender = {
    run: function (creep=Game.creeps[0]) {
        var resourceType=creep.memory['SendingType']//应该搬运的物品类型
        if (!resourceType){//未设定类型时默认搬运能量
            resourceType=RESOURCE_ENERGY
            creep.memory['SendingType']=resourceType
        }
        if (creep.memory.sending && creep.store[creep.memory.sendingType]==0 ){//状态机部分代码, 确定应该是拿货还是卸货状态
            creep.say('Im Hungry')
            creep.memory.sending=false
        }
        if (!creep.memory.sending && creep.store[resourceType]==creep.store.getCapacity){
            creep.say('Im Full')
            creep.memory.sending=true
        }
        //TODO :当前持有的东西不是自己要搬运的东西时的卸货代码
    }
}
module.exports = sender;