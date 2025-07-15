const { TonClient, WalletContractV4, internal, toNano, fromNano } = require('@ton/ton');
const { mnemonicToPrivateKey, mnemonicValidate } = require('@ton/crypto');
const { getHttpEndpoint } = require('@orbs-network/ton-access');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to prompt user input
function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

// Function to validate TON address
function isValidTonAddress(address) {
    try {
        const { Address } = require('@ton/core');
        Address.parse(address);
        return true;
    } catch (error) {
        return false;
    }
}

// Main transfer function
async function transferTon() {
    try {
        console.log(' TON Transfer Tool \n');

        // Get network choice
        const network = await question('Choose network (mainnet/testnet) [default: testnet]: ');
        const isMainnet = network.toLowerCase()  'mainnet';
        
        // Get TON client endpoint
        const endpoint = await getHttpEndpoint({ 
            network: isMainnet ? 'mainnet' : 'testnet' 
        });
        const client = new TonClient({ endpoint });

        // Get sender's mnemonic/private key
        console.log('\n Sender Wallet ');
        const mnemonicInput = await question('Enter sender\'s 24-word mnemonic phrase (space-separated): ');
        const mnemonicWords = mnemonicInput.trim().split(' ');

        // Validate mnemonic
        if (mnemonicWords.length !== 24) {
            throw new Error('Mnemonic must contain exactly 24 words');
        }

        const isValidMnemonic = await mnemonicValidate(mnemonicWords);
        if (!isValidMnemonic) {
            throw new Error('Invalid mnemonic phrase');
        }

        // Create wallet from mnemonic
        const keyPair = await mnemonicToPrivateKey(mnemonicWords);
        const wallet = WalletContractV4.create({
            workchain: 0,
            publicKey: keyPair.publicKey
        });

        const walletContract = client.open(wallet);
        const senderAddress = wallet.address;

        console.log(`Sender address: ${senderAddress.toString()}`);

        // Check sender balance
        const balance = await walletContract.getBalance();
        console.log(`Current balance: ${fromNano(balance)} TON`);

        if (balance  0n) {
            throw new Error('Sender wallet has no TON to transfer');
        }

        // Get receiver address
        console.log('\n Receiver Wallet ');
        let receiverAddress;
        while (true) {
            const receiverInput = await question('Enter receiver\'s wallet address: ');
            if (isValidTonAddress(receiverInput)) {
                const { Address } = require('@ton/core');
                receiverAddress = Address.parse(receiverInput);
                break;
            } else {
                console.log('Invalid address format. Please try again.');
            }
        }

        console.log(`Receiver address: ${receiverAddress.toString()}`);

        // Get transfer amount
        console.log('\n Transfer Amount ');
        let transferAmount;
        while (true) {
            const amountInput = await question('Enter amount to transfer (in TON): ');
            const amount = parseFloat(amountInput);
            
            if (isNaN(amount) || amount <= 0) {
                console.log('Invalid amount. Please enter a positive number.');
                continue;
            }

            transferAmount = toNano(amount.toString());
            
            // Check if sender has enough balance (including fees)
            const estimatedFee = toNano('0.01'); // Estimated fee
            if (balance < transferAmount + estimatedFee) {
                console.log(`Insufficient balance. You have ${fromNano(balance)} TON, but need ${fromNano(transferAmount + estimatedFee)} TON (including fees)`);
                continue;
            }
            
            break;
        }

        // Get optional comment
        const comment = await question('Enter comment (optional, press Enter to skip): ');

        // Confirm transaction
        console.log('\nTransaction Summary');
        console.log(`From: ${senderAddress.toString()}`);
        console.log(`To: ${receiverAddress.toString()}`);
        console.log(`Amount: ${fromNano(transferAmount)} TON`);
        console.log(`Comment: ${comment || 'None'}`);
        console.log(`Network: ${isMainnet ? 'Mainnet' : 'Testnet'}`);

        const confirm = await question('\nConfirm transaction? (yes/no): ');
        if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
            console.log('Transaction cancelled.');
            rl.close();
            return;
        }

        // Create transfer message
        console.log('\nSending transaction...');

        const seqno = await walletContract.getSeqno();
        
        // Create transfer body with optional comment
        let body = null;
        if (comment) {
            const { beginCell } = require('@ton/core');
            body = beginCell()
                .storeUint(0, 32) // Text comment opcode
                .storeStringTail(comment)
                .endCell();
        }

        // Send transaction
        const transfer = walletContract.createTransfer({
            seqno: seqno,
            secretKey: keyPair.secretKey,
            messages: [internal({
                to: receiverAddress,
                value: transferAmount,
                body: body,
                bounce: false // Use non-bounceable for regular transfers
            })]
        });

        await walletContract.send(transfer);

        console.log('Transaction sent successfully!');
        console.log(`Transaction will be processed shortly...`);
        
        // Wait for transaction confirmation
        console.log('\nWaiting for confirmation...');
        
        let currentSeqno = seqno;
        while (currentSeqno  seqno) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            try {
                currentSeqno = await walletContract.getSeqno();
            } catch (error) {
                // Continue waiting if there's an error
            }
        }

        console.log('Transaction confirmed!');
        
        // Show final balance
        const newBalance = await walletContract.getBalance();
        console.log(`New balance: ${fromNano(newBalance)} TON`);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        rl.close();
    }
}

// Alternative function for direct parameter input (without prompts)
async function transferTonDirect(mnemonic, receiverAddress, amount, comment = '', network = 'testnet') {
    try {
        const isMainnet = network.toLowerCase()  'mainnet';
        
        // Get TON client endpoint
        const endpoint = await getHttpEndpoint({ 
            network: isMainnet ? 'mainnet' : 'testnet' 
        });
        const client = new TonClient({ endpoint });

        // Validate and create wallet
        const mnemonicWords = mnemonic.split(' ');
        const isValidMnemonic = await mnemonicValidate(mnemonicWords);
        if (!isValidMnemonic) {
            throw new Error('Invalid mnemonic phrase');
        }

        const keyPair = await mnemonicToPrivateKey(mnemonicWords);
        const wallet = WalletContractV4.create({
            workchain: 0,
            publicKey: keyPair.publicKey
        });

        const walletContract = client.open(wallet);
        
        // Validate receiver address
        const { Address } = require('@ton/core');
        const toAddress = Address.parse(receiverAddress);
        
        // Convert amount
        const transferAmount = toNano(amount.toString());
        
        // Check balance
        const balance = await walletContract.getBalance();
        const estimatedFee = toNano('0.01');
        
        if (balance < transferAmount + estimatedFee) {
            throw new Error(`Insufficient balance. Available: ${fromNano(balance)} TON`);
        }

        // Create and send transfer
        const seqno = await walletContract.getSeqno();
        
        let body = null;
        if (comment) {
            const { beginCell } = require('@ton/core');
            body = beginCell()
                .storeUint(0, 32)
                .storeStringTail(comment)
                .endCell();
        }

        const transfer = walletContract.createTransfer({
            seqno: seqno,
            secretKey: keyPair.secretKey,
            messages: [internal({
                to: toAddress,
                value: transferAmount,
                body: body,
                bounce: false
            })]
        });

        await walletContract.send(transfer);
        
        return {
            success: true,
            message: 'Transaction sent successfully',
            txHash: transfer.hash().toString('hex')
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Export functions for use in other modules
module.exports = {
    transferTon,
    transferTonDirect
};

// Run interactive transfer if this file is executed directly
if (require.main  module) {
    transferTon().catch(console.error);
} 