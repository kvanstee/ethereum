# eth_market_dapp 

Verification: https://etherscan.io/address/0x64eA4B84BAb5c81B35123252bbddbd483AC81ea6#code

This is a decentralised exchange (DEX) for ether and a few fiat currencies. There are 3 very simple contracts: the mother contract, Orders.sol, which generates ether a sell contract, Selleth.sol, or a buy contract, Buyeth.sol, for each inital maker transaction. A taker will interact with one contract at a time but is not restricted to one.

The maker, via Orders, produces a contract all of her own and controls the amount of ether in the contract and the ether price. If there are no pending transactions the personal contract can be terminated and all funds in the contract returned. The mother contract, Orders, does not hold any ether (or any other currency). 

To enable a trustless transaction each party will include  a returnable deposit in the payment to the contract equal to the contract amount. A sell action will require twice the transaction value and a buy action requires a deposit of the contract amount. To make a sell contract for an amount of ether will require twice the amount to initiate and a buy contract will require a deposit of the amount of ether that is wanted to buy.

Here is the code that generates a new sell contract from Orders.sol:

```
function newSellOrder(bytes3 curr, uint price) public payable {
    require(msg.value/price >= 10000);
    Sell_eth newselleth = (new Sell_eth).value(msg.value)(price, msg.sender, address(this));
    emit LogNewSellOrder(curr, address(newselleth));    
}
```
```price``` is wei per smallest fiat currency fraction such as a cent. Javascript restricts takers to odd multiples of 50 local currency units (LCU) (eg $50) to fascilitate exchange.  At least 100 LCU  value of ether is required to create a sell order and at least 50 LCU to create a buy order.
For simplicity the mother contract, Orders, does not hold arrays of orders, instead the logs are interrogated to determine the existence of a contract.
Here is the constructor of Sell_eth.sol:

```
constructor(uint _price, address _seller, address _orders) payable {
    orders = Orders(_orders);
    seller = _seller;
    price = _price;
    pending = 0;
    weiForSale = msg.value / 2;
}
```

The new sell order has the msg.value of the Order function call ```newSellOrder()``` transferred directly to the ```msg.value``` of the Sell_eth contract constructor. 

The constructor variable ```_orders``` is supplied by the newSellOrder variable ```this``` which is the orders contract address. This allows the new sell contract to communicate with the mother contract (Orders) basically to emit a ```LogRemoveSellORder``` event.  
  
There are five functions that allow wei to flow from the sell and buy contracts. Two are calls to ```selfdestruct()```. Only the Sell_eth contract has a push external call:

```
function confirmReceived(address payable _buyer) public onlySeller payable {
        require(sales[_buyer] > 0 && pending > 0);
        uint amt = sales[_buyer];
        sales[_buyer] = 0;
        _buyer.transfer(2*amt);
        pending -= 1;
        LogCashReceived(_buyer, seller);
    }
```
The 'owner' of the sell contract receives fiat currency from the buyer ```_buyer``` and calls the ```confirmReceived()``` function transferring purchase plus deposit to the buyer.

To add an order fill out the fields below the table and click 'add new buy/sell order'. To change price or volume click on the table row and if you are the 'owner' of the contract appropriate fields will be displayed. If you are not the 'owner' the fields displayed allow buying from or selling to the contract. If there are no pending transactions the contract can be terminated and ether returned. Apart from gas costs there are no transaction fees.
LIVE ON MAINNET at ethmarket@hashbase.io

##Communication
See https://github.com/kvanstee/ethereum/issues first.
I propose that each maker creats an IRC channel called `the first 5 digits of the contract's address after 0x` on `freenode` and negotiating the fiat transfer from there. Another possibility is telegram. 


