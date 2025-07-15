# TON Transfer Tool

A Node.js tool for transferring TON coins using private keys/mnemonic phrases. Built with the official TON SDK based on TON documentation.

## Features

-  Interactive mode with user prompts
-  Direct function calls for automation
-  Support for both Mainnet and Testnet
-  Private key/mnemonic validation
-  Address validation
-  Balance checking
-  Transaction confirmation
-  Comment support
-  Error handling

## Installation

1. **Clone or download the files:**
   ```bash
   # Download the files: ton-transfer.js, package.json, example-usage.js
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Usage

### Method 1: Interactive Mode

Run the script and follow the prompts:

```bash
node ton-transfer.js
```

The script will ask you for:
- Network (mainnet/testnet)
- Sender's 24-word mnemonic phrase
- Receiver's wallet address
- Transfer amount in TON
- Optional comment
- Transaction confirmation

### Method 2: Direct Function Call

```javascript
const { transferTonDirect } = require('./ton-transfer');

async function transfer() {
    const result = await transferTonDirect(
        'your 24 word mnemonic phrase here',  // Sender's mnemonic
        'EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',   // Receiver's address
        0.1,                                  // Amount in TON
        'Payment comment',                    // Optional comment
        'testnet'                            // Network: 'mainnet' or 'testnet'
    );
    
    if (result.success) {
        console.log('Transfer successful!');
        console.log('Transaction hash:', result.txHash);
    } else {
        console.error('Transfer failed:', result.error);
    }
}

transfer();
```

### Method 3: Environment Variables

Create a `.env` file:
```env
TON_MNEMONIC=your 24 word mnemonic phrase here
RECEIVER_ADDRESS=EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TRANSFER_AMOUNT=0.1
TON_NETWORK=testnet
```

Then use:
```javascript
const { transferTonDirect } = require('./ton-transfer');

async function transfer() {
    const result = await transferTonDirect(
        process.env.TON_MNEMONIC,
        process.env.RECEIVER_ADDRESS,
        parseFloat(process.env.TRANSFER_AMOUNT),
        'Automated payment',
        process.env.TON_NETWORK
    );
    
    console.log(result);
}
```

## Important Notes

### Security
- **Never share your mnemonic phrase or private keys**
- **Always test on testnet first**
- **Use environment variables for production**
- **Keep your mnemonic secure and backed up**

### Wallet Types
This tool uses TON Wallet v4R2, which is compatible with:
- Tonkeeper
- TON Wallet
- Most TON wallet applications

### Networks
- **Testnet**: For testing (free test TON from faucets)
- **Mainnet**: For real transactions (costs real TON)

### Fees
- Estimated fee: ~0.01 TON per transaction
- Actual fees may vary based on network congestion
- The tool automatically checks for sufficient balance

## Getting Test TON

For testnet testing, get free test TON from:
- [TON Testnet Faucet](https://t.me/testgiver_ton_bot)

## Example Addresses

### Testnet Example:
```
Sender: Create wallet in Tonkeeper (testnet mode)
Receiver: kQBKhPyO7gqnlUu74KH8v0F0rPnkMALKHPg26q2ZtR_xYh0_
Amount: 0.1 TON
```

## Error Handling

The tool handles common errors:
- Invalid mnemonic phrases
- Invalid wallet addresses
- Insufficient balance
- Network connectivity issues
- Transaction failures

## Example Output

```
=== TON Transfer Tool ===

Choose network (mainnet/testnet) [default: testnet]: testnet

--- Sender Wallet ---
Enter sender's 24-word mnemonic phrase: word1 word2 word3 ... word24
Sender address: kQA...
Current balance: 1.5 TON

--- Receiver Wallet ---
Enter receiver's wallet address: EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Receiver address: EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

--- Transfer Amount ---
Enter amount to transfer (in TON): 0.1
Enter comment (optional): Test payment

--- Transaction Summary ---
From: kQA...
To: EQA...
Amount: 0.1 TON
Comment: Test payment
Network: Testnet

Confirm transaction? (yes/no): yes

Sending transaction...
 Transaction sent successfully!
Transaction will be processed shortly...

Waiting for confirmation...
 Transaction confirmed!
New balance: 1.39 TON
```

## Dependencies

- `@ton/ton`: Official TON SDK
- `@ton/core`: TON core utilities
- `@ton/crypto`: Cryptographic functions
- `@orbs-network/ton-access`: Network access

## Files Structure

```
├── ton-transfer.js      # Main transfer script
├── package.json         # Dependencies
├── example-usage.js     # Usage examples
└── README.md           # This file
```

## Support

For issues or questions:
1. Check the [TON Documentation](https://docs.ton.org/)
2. Review error messages carefully
3. Ensure you're using the correct network
4. Verify wallet addresses and mnemonic phrases

## License

MIT License - See LICENSE file for details.