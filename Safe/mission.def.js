class Mission {
    constructor() {
        this.MissionType = ''
        this.MissionID = ''
        this.Lock=1
        this.diffLogic=''
        this.AccLogic='anyone'
        this.FinLogic='afteTime'
        this.Weight=1
        this.EndTime=Game.time+1000//1k tick后自动删除
    }
}

class carryMission extends Mission {
    constructor(){
        super()
        this.FromID=''
        this.MissionType = 'carry'
        this.ToID=''
        this.SourceType=RESOURCE_ENERGY
        this.bornRoom='W2S41'
    }
}

class workMission extends Mission {
    constructor(){
        super()
        this.TargetID=''
        this.MissionType = 'work'
    }
}

class claimMission extends Mission{
    constructor(){
        super()
        this.TargetFlag=''
        this.MissionType='claim'
    }
}

class attackMission extends Mission{
    constructor(){
        super()
        this.TargetFlag=''
        this.MissionType='attack'
    }
}
module.exports.attackMission=attackMission
module.exports.workMission=workMission
module.exports.carryMission=carryMission
module.exports.claimMission=claimMission
