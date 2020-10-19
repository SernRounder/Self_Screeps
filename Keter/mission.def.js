class Mission {
    constructor() {
        this.MissionType = ''
        this.MissionID = ''
        this.Lock=1
        this.diffLogic=''
        this.AccLogic=''
        this.FinLogic=''
        this.Weight=1
    }
}

class carrierMission extends Mission {
    constructor(){
        super()
        this.FromID=''
        this.ToID=''
        //this.SourceType=RESOURCE_ENERGY
    }
}

class workerMission extends Mission {
    constructor(){
        super()
        this.TargetID=''
    }
}

module.exports.workerMission=workerMission
module.exports.carrierMission=carrierMission
