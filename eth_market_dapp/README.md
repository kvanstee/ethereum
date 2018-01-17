# eth_market_dapp

http://128.199.144.211:8080 rinkeby testnet.

I have this running at the above address. To test this out on localhost:

```
git clone https://github.com/kvanstee/ethereum/tree/master/eth_market_dapp.git
cd eth_market_dapp
npm install
npm run dev
```
Connect to the rinkeby network using the 'metamask' browser extension. Then navigate to localhost:8080.

This is a market for ether. The other currency can be any other currency but only ether is registered. A chat app is used to organise fiat currency transfer. There are 3 very simple contracts: a base contract 'Orders' generates either a sell order contract 'Sell_eth', or a buy order contract 'Buy_eth'. Each new sell or buy order  grants 'ownership' to the contract initiator. She can 'selfdestruct' the contract to herself and change price and volume.

Here is the code that generates a contract (Orders.sol):

```
function newSellOrder(uint price) public payable {
    require(msg.value/2 > price*5000);
    address order =(new Sell_eth).value(msg.value)(price, msg.sender, this);
    LogNewSellOrder(order);    
  }
```
```price``` is wei per smallest fiat currency unit such as a cent. Thus more than $50 value of ether is required to create the sell (and buy) order.
 
Here is the constructor of Sell_eth.sol:

```
function Sell_eth(uint _price, address _seller, address _orders) payable {
    orders = Orders(_orders);
    seller = _seller;
    price = _price;
    pending = 0;
    weiForSale = msg.value / 2;
}
```

The new sell order has the msg.value of the Order function call 'newSellOrder()' transferred directly to the msg.value of the Sell_eth contract constructor Sell_eth(). The Orders contract address 'this' allows the new sell contract to cause the Orders contract to emit a LogRemoveSellOrder event which removes the order from the table. This occurs on selfdestruct of the sell order.  

To keep the parties focused each must put up a returnable deposit equal to the contract amount. Thus a sell action will require twice the transaction value and a buy action requires a deposit of the contract amount. For example: in the above code 'weiForSale' is half the 'msg.value'. A buyer will send currency to the seller who will confirm receipt because her deposit will be returned or access to 'selfdestruct()' returned. This confirmation will also grant 2 times the transaction value to the buyer (sale + deposit). A contract cannot be terminated while the 'pending' variable > 0. For simplicity the same address cannot have more than one pending transaction in a particular contract.

There are five functions that allow wei to flow from the sell and buy contracts. Two are calls to 'selfdestruct'. Only the Sell_eth function has a push external call:

```
function confirmReceived(address _buyer) public onlySeller payable {
        require(sales[_buyer] > 0 && pending > 0);
        uint amt = sales[_buyer];
        sales[_buyer] = 0;
        _buyer.transfer(2*amt);
        pending -= 1;
        LogCashReceived(_buyer, seller);
    }
```
The 'owner' of the sell contract receives the currency from the buyer '_buyer' and calls the confirmReceived() function. If the buyer has a pending transaction in this contract, struct variables are reverted to default and wei is transferred to her.

This app is live on the rinkeby testnet at http://128.199.144.211:8080. To add an order fill out the fields below the table and click 'add new buy/sell order'. To change price or volume click on the table row and if you are the 'owner' of the contract appropriate fields will be displayed. If you are not the 'owner' the fields displayed allow buying from or selling to the contract. The fields may take a few seconds to appear. If there are no pending transactions the contract can be terminated and ether returned.


