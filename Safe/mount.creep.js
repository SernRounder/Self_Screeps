// 将拓展签入 Creep 原型
module.exports = function () {
    _.assign(Creep.prototype, creepExtension)
}

// 自定义的 Creep 的拓展
const creepExtension = {
    // 自定义敌人检测
    checkEnemy() { 
        // 代码实现...
    },

    // 使用当前载荷填充目的地
    fillSpawnEngry() { 
        // 代码实现...
    },

    // 填充所有 tower
    fillTower() {
        // 代码实现...
    },
    // 获得source
    getSource(){

    },
    // 使用A填充目标
    fillSth(source,dist){
        
    },
    // 挖矿
    mine(){
        
    }
}