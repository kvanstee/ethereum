# eth_market_dapp


This is a market for ether. There are 3 very simple contracts: a base contract 'Orders' generates either a sell order contract 'Sell_eth', or a buy order contract 'Buy_eth'. Each new sell or buy order  grants 'ownership' to the contract initiator. She can 'selfdestruct' the contract to herself and change price and volume.

Here is the code that generates a contract (Orders.sol):

```
function newSellOrder(uint price) public payable {
    require(msg.value/2 >= price*5000);
    address order =(new Sell_eth).value(msg.value)(curr, price, msg.sender, this);
    LogNewSellOrder(order);    
  }
```
```price``` is wei per smallest fiat currency unit such as a cent. Thus more than $100 value of ether is required to create the sell order and more than $50 to create the buy order.
 
Here is the constructor of Sell_eth.sol:

```
function Sell_eth(bytes3 _curr, uint _price, address _seller, address _orders) payable {
    orders = Orders(_orders);
    seller = _seller;
    curr = _curr;
    price = _price;
    pending = 0;
    weiForSale = msg.value / 2;
}
```

The new sell order has the msg.value of the Order function call ```newSellOrder()``` transferred directly to the ```msg.value``` of the Sell_eth contract constructor ```Sell_eth()```. The Orders contract address ```this``` allows the new sell contract to cause the Orders contract to emit a ```LogRemoveSellOrder()``` event which removes the order from the table. This occurs on selfdestruct of the sell order.  

To enable a trustless transaction each party must put up a returnable deposit equal to the contract amount. Thus a sell action will require twice the transaction value and a buy action requires a deposit of the contract amount. For example: in the above code ```weiForSale``` is half the ```msg.value```. A buyer will send currency to the seller who will confirm receipt because her deposit will be released. This confirmation will also send 2 times the transaction value to the buyer (sale + deposit). A contract cannot be terminated while the 'pending' variable > 0. For simplicity the same address cannot have more than one pending transaction in a particular contract.
  
There are five functions that allow wei to flow from the sell and buy contracts. Two are calls to ```selfdestruct()```. Only the Sell_eth contract has a push external call:

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
The 'owner' of the sell contract receives the currency from the buyer ```_buyer``` and calls the ```confirmReceived()``` function transferring purchase plus deposit to the buyer.

To add an order fill out the fields below the table and click 'add new buy/sell order'. To change price or volume click on the table row and if you are the 'owner' of the contract appropriate fields will be displayed. If you are not the 'owner' the fields displayed allow buying from or selling to the contract. The fields may take a few seconds to appear. If there are no pending transactions the contract can be terminated and ether returned.

A barebones working example on MAIN NETWORK is here:
dat://8bb51dd8cd4ae38db264bd7ee16c2b1a135a6cce3587b742d684e3fd014c18da. To read dat format install the node package dat:

'''sudo npm install -g dat
dat dat://8bb51dd8cd4ae38db264bd7ee16c2b1a135a6cce3587b742d684e3fd014c18da --http'''

Navigate to localhost:8080.
Firefox has an addon that supports dat protocol: https://addons.mozilla.org/en-US/firefox/addon/dat-p2p-protocol/.
Beaker browser can't install the metamask extension.

Connect to the MAIN NETWORK with the 'metamask' browser extension.  

