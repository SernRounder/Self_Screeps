/**
 * 全局统计信息扫描器
 * 负责搜集关于 cpu、memory、GCL、GPL 的相关信息
 */
module.exports.stateScanner = function () {
     // 每 20 tick 运行一次
     if (Game.time % 20) return 
  
     if (!Memory.stats) Memory.stats = {}
     //room. energy
     
     if(!Memory.stats.room) Memory.stats.room={}
     for (roomName in Game.rooms){
         if(!Memory.stats.room[roomName]) Memory.stats.room[roomName]={}
         var tower=Game.rooms[roomName].find(FIND_STRUCTURES,{filter:(s)=>{return s.structureType==STRUCTURE_TOWER}})
         let towerEnergy=0
         for (let towers of tower){
             towerEnergy+=towers.store.getUsedCapacity(RESOURCE_ENERGY)
         }
         try{
            Memory.stats.room[roomName].towersEnergy=towerEnergy
            Memory.stats.room[roomName].spawnEnergy=Game.rooms[roomName].energyAvailable
            Memory.stats.room[roomName].storeEnergy=Game.rooms[roomName].storage.store.getUsedCapacity()
            Memory.stats.room[roomName].terminalEnergy=Game.rooms[roomName].terminal.store.getUsedCapacity()
            let myNuke=Game.rooms[roomName].find(FIND_STRUCTURES,{filter:(s)=>{return s.structureType==STRUCTURE_NUKER}})[0]
            Memory.stats.room[roomName].NukeStat=(myNuke.store.getUsedCapacity(RESOURCE_ENERGY)+myNuke.store.getUsedCapacity(RESOURCE_GHODIUM))/(myNuke.store.getCapacity(RESOURCE_ENERGY)+myNuke.store.getCapacity(RESOURCE_GHODIUM))
         }catch{
             
         }
         
     }
     // 统计 GCL / GPL 的升级百分比和等级
     Memory.stats.money=Game.market.credits
     Memory.stats.gcl = (Game.gcl.progress / Game.gcl.progressTotal) * 100
     Memory.stats.gclLevel = Game.gcl.level
     Memory.stats.gpl = (Game.gpl.progress / Game.gpl.progressTotal) * 100
     Memory.stats.gplLevel = Game.gpl.level
     // CPU 的当前使用量
     Memory.stats.cpu = Game.cpu.getUsed()
     // bucket 当前剩余量
     Memory.stats.bucket = Game.cpu.bucket
}