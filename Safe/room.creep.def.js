class numberLimit {
    constructor() {
        this.W2S41={
            miner : 2,
            carrier : 2,
            worker : 1,
            upgrader : 0,
            attacker : 0,
            attackerRange : 0,
            healer : 0,
            claimer : 0,
            harvester:1
        }
        this.W3S41={
            miner : 2,
            carrier : 2,
            worker : 1,
            upgrader : 3,
            attacker : 0,
            attackerRange : 0,
            healer : 0,
            claimer : 0,
            harvester:0
        }
        this.W3S44={
            miner : 2,
            carrier : 3,
            worker : 2,
            upgrader : 3,
            attacker : 0,
            attackerRange : 0,
            healer : 0,
            claimer : 0,
            harvester:0
        }
    }
}

module.exports.creepNumberLimit = numberLimit