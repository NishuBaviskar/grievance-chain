module.exports = {
    networks: {
        development: {
            host: "127.0.0.1", // Localhost (default: none)
            port: 7545, // Standard Ganache UI port
            network_id: "*", // Any network (default: none)
        },
    },

    // Set default mocha options here, use special reporters, etc.
    mocha: {
        // timeout: 100000
    },

    // Configure your compilers
    compilers: {
        solc: {
            version: "0.8.20", // Fetch exact version from solc-bin
        }
    },

    // Points to the directory where Truffle will save the compiled smart contract artifacts.
    contracts_build_directory: "./build/contracts",
};