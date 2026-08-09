const mongoose = require('mongoose');
const polygonOms = require('../services/polygonOmsService');
const { apiResponse } = require('../utils/apiResponse');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

// In-memory persistent store for user OMS mappings in dev mode
const userOmsStore = new Map();

/**
 * Internal helper to get or create OMS account without sending HTTP response
 */
async function getOrCreateAccountInternal(req) {
  const userId = req.user.id;
  let account = userOmsStore.get(userId);

  if (!account) {
    const customer = await polygonOms.createCustomer({
      firstName: req.user.firstName || 'Ada',
      lastName: req.user.lastName || 'Lovelace',
      email: req.user.email || 'ada@example.com'
    });
    const wallet = await polygonOms.createWallet(customer.id);

    account = {
      customerId: customer.id,
      walletId: wallet.id,
      walletAddress: wallet.address,
      kycStatus: 'ACTIVE',
      asset: 'USDC',
      chain: 'polygon',
      rawBalance: 0.00,
      transactions: [],
      createdAt: new Date()
    };
    userOmsStore.set(userId, account);
  }

  return account;
}

/**
 * Perform Identity KYC & Provision Custodial Polygon USDC Wallet
 */
exports.onboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone, birthDate, address, ssn } = req.body;

    logger.info(`Onboarding Neobank user ${userId} on Polygon OMS...`);

    const customer = await polygonOms.createCustomer({
      firstName: firstName || req.user.firstName,
      lastName: lastName || req.user.lastName,
      email: req.user.email,
      phone,
      birthDate,
      residentialAddress: address,
      identifyingInformation: [{ type: 'ssn', issuingCountry: 'US', number: ssn || '123456789' }]
    });

    const wallet = await polygonOms.createWallet(customer.id, 'usdc', 'polygon');

    const omsAccount = {
      customerId: customer.id,
      walletId: wallet.id,
      walletAddress: wallet.address,
      kycStatus: 'ACTIVE',
      asset: 'USDC',
      chain: 'polygon',
      rawBalance: 0.00,
      transactions: [],
      createdAt: new Date()
    };

    userOmsStore.set(userId, omsAccount);

    if (mongoose.connection.readyState === 1) {
      try {
        await AuditLog.create({
          userId,
          userRole: req.user.role || 'company',
          action: 'NEOBANK_ONBOARDED',
          category: 'user',
          ipAddress: req.ip,
          metadata: { customerId: customer.id, walletId: wallet.id, walletAddress: wallet.address }
        });
      } catch (e) {}
    }

    return res.json({
      success: true,
      message: 'Successfully onboarded on Polygon Open Money Stack! Custodial USDC wallet provisioned.',
      data: {
        ...omsAccount,
        balance: '0.00'
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Neobank Account & Custodial Wallet Details
 */
exports.getAccount = async (req, res, next) => {
  try {
    const account = await getOrCreateAccountInternal(req);

    const formattedBalance = account.rawBalance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return res.json({
      success: true,
      data: {
        ...account,
        balance: formattedBalance,
        rawBalance: account.rawBalance,
        currency: 'USD',
        underlyingRail: 'USDC on Polygon'
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Search Cash Deposit Retail Locations
 */
exports.getCashLocations = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    const locations = await polygonOms.getCashLocations(lat || 40.7128, lng || -74.0060);
    return res.json({
      success: true,
      data: locations.data || []
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Generate Cash-In Barcode Deposit Code & Top-Up Balance
 */
exports.createCashIn = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const account = await getOrCreateAccountInternal(req);
    const cashIn = await polygonOms.createCashIn(account.customerId, amount || 100, account.walletId);

    const numAmount = parseFloat(amount) || 100;
    if (numAmount > 0) {
      account.rawBalance += numAmount;
      account.transactions.unshift({
        id: `txn_${Date.now()}`,
        type: 'CASH_IN',
        title: `Cash Top-Up ($${numAmount.toFixed(2)})`,
        amount: `+$${numAmount.toFixed(2)}`,
        status: 'Completed',
        date: 'Just now',
        icon: 'cash',
        txHash: `0x${Math.random().toString(16).substring(2, 10)}...`
      });
    }

    if (mongoose.connection.readyState === 1) {
      try {
        await AuditLog.create({
          userId: req.user.id,
          userRole: req.user.role || 'company',
          action: 'NEOBANK_CASH_IN_REQUESTED',
          category: 'document',
          ipAddress: req.ip,
          metadata: { amount, cashInId: cashIn.id, depositCode: cashIn.depositCode }
        });
      } catch (e) {}
    }

    return res.json({
      success: true,
      message: 'Deposit code generated successfully! Show barcode at retail partner.',
      data: cashIn
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Generate US Virtual Bank Account (ACH/Wire)
 */
exports.createVirtualAccount = async (req, res, next) => {
  try {
    const account = await getOrCreateAccountInternal(req);
    const va = await polygonOms.createVirtualAccount(account.customerId, account.walletId);

    return res.json({
      success: true,
      message: 'Dedicated US Bank Virtual Account created! Incoming transfers auto-convert to USDC.',
      data: va
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Send Money P2P (Deduct Balance & Record Transaction)
 */
exports.sendMoney = async (req, res, next) => {
  try {
    const { recipient, amount, note } = req.body;
    const account = await getOrCreateAccountInternal(req);

    const numAmount = parseFloat(amount) || 0;
    if (numAmount > account.rawBalance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Your balance is $${account.rawBalance.toFixed(2)} USD.`
      });
    }

    // Determine recipient destination address
    let targetAddress = recipient;
    if (!recipient || !recipient.startsWith('0x')) {
      if (mongoose.connection.readyState === 1) {
        try {
          const recipientUser = await User.findOne({ email: recipient ? recipient.toLowerCase() : '' });
          if (recipientUser && userOmsStore.has(recipientUser.id)) {
            targetAddress = userOmsStore.get(recipientUser.id).walletAddress;
          } else {
            targetAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
          }
        } catch (e) {
          targetAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
        }
      } else {
        targetAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
      }
    }

    // 1. Create Quote
    const quote = await polygonOms.createQuote(account.customerId, account.walletId, {
      blockchainAddress: targetAddress
    }, true);

    // 2. Execute Transaction against Quote
    const txn = await polygonOms.executeTransaction(quote.id);

    // 3. Dynamic Balance Reduction & Ledger Entry
    if (numAmount > 0) {
      account.rawBalance = Math.max(0, account.rawBalance - numAmount);
      account.transactions.unshift({
        id: `txn_${Date.now()}`,
        type: 'P2P_SEND',
        title: `Sent to ${recipient}`,
        amount: `-$${numAmount.toFixed(2)}`,
        status: 'Completed',
        date: 'Just now',
        icon: 'send',
        txHash: txn.txHash || `0x${Math.random().toString(16).substring(2, 10)}...`
      });
    }

    if (mongoose.connection.readyState === 1) {
      try {
        await AuditLog.create({
          userId: req.user.id,
          userRole: req.user.role || 'company',
          action: 'NEOBANK_P2P_SEND',
          category: 'user',
          ipAddress: req.ip,
          metadata: { recipient, amount, txHash: txn.txHash, quoteId: quote.id }
        });
      } catch (e) {}
    }

    return res.json({
      success: true,
      message: `Successfully transferred $${numAmount.toFixed(2)} USD to ${recipient}! Gas sponsored by Polygon.`,
      data: {
        transactionId: txn.id,
        status: txn.status || 'completed',
        txHash: txn.txHash,
        amount: numAmount.toFixed(2),
        recipient,
        note,
        newBalance: account.rawBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        timestamp: new Date()
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Withdraw Money to External Bank Account (Deduct Balance)
 */
exports.withdrawMoney = async (req, res, next) => {
  try {
    const { amount, accountNumber, routingNumber } = req.body;
    const account = await getOrCreateAccountInternal(req);

    const numAmount = parseFloat(amount) || 0;
    if (numAmount > account.rawBalance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Your balance is $${account.rawBalance.toFixed(2)} USD.`
      });
    }

    const extBank = await polygonOms.createExternalAccount(account.customerId, {
      accountNumber,
      routingNumber
    });

    const quote = await polygonOms.createQuote(account.customerId, account.walletId, {
      externalAccountId: extBank.id
    });

    const txn = await polygonOms.executeTransaction(quote.id);

    // Deduct Balance & Record Transaction
    if (numAmount > 0) {
      account.rawBalance = Math.max(0, account.rawBalance - numAmount);
      account.transactions.unshift({
        id: `txn_${Date.now()}`,
        type: 'BANK_WITHDRAW',
        title: `Payout to Bank (${accountNumber ? accountNumber.slice(-4) : '4321'})`,
        amount: `-$${numAmount.toFixed(2)}`,
        status: 'Processing',
        date: 'Just now',
        icon: 'withdraw',
        txHash: `0x${Math.random().toString(16).substring(2, 10)}...`
      });
    }

    return res.json({
      success: true,
      message: `Successfully initiated bank payout of $${numAmount.toFixed(2)} USD to bank ending in ${accountNumber ? accountNumber.slice(-4) : '4321'}.`,
      data: {
        payoutId: txn.id,
        amount: numAmount.toFixed(2),
        bankAccountId: extBank.id,
        status: 'processing',
        estimatedArrival: '1-2 Business Days'
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Neobank Transaction History
 */
exports.getTransactions = async (req, res, next) => {
  try {
    const account = await getOrCreateAccountInternal(req);
    return res.json({
      success: true,
      data: account.transactions || []
    });
  } catch (err) {
    next(err);
  }
};
