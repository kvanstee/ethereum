pragma solidity ^0.4.4;

import "./Orders.sol";

contract Sell_eth {
    Orders orders;
    uint weiForSale;
    uint price; //wei per smallest currency unit (eg. cent)
    address seller;
    struct Buyer {uint amount; uint price;}
    mapping(address => Buyer) buyers;
    uint8 pending;
    modifier onlySeller() {require(msg.sender == seller);  _;}

    event LogNewWeiForSale(uint indexed wei_for_sale);
    event LogNewPrice(uint indexed nprice);
    event LogPurchasePending(address _seller, address  _buyer, uint value, uint _price);
    event LogCashReceived(address rec_buyer);

    function Sell_eth(uint _price, address _seller, address _orders) payable {
        orders = Orders(_orders);
        seller = _seller;
        price = _price;
        pending = 0;
        weiForSale = msg.value / 2;
    }
    
    function purchase() payable {
        require(buyers[msg.sender].amount == 0);
        require(msg.value > 0 && msg.value < weiForSale && (msg.value/price)%5000 == 0);
        buyers[msg.sender] = Buyer (msg.value, price);
        weiForSale -= msg.value/2;
        pending += 1;
        LogNewWeiForSale(weiForSale);
        LogPurchasePending(seller, msg.sender, msg.value, price);
    }

    function confirmReceived(address addr_buyer) onlySeller payable {
        Buyer storage buyer = buyers[addr_buyer];
        require(buyer.amount > 0 && pending > 0);
        uint amt = buyer.amount;
        buyer.amount = 0;
        if (!addr_buyer.send(2*amt)) {
          buyer.amount = amt;
          return;
        }
        pending -= 1;
        LogCashReceived(addr_buyer);
    }

    function addEther() onlySeller payable {
        weiForSale += msg.value/2;
        LogNewWeiForSale(weiForSale);
    }

    function changePrice(uint new_price) onlySeller {
        price = new_price;
        LogNewPrice(price);
    }

    function get_price() returns(uint) {
      return price;
    }

    function get_wei_for_sale() returns(uint) {
        return weiForSale;
    }

    function get_vars() returns(uint, uint) {
        return (weiForSale, price);
    }

    function get_seller() constant returns(address) {
        return seller;
    }    

    function retr_funds() onlySeller payable {
        require(this.balance <= 2*weiForSale);
        orders.removeSellOrder();
        selfdestruct(seller);
    }

    function() {throw;}
}        
    
        
