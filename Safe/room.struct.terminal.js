

module.exports.terminalLogic = function (room = Game.rooms[0]) {
    let myTerminal = room.terminal
    if (myTerminal) { //存在终端
        for (let myOrderID in Game.market.orders) {
            let myOrders = Game.market.orders[myOrderID]
            if ((Game.time - myOrders.created > 10 && myOrders.remainingAmount == 0)) {// 清理自己结束了的order
                Game.market.cancelOrder(myOrderID)
                console.log('Remove Order: ', myOrderID)
            }
            else if (Game.time - myOrders.created > 5000) {//给长时间没成交的order降价
                let sellorders = Game.market.getAllOrders({ type: ORDER_SELL, resourceType: myOrders.resourceType });

                sellorders.sort((a, b) => a.price - b.price)//down to up let first be the chipest
                let myPrice = 1
                let total = 0
                for (let sell of sellorders) {
                    total += sell.amount
                    if (total > 20000) {
                        myPrice = sell.price - 0.001
                        break
                    }
                }//计算当前的最低价
                Game.market.changeOrderPrice(myOrders.id, myPrice)

            }
        }

        if (myTerminal.store.getUsedCapacity(RESOURCE_ENERGY) > 100000 && Object.keys(Game.market.orders).length == 0) {//达到上限, 而且没挂单
            let sellorders = Game.market.getAllOrders({ type: ORDER_SELL, resourceType: RESOURCE_ENERGY });

            sellorders.sort((a, b) => a.price - b.price)//down to up let first be the chipest
            let myPrice = 1
            let total = 0
            for (let sell of sellorders) {
                total += sell.amount
                if (total > 20000) {
                    myPrice = sell.price - 0.001
                    break
                }
            }//计算当前的最低价
            let myOrder = {
                type: ORDER_SELL,
                resourceType: RESOURCE_ENERGY,
                price: myPrice,
                totalAmount: 50000,
                roomName: "W2S41"
            }
            Game.market.createOrder(myOrder)//挂单
            console.log('create order')
        }
        if (Game.market.credits > 100000) { //余额大于100k
            buySth(RESOURCE_POWER, Game.market.credits * 0.3, myTerminal)
        }
    }
}
function buySth(resourceType, paid, terminal) {
    let sellOrders = Game.market.getAllOrders({ type: ORDER_SELL, resourceType: resourceType })
    let gassFee = 0.25
    let chipist
    let price = 9999999
    let dealamount
    for (let order of sellOrders) {
        let amount = parseInt(paid / order.price)
        let gassNeed = Game.market.calcTransactionCost(amount, order.roomName, terminal.room.name)
        let fee = gassNeed * gassFee
        let singlePrice = fee / amount + order.price
        if (singlePrice < price) {
            price = singlePrice
            chipist = order.id
            dealamount = amount
        }
    }
    Game.market.deal(chipist, dealamount, terminal.room.name)
    console.log('Deal ', resourceType, ' * ', dealamount)
}
