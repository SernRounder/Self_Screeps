// 将拓展签入 Creep 原型
module.exports = function () {
    _.assign(Creep.prototype, creepExtension)
}

// 自定义的 Creep 的拓展
const creepExtension = {
    fillSpawn(){
        //寻找Spawn和Extension
        var targets=creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                    structure.energy < structure.energyCapacity;
            }
        });
        if (targets.length>0){ //填充最近的
            this.fillSth(RESOURCE_ENERGY,targets[0])
            return true
        }else{//没有需要填充的
            return false
        }
    },
    // 填充所在房间所有 tower
    fillTower(PowerLimit=700) {
        //寻找剩下的能量在700以下的塔
        var towers = this.room.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_TOWER) &&
                    structure.store[RESOURCE_ENERGY] <= PowerLimit;
            }
        });
        if (towers.length > 0){
            //填充塔
            this.fillSth(RESOURCE_ENERGY,towers[0])
            return true
        }else{
            //没有塔
            return false
        }
    },

    // 从target处获得source
    getStorSource(target,sourceType=RESOURCE_ENERGY){
        if (this.withdraw(target, sourceType) == ERR_NOT_IN_RANGE) {
            this.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
        } 
            
    },

    // 使用source填充dist
    fillSth(source=RESOURCE_ENERGY,dist){
        if (this.transfer(dist, source) == ERR_NOT_IN_RANGE) {
            this.moveTo(dist, { visualizePathStyle: { stroke: '#ffffff' } });
        }
    },

    // 挖矿
    mine(){
        
    }
}