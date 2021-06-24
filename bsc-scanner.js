const infuraProjectID = "8c177d7aa2f545439cd02577b325c3e7" // https://infura.io/signup
const tokenContractAddress = "0x4b71bd5e1db6cce4179e175a3a2033e4f17b7432"
const accountAddress = "0xc353910591ac9aEB8A527a587cbdeD4A9A902240"

// Dependencies
const Web3 = require('web3');
const web3 = new Web3()
const keccak_256 = require('js-sha3').keccak256
const rp = require('request-promise')
const retry = require('async-retry')
const retryOptions = {
  retries: 10,
  factor: 1.0,
  minTimeout: 750,
  onRetry: (error) => { console.error(`retrying : ${error.message}`) }
}

// Hex encoding needs to start with 0x.
// First comes the function selector, which is the first 4 bytes of the
//   keccak256 hash of the function signature.
// ABI-encoded arguments follow. The address must be left-padded to 32 bytes.
const data = '0x' +
  keccak_256.hex('balanceOf(address)').substr(0, 8) +
  '000000000000000000000000' +
  accountAddress.substr(2) // chop off the 0x

//const postURI = 'https://mainnet.infura.io/v3/' + infuraProjectID
const postURI = 'https://bsc-dataseed1.binance.org:443'

const postResp = retry(async () => {
    return await rp({
        method: 'POST',
        uri: postURI,
        body: {
            jsonrpc: "2.0",
            id: 1,
            method: "eth_call",
            params: [{
                to: tokenContractAddress,
                data: data,
            }, 'latest'],
        },
        headers: {
            'content-type': 'application/json'
        },
        json: true
    })
}, retryOptions);

// Log the full result object below
async function showBalance() {
    let res = await postResp
    let balance = web3.utils.toDecimal(res.result)
    console.log(`Balance : ${balance}`)
}

showBalance()
