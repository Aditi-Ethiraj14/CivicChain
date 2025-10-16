// MetaMask Integration for CivicChain

// MetaMask configuration
const METAMASK_CONFIG = {
    POLYGON_MUMBAI: {
        chainId: '0x13881', // 80001 in hex
        chainName: 'Polygon Mumbai',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18,
        },
        rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
        blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
    }
};

// Demo contract ABI and address (for testnet)
const CIVIC_TOKEN_ABI = [
    {
        "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

const CIVIC_TOKEN_ADDRESS = '0x1234567890123456789012345678901234567890'; // Demo address

// Global Web3 and contract instances
let web3;
let civicTokenContract;
let currentAccount = null;

// Initialize MetaMask integration
document.addEventListener('DOMContentLoaded', function() {
    initializeMetaMask();
    setupMetaMaskEventListeners();
});

async function initializeMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
        web3 = new Web3(window.ethereum);
        
        // Initialize contract
        civicTokenContract = new web3.eth.Contract(CIVIC_TOKEN_ABI, CIVIC_TOKEN_ADDRESS);
        
        // Check if already connected
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
            await handleAccountsChanged(accounts);
        }
        
        // Update UI based on connection status
        updateWalletUI();
    } else {
        console.log('MetaMask is not installed');
        showMetaMaskInstallPrompt();
    }
}

function setupMetaMaskEventListeners() {
    const connectWalletBtn = document.getElementById('connectWallet');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWallet);
    }
    
    // Listen for account changes
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('disconnect', handleDisconnect);
    }
}

async function connectWallet() {
    if (!window.ethereum) {
        showMetaMaskInstallPrompt();
        return;
    }

    try {
        // Request account access
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        
        await handleAccountsChanged(accounts);
        
        // Switch to Polygon Mumbai if not already on it
        await switchToPolygonMumbai();
        
        // Show authentication modal if not logged in
        if (!AppState.currentUser) {
            showAuthModal();
        } else {
            // Link wallet to existing user
            await linkWalletToUser(accounts[0]);
        }
        
    } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        showNotification('Failed to connect wallet: ' + error.message, 'error');
    }
}

async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected wallet
        currentAccount = null;
        AppState.wallet.connected = false;
        AppState.wallet.address = null;
        AppState.wallet.balance = 0;
    } else if (accounts[0] !== currentAccount) {
        // User switched accounts
        currentAccount = accounts[0];
        AppState.wallet.connected = true;
        AppState.wallet.address = currentAccount;
        
        // Get balance
        await updateWalletBalance();
        
        // Update user wallet address if logged in
        if (AppState.currentUser) {
            await linkWalletToUser(currentAccount);
        }
    }
    
    updateWalletUI();
}

async function handleChainChanged(chainId) {
    console.log('Chain changed to:', chainId);
    // Reload the page to reset state
    window.location.reload();
}

function handleDisconnect() {
    console.log('MetaMask disconnected');
    currentAccount = null;
    AppState.wallet.connected = false;
    AppState.wallet.address = null;
    AppState.wallet.balance = 0;
    updateWalletUI();
}

async function switchToPolygonMumbai() {
    try {
        // Try to switch to Polygon Mumbai
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: METAMASK_CONFIG.POLYGON_MUMBAI.chainId }],
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [METAMASK_CONFIG.POLYGON_MUMBAI],
                });
            } catch (addError) {
                console.error('Error adding Polygon Mumbai network:', addError);
                showNotification('Failed to add Polygon Mumbai network', 'error');
            }
        } else {
            console.error('Error switching to Polygon Mumbai:', switchError);
        }
    }
}

async function updateWalletBalance() {
    if (!currentAccount) return;
    
    try {
        // Get MATIC balance
        const maticBalance = await web3.eth.getBalance(currentAccount);
        const maticBalanceEth = web3.utils.fromWei(maticBalance, 'ether');
        
        // Get CIVIC token balance (demo)
        let civicBalance = 0;
        try {
            const civicBalanceWei = await civicTokenContract.methods.balanceOf(currentAccount).call();
            civicBalance = web3.utils.fromWei(civicBalanceWei, 'ether');
        } catch (contractError) {
            console.log('Demo contract not available:', contractError.message);
            // Use user's token balance from database
            if (AppState.currentUser) {
                civicBalance = AppState.currentUser.tokenBalance || 0;
            }
        }
        
        AppState.wallet.balance = parseFloat(civicBalance);
        
        console.log(`MATIC Balance: ${maticBalanceEth}, CIVIC Balance: ${civicBalance}`);
        
    } catch (error) {
        console.error('Error updating wallet balance:', error);
    }
}

async function linkWalletToUser(walletAddress) {
    if (!AppState.currentUser || !AppState.authToken) return;
    
    try {
        const response = await fetch('/api/users/connect-wallet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AppState.authToken}`
            },
            body: JSON.stringify({ walletAddress: walletAddress })
        });
        
        if (response.ok) {
            AppState.currentUser.walletAddress = walletAddress;
            localStorage.setItem('civicchain_user', JSON.stringify(AppState.currentUser));
            showNotification('Wallet connected successfully!', 'success');
        } else {
            console.error('Failed to link wallet to user');
        }
    } catch (error) {
        console.error('Error linking wallet:', error);
    }
}

