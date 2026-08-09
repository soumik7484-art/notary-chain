'use strict';

const { ethers } = require('ethers');
const logger = require('../utils/logger');

const DEFAULT_RPC = 'https://polygon-amoy-bor-rpc.publicnode.com';

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

const TOKENS = {
  USDC: '0x41E94Eb71898E8A0F7e40d0d5b9E3B16b4a30B0f',
};

class WalletService {
  constructor() {
    this._provider = null;
  }

  _getProvider() {
    if (!this._provider) {
      const rpcUrl = process.env.POLYGON_AMOY_RPC_URL || DEFAULT_RPC;
      this._provider = new ethers.JsonRpcProvider(rpcUrl);
    }
    return this._provider;
  }

  async getBalance(address) {
    if (!address || !ethers.isAddress(address)) {
      throw new Error('Invalid wallet address');
    }

    const provider = this._getProvider();
    
    // Native POL/MATIC balance
    const nativeBalance = await provider.getBalance(address);
    const maticFormatted = ethers.formatEther(nativeBalance);
    const maticUsd = (parseFloat(maticFormatted) * 0.42).toFixed(2);
    
    // ERC-20 USDC balance
    let usdcFormatted = '0.00';
    let usdcRaw = '0';
    try {
      const usdcContract = new ethers.Contract(TOKENS.USDC, ERC20_ABI, provider);
      const usdcBalance = await usdcContract.balanceOf(address);
      const decimals = await usdcContract.decimals().catch(() => 6);
      usdcFormatted = ethers.formatUnits(usdcBalance, decimals);
      usdcRaw = usdcBalance.toString();
    } catch (err) {
      logger.warn('[WalletService] USDC balance fetch fallback:', err.message);
    }

    return {
      address,
      native: {
        symbol: 'POL',
        balance: nativeBalance.toString(),
        formatted: parseFloat(maticFormatted).toFixed(6),
        usdValue: maticUsd
      },
      usdc: {
        symbol: 'USDC',
        balance: usdcRaw,
        formatted: parseFloat(usdcFormatted).toFixed(2),
        contractAddress: TOKENS.USDC
      },
      network: 'Polygon Amoy Testnet (Chain 80002)',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new WalletService();
