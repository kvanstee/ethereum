pragma solidity ^0.4.4;

import "./Orders.sol";

contract Sell_eth {
    Orders orders;
    uint weiForSale;
    uint price; //wei per smallest currency unit (eg. cent)
    address seller;
    mapping(address => uint) sales;
    uint8 pending;
    modifier onlySeller() {require(msg.sender == seller);  _;}

    event LogNewWeiForSale(uint wei_for_sale);
    event LogNewPrice(uint nprice);
    event LogSalePending(address indexed _seller, address indexed _buyer, uint value, uint _price);
    event LogCashReceived(address indexed _buyer);

    function Sell_eth(uint _price, address _seller, address _orders) payable {
        orders = Orders(_orders);
        seller = _seller;
        price = _price;
        pending = 0;
        weiForSale = msg.value / 2;
    }
    
    function purchase() payable {
        require(sales[msg.sender] == 0);
        require(msg.value > 0 && msg.value < weiForSale && (msg.value/price)%5000 == 0);
        sales[msg.sender] = msg.value;
        weiForSale -= msg.value/2;
        pending += 1;
        LogNewWeiForSale(weiForSale);
        LogSalePending(seller, msg.sender, msg.value, price);
    }

    function confirmReceived(address _buyer) onlySeller payable {
        require(sales[_buyer] > 0 && pending > 0);
        uint amt = sales[_buyer];
        sales[_buyer] = 0;
        if (!_buyer.send(2*amt)) {
            sales[_buyer] = amt;
            return;
        }
        pending -= 1;
        LogCashReceived(_buyer);
    }

    function addEther() onlySeller payable {
        weiForSale += msg.value/2;
        LogNewWeiForSale(weiForSale);
    }

    function changePrice(uint new_price) onlySeller {
        price = new_price;
        LogNewPrice(price);
    }
    
    function retr_funds() onlySeller payable {
        require(pending == 0);
        orders.removeSellOrder();
        selfdestruct(seller);
    }
    
    function get_vars() returns(uint, uint) {
        return (weiForSale, price);
    }

    function is_seller() returns(bool) {
        if (seller == msg.sender) return true;
        else return false;
    }

    function has_pending() returns(bool) {
        if (msg.sender == seller) {
            if (pending > 0) return true;
        } else if (sales[msg.sender] > 0) {
            return true;
        } else return false;
    }
}
