pragma solidity ^0.4.21;

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
    event LogCashReceived(address indexed _buyer, address indexed _seller);

    function Sell_eth(uint _price, address _seller, address _orders) public payable {
        orders = Orders(_orders);
        seller = _seller;
        price = _price;
        pending = 0;
        weiForSale = msg.value / 2;
    }
    
    function buy() payable public {
        require(sales[msg.sender] == 0);
        require(msg.value > 0 && msg.value <= weiForSale && (msg.value/price)%5000 == 0);
        sales[msg.sender] = msg.value;
        weiForSale -= msg.value;
        pending += 1;
        emit LogNewWeiForSale(weiForSale);
        emit LogSalePending(seller, msg.sender, msg.value, price);
    }

    function confirmReceived(address _buyer) public onlySeller payable {
        require(sales[_buyer] > 0 && pending > 0);
        uint amt = sales[_buyer];
        sales[_buyer] = 0;
        _buyer.transfer(2*amt);
        pending -= 1;
        emit LogCashReceived(_buyer, seller);
	weiForSale += amt/2;
	emit LogNewWeiForSale(weiForSale); 
    }

    function addEther() public onlySeller payable {
        weiForSale += msg.value/2;
        emit LogNewWeiForSale(weiForSale);
    }

    function changePrice(uint new_price) public onlySeller {
        price = new_price;
        emit LogNewPrice(price);
    }
    
    function retr_funds() public onlySeller payable {
        require(pending == 0);
        orders.removeSellOrder();
        selfdestruct(seller);
    }
    
    function get_vars() view public returns(uint, uint) {
        return (weiForSale, price);
    }

    function is_party() view public returns(string) {
        if (sales[msg.sender] > 0) return "buyer";
        else if (seller == msg.sender) return "seller";
    }

    function has_pending() view public returns(bool) {
	if (pending > 0) return true;
    }
}

