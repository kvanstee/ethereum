module.exports = {
  networks: {
    rinkeby: {
      host: "localhost",
      port: 8545,
      network_id: "4",
      gas: 4000000
    },
    live: {
      host: "localhost",
      port: 8545,
      network_id: "1",
      gas: 3000000
    },
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 3000000
    }
  }
};