async function convertPointsToTokens(points) {
    if (!AppState.currentUser || !currentAccount) {
        showNotification('Please connect your wallet and login first', 'error');
        return;
    }
    
    if (AppState.currentUser.points < points) {
        showNotification('Insufficient points for conversion', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/users/convert-points', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AppState.authToken}`
            },
            body: JSON.stringify({ points: points })
        });
        
        if (response.ok) {
            const data = await response.json();
            const tokensEarned = data.tokensEarned;
            
            // Update user data
            AppState.currentUser.points -= points;
            AppState.currentUser.tokenBalance += tokensEarned;
            localStorage.setItem('civicchain_user', JSON.stringify(AppState.currentUser));
            
            // For demo purposes, simulate minting tokens
            await simulateMintTokens(tokensEarned);
            
            showNotification(`Converted ${points} points to ${tokensEarned.toFixed(2)} CIVIC tokens!`, 'success');
            updateUserInterface();
            await updateWalletBalance();
        } else {
            const errorData = await response.json();
            showNotification(errorData.message || 'Failed to convert points', 'error');
        }
    } catch (error) {
        console.error('Error converting points:', error);
        showNotification('Failed to convert points', 'error');
    }
}

async function simulateMintTokens(amount) {
    // This is a demo function - in production, this would interact with actual smart contract
    console.log(`Demo: Minting ${amount} CIVIC tokens to ${currentAccount}`);
    
    try {
        // Simulate a blockchain transaction
        const transactionHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        console.log('Demo transaction hash:', transactionHash);
        
        // Update local balance
        AppState.wallet.balance += amount;
        
        return transactionHash;
    } catch (error) {
        console.error('Demo minting error:', error);
        throw error;
    }
}

async function withdrawTokens(amount) {
    if (!AppState.currentUser || !currentAccount) {
        showNotification('Please connect your wallet and login first', 'error');
        return;
    }
    
    if (AppState.currentUser.tokenBalance < amount) {
        showNotification('Insufficient token balance', 'error');
        return;
    }
    
    try {
        // Simulate withdrawal to wallet
        const transactionHash = await simulateTokenWithdrawal(amount);
        
        // Record the withdrawal in backend
        const response = await fetch('/api/users/withdraw-tokens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AppState.authToken}`
            },
            body: JSON.stringify({ 
                amount: amount,
                transactionHash: transactionHash
            })
        });
        
        if (response.ok) {
            AppState.currentUser.tokenBalance -= amount;
            localStorage.setItem('civicchain_user', JSON.stringify(AppState.currentUser));
            
            showNotification(`Withdrew ${amount.toFixed(2)} CIVIC tokens to your wallet!`, 'success');
            updateUserInterface();
            await updateWalletBalance();
        } else {
            const errorData = await response.json();
            showNotification(errorData.message || 'Failed to withdraw tokens', 'error');
        }
    } catch (error) {
        console.error('Error withdrawing tokens:', error);
        showNotification('Failed to withdraw tokens', 'error');
    }
}

async function simulateTokenWithdrawal(amount) {
    // Demo function - in production, this would call smart contract
    console.log(`Demo: Withdrawing ${amount} CIVIC tokens to ${currentAccount}`);
    
    // Generate demo transaction hash
    const transactionHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return transactionHash;
}

function updateWalletUI() {
    const connectWalletBtn = document.getElementById('connectWallet');
    const walletStatus = document.getElementById('walletStatus');
    
    if (AppState.wallet.connected && currentAccount) {
        // Show connected status
        if (connectWalletBtn) {
            connectWalletBtn.className = 'btn btn-success wallet-connected';
            connectWalletBtn.innerHTML = `
                <i class="fas fa-wallet"></i> 
                ${formatAddress(currentAccount)}
                <br>
                <small class="wallet-address">${AppState.wallet.balance.toFixed(2)} CIVIC</small>
            `;
        }
    } else {
        // Show connect button
        if (connectWalletBtn) {
            connectWalletBtn.className = 'btn btn-outline-light';
            connectWalletBtn.innerHTML = '<i class="fas fa-wallet"></i> Connect MetaMask';
        }
    }
}

function formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function showMetaMaskInstallPrompt() {
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">MetaMask Required</h5>
                    <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                </div>
                <div class="modal-body text-center">
                    <div class="mb-4">
                        <i class="fab fa-ethereum" style="font-size: 4rem; color: #f6851b;"></i>
                    </div>
                    <h5>MetaMask wallet is required</h5>
                    <p class="mb-4">To earn and manage CIVIC tokens, you need to install MetaMask browser extension.</p>
                    <a href="https://metamask.io/download/" target="_blank" class="btn btn-primary">
                        <i class="fas fa-download"></i> Install MetaMask
                    </a>
                </div>
                <div class="modal-footer">
                    <small class="text-muted">After installation, refresh this page and connect your wallet.</small>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Export functions for use in other scripts
window.MetaMask = {
    connectWallet,
    convertPointsToTokens,
    withdrawTokens,
    updateWalletBalance,
    isConnected: () => AppState.wallet.connected,
    getAddress: () => currentAccount,
    getBalance: () => AppState.wallet.balance
};