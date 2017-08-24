# eth_market_dapp

http://128.199.144.211:8080 rinkeby testnet.

This is a currency exchange for ether. The other currency can be any other currency. There are 3 very simple contracts (each about 25 lines of code): a base contract 'Orders'containing arecord of buy and sell orders and generates either a sell order contract 'Sell_eth', or a buy order contract 'Buy_eth'. Each new sell or buy order  grants 'ownership' to the contract initiator. She can 'selfdestruct' the contract to herself and change price and volume.

Here is the code that generates a contract (Orders.sol):

```
function newSellOrder(uint price) payable {
    address order =(new Sell_eth).value(msg.value)(price, msg.sender, this);
    ...........;//event
    SellOrders.push(order);
}
```

and here is the constructor of Sell_eth.sol:

```
function Sell_eth(uint _price, address _seller, address _orders) payable {
    orders = Orders(_orders);
    seller = _seller;
    price = _price;
    weiForSale = msg.value / 2;
}
```

The new sell order has the msg.value of the Order function call 'newSellOrder()' transferred directly to the msg.value of the Sell_eth contract constructor Sell_eth(). The Orders contract address 'this' allows the new sell contract to remove it's address from the SellOrders array on selfdestruct. 

To keep the parties focused each must put up a returnable deposit equal to the contract amount. Thus a sell action will require twice the transaction value and a buy action requires a deposit of the contract amount. For example: in the above code 'weiForSale' is half the 'msg.value'. A buyer will send currency to the seller who will confirm receipt because her deposit will be returned or access to 'selfdestruct()' returned. This confirmation will also grant 2 times the transaction value to the buyer (sale + deposit). A buy contract cannot be terminated while its wei balance is greater than it's volume variable(weiToBuy) and a sell contract cannot be terminated while the balance is greater than two times the volume variable (weiForSale). For simplicity the same address cannot have more than one pending transaction in a particular contract.

There are five functions that allow wei to flow from the sell and buy contracts. Two are calls to 'selfdestruct'. Only this Sell_eth function is a push external call:

```
function confirmReceived(address addr_buyer) onlySeller payable {
    Buyer storage rec_buyer = buyers[addr_buyer];
    require(rec_buyer.pending == true);
    rec_buyer.pending = false;
    uint amt = rec_buyer.amount;
    rec_buyer.amount = 0;
    addr_buyer.transfer(2*amt);
    .............;//event
}
```
The 'owner' of the sell contract receives the currency from the buyer 'addr_buyer' and calls the confirmReceived() function. If the buyer has a pending transaction in this contract, struct variables are reverted to default and wei is transferred to her.

This app is live on the rinkeby testnet at http://128.199.144.211:8080. To add an order fill out the fields below the table and click 'add new buy/sell order'. To change price or volume click on the table row and if you are the 'owner' of the contract appropriate fields will be displayed. If you are not the 'owner' the fields displayed allow buying from or selling to the contract. The fields may take a few seconds to appear. If there are no pending transactions the contract can be terminated and ether returned.

I use metamask for interaction with web3. Generally the response is less than 2 seconds.
There is no provision for conversation between parties.
