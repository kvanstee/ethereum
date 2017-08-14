# eth_market_dapp

http://128.199.144.211:8080 rinkeby testnet.

This is a currency exchange for ether. The other currency can be any national currency. There are 3 contracts: a base contract 'Orders' containing a record of buy and sell orders, a sell order contract 'Sell_eth', and a buy order contract 'Buy_eth'. Each new sell or buy order will generate a separate contract that grants 'ownership' to the contract initiator. He can 'selfdestruct' to himself and change price and volume.

To keep the parties focused each must put up a returnable deposit equal to the contract amount. Thus a sell action will require twice the transaction value and a buy action requires a deposit of the contract amount. A buyer will send local currency to the seller who will confirm receipt because her deposit will be returned or access to selfdestruct returned. This confirmation will also grant 2 times the transaction value to the buyer (sale + deposit). A contract cannot be terminated while its wei balance is greater than one or two times the volume variable (weiToBuy, weiForSale), nor can the same address have more than one pending transaction in a particular contract.

This app is live on the rinkeby testnet at http://128.199.144.211:8080. To add an order fill out the fields below the table and click 'add new buy/sell order'. To change price or volume click on the table row and if you are the 'owner' of the contract appropriate fields will be displayed. If you are not the 'owner' the fields displayed allow buying from or selling to the contract. The fields may take a few seconds to appear. If there are no pending transactions the contract can be terminated and ether returned.

I used metamask for interaction with web3. Generally the response is less than 2 seconds.
There is no provision for conversation between parties. Also sorting is not working.
