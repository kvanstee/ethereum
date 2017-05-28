// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import selleth_artifacts from '../../build/contracts/Sell_eth.json';
import orders_artifacts from '../../build/contracts/Orders.json';

// Sell_eth is our usable abstraction, which we'll use through the code below.
var Sell_eth = contract(selleth_artifacts);
var Orders = contract(orders_artifacts);

window.App = {

  start: function() {
    var self = this;
    // Bootstrap the Sell_eth and Orders abstraction for use
    Sell_eth.setProvider(web3.currentProvider);
    Orders.setProvider(web3.currentProvider);

    Orders.deployed().then(function(instance) {
      instance.getSellOrders.call().then(function(result) {
        if (result.length != 0) {
          for (var i=0; i<result.length; i++) {
            var addr = result[i];
            Sell_eth.at(addr).then(function(instance) {
              instance.get_wei_for_sale.call().then(function(res) {
                var volume = res.toNumber();
                instance.get_price.call().then(function(res) {
                  var price = res.toNumber();
                  self.populate_row_cells(instance.address, price, volume);
                });
              });
            });
          };
        };
      });
    });
  },
    // Get the initial account balance so it can be displayed.
  /*getAccounts: function() {
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {alert("There was an error fetching your accounts."); return;}
      if (accs.length == 0) {alert("Couldn't get any accounts!"); return;}
      accounts = accs;
      account = accounts[0]; console.log(account);
    });
  },*/

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  //catch events and update contract row
  catchEvents: function(address) {
    self = this;
    Sell_eth.at(address).then(function(instance) {
      var contr = document.getElementById(address).getElementsByTagName("td");
      instance.allEvents(function(er, result) {
        switch (result.event) {
          case "newWeiForSale": 
            instance.get_price.call().then(function(price) {
              var volume = result.args.wei_for_sale;
              contr[1].innerHTML = (volume/10**18).toFixed(8);
              contr[2].innerHTML = ((volume/price.toNumber())/100).toFixed(2);
            });
          case "newPrice": 
            instance.get_wei_for_sale.call().then(function(volume) {
              var price = result.args.nprice;
              contr[0].innerHTML = (10**16/price).toFixed(2); 
              contr[2].innerHTML = ((volume.toNumber()/price)/100).toFixed(2);
            });
          case "purchaseConfirmed":
            self.setStatus("purchase by: " + result.args._buyer + ", a volume of: " + result.args.value + ", at price of: " + result.args.price);
          case "cashReceived": 
            self.setStatus("cash received from: " + result.args.rec_buyer + ", ether sent to buyer");
        };
      });
      /*instance.newWeiForSale(function(error, result) {
        volume = parseInt(result.args.wei_for_sale);
        contr[1].innerHTML = (volume/10**18).toFixed(8);
        contr[2].innerHTML = ((volume/price)/100).toFixed(2);
      });
      instance.newPrice(function(error, result) {
        price = parseInt(result.args.nprice);
        contr[0].innerHTML = (10**16/price).toFixed(2); 
        contr[2].innerHTML = ((volume/price)/100).toFixed(2);
      });
      instance.purchaseConfirmed(function(error, result) {
        self.setStatus("purchase by: " + result.args._buyer + ", a volume of: " + result.args.value + ", at price of: " + result.args.price)
      });
      instance.cashReceived(function(error, result) {
      self.setStatus("cash received from: " + result.args.rec_buyer + ", ether sent to buyer");
      });*/
    });
  },
  //create and populate row of contract info
  populate_row_cells: function(_addr, _price, _volume) {
    self = this;
    var contract = document.createElement("tr");
    contract.innerHTML = '<td align="right"></td><td align="right"></td><td align="right"></td>';
    contract.id = _addr;
    var contr = contract.getElementsByTagName("td");
    contr[0].innerHTML = (10**16/_price).toFixed(2);
    contr[1].innerHTML = (_volume/10**18).toFixed(8);
    contr[2].innerHTML = ((_volume/_price)/100).toFixed(2);
//    document.getElementById("sell_orders").append(contract);
    contract.addEventListener("click", function () {
      document.getElementById("rec_address").value = '';
      document.getElementById("nprice").value = '';
      document.getElementById("add_ether").value = '';
      document.getElementById("address").value = contract.id;
      var selected = document.getElementById("sell_orders").getElementsByClassName('selected');
      if (selected[0]) selected[0].className = '';
      contract.className = 'selected';
    });
    document.getElementById("sell_orders").append(contract);
    self.catchEvents(_addr);
  },

 setup_sell: function() {
   var self = this;
   var price = 1e16/document.getElementById("ask_price").value;
   var volume = document.getElementById("ask_value").value*100*price;
   Sell_eth.new(price, {from: web3.eth.accounts[0], value: 2*volume, gas: 900000}).then(function(instance) {
     var addr = instance.address;
     Orders.deployed().then(function(inst) {
       inst.addSellOrder(addr, {from: web3.eth.accounts[0]}).then(function() {
         self.setStatus("sell order contract deployed")
       });
     });
     self.populate_row_cells(addr, price, volume);

      /*var contracts = sellorders.getElementsByTagName("tr");
      var i = contracts.length - 1;
      var item = contracts[i];
      while (i > 0 && 1e16/price < parseFloat(contracts[i-1].getElementsByTagName("td")[0].innerHTML)) {
        contracts[i] = contracts[i-1];
        i -= 1;
      }
      contracts[i] = item;*/
   });
 },

  buy: function() {
    var self = this;
    var address = document.getElementById("address").value; 
    var contr = Sell_eth.at(address);
    var price = parseInt(1e16/document.getElementById(address).getElementsByTagName("td")[0].innerHTML);
    var volume = document.getElementById("val").value*100*price;
    contr.purchase({from: web3.eth.accounts[1], value: volume, gas: 900000}).then(function(er, result) {
      if (!er) self.setStatus("success! ");
    });
  },

  payment_received: function() {
    self = this;
    var rec_address = document.getElementById("rec_address").value;
    var address = document.getElementById("address").value;
    var contr = Sell_eth.at(address);
    contr.confirmReceived(rec_address, {from: web3.eth.accounts[0]}).then(function(result) {
      self.setStatus("purchase + deposit sent to " + rec_address);
    }); 
  },

  change_price: function() {
    var address = document.getElementById("address").value;
    var contr = Sell_eth.at(address);
    var nprice = parseInt(1e16/document.getElementById("nprice").value);
    contr.changePrice(nprice, {from: web3.eth.accounts[0]}).then(function() {
      self.setStatus("contract at address: " + address + " has changed price to: " + 1e16/nprice);
    });
  },  

  addether: function() {
    var self = this;
    var address = document.getElementById("address").value; 
    var contr = Sell_eth.at(address);
    var volume = document.getElementById("add_ether").value;
    contr.addEther({from: web3.eth.accounts[0], value: web3.toWei(volume, "ether")}).then(function() {
     self.setStatus(volume + " ether added to contract at " + address);
    });
  },

  term_contract: function() {
    var self = this;
    var address = document.getElementById("address").value;
    var contr = Sell_eth.at(address);
    contr.retr_funds({from: web3.eth.accounts[0]}).then(function(error, res) {
      if (!error) {
        Orders.deployed().removeSellOrder(address);
        self.setStatus("contract terminated, funds returned.");
        var contract = document.getElementById(address);
        contract.parentNode.removeChild(contract);
      }
    });
  },
},

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  web3.version.getNetwork((err, netId) => {
    switch (netId) {
      case "1":
        console.log('This is mainnet')
        break
      case "2":
        console.log('This is the deprecated Morden test network.')
        break
      case "3":
        console.log('This is the ropsten test network.')
        break
      default:
        console.log('This is an unknown network.')
    }
  })
  App.start();
});
