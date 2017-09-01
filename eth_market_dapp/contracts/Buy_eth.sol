pragma solidity ^0.4.0;

import "./Orders.sol";

contract Buy_eth {
    Orders orders;
    uint weiToBuy;
    uint price; //wei per smallest currency unit (eg. cent)   
    address buyer;
    struct Seller {uint amount; uint price;}
    mapping(address => Seller) sellers;
    uint8 pending;
    modifier onlyBuyer() {require(msg.sender == buyer);  _;}
    
    event LogNewWeiToBuy(uint indexed wei_to_buy);
    event LogNewPrice(uint indexed nprice);
    event LogSalePending(address _buyer, address indexed _seller, uint value, uint _price);
    event LogCashReceived(address indexed _seller);

    function Buy_eth(uint _price, address _buyer, address _orders) payable {
	orders = Orders(_orders);
        buyer = _buyer;
        price = _price;
        pending = 0;
        weiToBuy = msg.value;
    }
    function sell() payable {
        require(sellers[msg.sender].amount == 0);
        require(msg.value > 0 && msg.value/2 < weiToBuy && (msg.value/2/price)%5000 == 0); 
        uint amt = msg.value/2;
        LogSalePending(buyer, msg.sender, amt, price);
        sellers[msg.sender] = Seller (amt, price);
        weiToBuy -= amt;
        pending += 1;
        LogNewWeiToBuy(weiToBuy);
    }

    function confirmReceived() payable {
        Seller storage seller = sellers[msg.sender];
        require(seller.amount > 0 && pending > 0);
        uint amt = seller.amount;
        seller.amount = 0;
        if (!msg.sender.send(amt)) {
            seller.amount = amt;
            return;
        }
        LogCashReceived(msg.sender);
        weiToBuy += 2*amt;
        pending -= 1;
        LogNewWeiToBuy(weiToBuy);
    }
    
    function retreive_eth(uint vol) onlyBuyer payable {  
        require(vol < weiToBuy-price*5000);
        weiToBuy -= vol;
        buyer.transfer(vol);
        LogNewWeiToBuy(weiToBuy);
    }

    function changePrice(uint new_price) onlyBuyer {
        price = new_price;
        LogNewPrice(price);
    }

    function get_price() returns(uint) {
        return price;
    }

    function get_wei_to_buy() returns(uint) {
        return weiToBuy;
    }

    function get_vars() returns(uint, uint) {
        return (weiToBuy, price);
    }

    function get_buyer() constant returns(address) {
        return buyer;
    }

   function terminate_contract() onlyBuyer payable {
        require(pending == 0);
	orders.removeBuyOrder();
        selfdestruct(buyer);
    }

   function() {throw;}
}
