// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import selleth_artifacts from '../../build/contracts/Sell_eth.json'

// Sell_eth is our usable abstraction, which we'll use through the code below.
var Sell_eth = contract(selleth_artifacts);

var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

// Bootstrap the Sell_eth abstraction for Use.
    Sell_eth.setProvider(web3.currentProvider);

// Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {alert("There was an error fetching your accounts."); return;}
      if (accs.length == 0) {alert("Couldn't get any accounts!"); return;}
      accounts = accs;
      account = accounts[0];
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  /*filterLogs: function(_address) {
    var filter = web3.eth.filter({address: _address});
    filter.watch(function (error, log) {
      if (error) {alert(error)};
      alert(log.topics);
    });
  },*/

//catch events and send args to table of contracts
  catchEvents: function(_address) {
    self = this;
    Sell_eth.at(_address).then(function(instance) {
      var price; var volume;
      var contr = document.getElementById(_address).getElementsByTagName("td");
      instance.newWeiForSale(function(error, result) {
        volume = parseInt(result.args.wei_for_sale);
        contr[1].innerHTML = (volume/10**18).toFixed(8);
        redo_value();
      });
      instance.newPrice(function(error, result) {
        price = parseInt(result.args.nprice);
        contr[0].innerHTML = (10**16/price).toFixed(2);
        redo_value();
      });
      function redo_value() {
        var value = (volume/price)/100;
        contr[2].innerHTML = value.toFixed(2);
      };
      instance.purchaseConfirmed(function(error, result) {
        self.setStatus("purchase by: " + result.args._buyer + ", a volume of: " + result.args.value + ", at price of: " + result.args.price)
      });
      instance.cashReceived(function(error, result) {
        self.setStatus("cash received from: " + rec_buyer + ", ether sent to buyer");
      });
    });
  },
// get all past logs again.
//  var myResults = filter.get(function(error, logs){console.log(log)});
//  filter.stopWatching();

  setup_sell: function() {
    var self = this;
    var price = 1e16/(document.getElementById("ask_price").value);
    var volume = document.getElementById("ask_value").value*100*price;
    Sell_eth.new(price, {from: account , value: 2*volume, gas: 1900000}).then(function(instance) {
      var address = instance.address;
      var contract = document.createElement("tr");

      contract.innerHTML = '<td align="right"></td><td align="right"></td><td align="right"></td>';
      contract.id = address; 
      contract.addEventListener("click", function () {
        document.getElementById("address").value = address;
        var selected = document.getElementById("sell_orders").getElementsByClassName('selected');
        if (selected[0]) selected[0].className = '';
        contract.className = 'selected';
      }); 

// Insert contract(row) into Sell_orders.. sorting not working
      var sellorders = document.getElementById("sell_orders");
      sellorders.prepend(contract);
      self.catchEvents(address);
      /*var contracts = sellorders.getElementsByTagName("tr");
      var i = contracts.length - 1;
      var item = contracts[i];
      while (i > 0 && price < contracts[i-1].getElementsByTagName("td")[0].value) {
        contracts[i] = contracts[i-1];
        i -= 1;
      }
      contracts[i] = item;*/
    }); 
  },

/*  update_table_cells: function(_address) {
    selleth = Sell_eth.at(_address);
    selleth.newPrice(function(error, result) {
      var price = result.args.nprice.toNumber();
      contract.getElementsByTagName("td")[0].innerHTML = (10**16/price).toFixed(2);
    });
    selleth.newWeiForSale(function(error, result) {
      var volume = result.args.wei_for_sale.toNumber(); 
      contract.getElementsByTagName("td")[1].innerHTML = (volume/10**18).toFixed(8);
    });
    var value = (volume/price)/100;
    contract.getElementsByTagName("td")[2].innerHTML = value.toFixed(2)
  },
*/
  buy: function() {

    var self = this;
    var address = document.getElementById("address").value; 
    var contr = Sell_eth.at(address);
    var price = parseInt(1e16/document.getElementById(address).getElementsByTagName("td")[0].innerHTML); console.log(price);
    var volume = document.getElementById("val").value*100*price; console.log(volume);
    contr.purchase({from: accounts[2], value: volume, gas: 900000}).then(function(result) {
      self.setStatus(result);
    });
  },

  change_price: function() {
    var address = document.getElementById("address").value;
    var contr = Sell_eth.at(address);
    var nprice = parseInt(1e16/document.getElementById("nprice").value);
    contr.changePrice(nprice, {from: account}).then(function() {
      self.setStatus("contract at address: " + address + " has changed price to: " + 1e16/nprice);
    });
  },  

  add_ether: function() {
    var self = this;
    var address = document.getElementById("address").value; 
    var contr = Sell_eth.at(address);
//    contr.addEther({from: account, value: document.getElementById(addEther).value
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

  App.start();
});
