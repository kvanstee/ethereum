pragma solidity ^0.4.4;

import "./Orders.sol";

contract Sell_eth {
    Orders orders;
    uint weiForSale;
    uint price; //wei per smallest currency unit (eg. cent)
    address seller;
    struct Buyer {uint amount; bool confirmed;}
    mapping(address => Buyer) buyers;
    uint8 pending;
    modifier onlySeller() {require(msg.sender == seller);  _;}

    event LogNewWeiForSale(uint indexed wei_for_sale);
    event LogNewPrice(uint indexed nprice);
    event LogPurchasePending(address indexed _seller, address indexed _buyer, uint value, uint _price);
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
        buyers[msg.sender] = Buyer (msg.value, false);
        weiForSale -= msg.value/2;
        pending += 1;
        LogNewWeiForSale(weiForSale);
        LogPurchasePending(seller, msg.sender, msg.value, price);
    }

    function confirmReceived(address addr_buyer) onlySeller {
        Buyer storage buyer = buyers[addr_buyer];
        require(buyer.amount > 0 && pending > 0);
        buyer.confirmed = true;
    }
    function buyerWithdraw() payable {
        Buyer storage buyer = buyers[msg.sender];
        require(buyer.amount > 0 && buyer.confirmed == true);
        uint amt = buyer.amount;
        buyer.amount = 0;
        buyer.confirmed = false;
        if (!msg.sender.send(2*amt)) {
            buyer.amount = amt;
            buyer.confirmed = true;
        } else {
            pending -= 1;
            LogCashReceived(msg.sender);
        }
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
        require(this.balance <= 2*weiForSale);
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
        } else if (buyers[msg.sender].amount > 0) {
            return true;
        } else return false;
    }
}
