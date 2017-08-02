pragma solidity ^0.4.0;

import "./Orders.sol";

contract Buy_eth {
    Orders orders;
    uint weiToBuy;
    uint price; //wei per smallest currency unit (eg. cent)   
    address buyer;
    struct Seller {uint amount; uint price; bool pending;}
    mapping(address => Seller) sellers;

    modifier onlyBuyer() { require(msg.sender == buyer);  _; }
    
    event newWeiToBuy(uint indexed wei_to_buy);
    event newPrice(uint indexed nprice);
    event salePending(address indexed _seller, uint value, uint price);
    event cashReceived(address indexed _seller);

    function Buy_eth(uint _price, address _buyer, address _orders) payable {
	orders = Orders(_orders);
        buyer = _buyer;
        price = _price;
        weiToBuy = msg.value;
    }
    function sell() payable {
        require((msg.value/2/price)%5000 == 0 && sellers[msg.sender].pending == false);
        uint amt = msg.value/2;
        salePending(msg.sender, amt, price);
        sellers[msg.sender] = Seller (amt, price, true);
        weiToBuy -= amt;
        newWeiToBuy(weiToBuy);
    }

    function confirmReceived() payable {
        Seller storage seller = sellers[msg.sender];
        require(seller.pending == true);
        seller.pending = false;
        uint amt = seller.amount;
        seller.amount = 0;
        msg.sender.transfer(amt);
        cashReceived(msg.sender);
        weiToBuy += 2*amt;
        newWeiToBuy(weiToBuy);
    }
    
    function retreive_eth(uint vol) onlyBuyer payable {  
        require(vol < weiToBuy-price*5000);
        buyer.transfer(vol);
        newWeiToBuy(weiToBuy - vol);
    }
    function changePrice(uint new_price) onlyBuyer {
        price = new_price;
        newPrice(price);
    }
   
    function get_cont_bal() returns(uint balance) {
        return this.balance;
    }

    function get_price() returns(uint price) {
        return price;
    }

    function get_wei_to_buy() returns(uint) {
        return weiToBuy;
    }

    function get_values() returns(uint, uint) {
        return (weiToBuy, price);
    }

    function get_buyer() constant returns(address) {
        return buyer;
    }

    function terminate_contract() onlyBuyer payable {
        require(this.balance <= weiToBuy); 
	orders.removeBuyOrder(this);
        selfdestruct(buyer);
    }
}
