'use strict';

const router        = require('express').Router();
const { protect }   = require('../middleware/auth');
const blockchain    = require('../services/blockchainService');
const { hashSHA256 } = require('../utils/helpers');
const resU          = require('../utils/apiResponse');
const ApiError      = require('../utils/apiError');

/**
 * GET /api/blockchain/health
 * Run the 19-point blockchain health check. No auth required so the
 * dashboard can poll without a session.
 */
router.get('/health', async (req, res, next) => {
  try {
    const report = await blockchain.runHealthCheck();
    resU.success(res, report, 'Health check complete');
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/blockchain/store-hash
 * Body: { content?: string, hash?: string, docId: string }
 *
 * Either pass a pre-computed `hash` (64-char hex) or a raw `content`
 * string from which the service will derive the SHA-256 hash.
 */
router.post('/store-hash', protect, async (req, res, next) => {
  try {
    const { content, hash, docId } = req.body;
    if (!docId) throw new ApiError.BadRequestError('docId is required');

    const finalHash = hash || hashSHA256(content || '');
    if (!finalHash || finalHash.length !== 64)
      throw new ApiError.BadRequestError('Provide a valid 64-char hex SHA-256 hash or raw content');

    const result = await blockchain.storeDocumentHash(finalHash, docId);
    resU.success(res, { hash: finalHash, ...result }, 'Hash stored on blockchain');
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/blockchain/verify/:hash
 * Verify whether a document hash exists on-chain.
 */
router.get('/verify/:hash', protect, async (req, res, next) => {
  try {
    const { hash } = req.params;
    if (!hash || hash.length !== 64)
      throw new ApiError.BadRequestError('Provide a valid 64-char hex SHA-256 hash');

    const record = await blockchain.verifyDocumentHash(hash);
    resU.success(res, record, record.exists ? 'Hash verified on blockchain' : 'Hash not found on blockchain');
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/blockchain/transaction/:txHash
 * Retrieve transaction receipt from the chain.
 */
router.get('/transaction/:txHash', protect, async (req, res, next) => {
  try {
    const receipt = await blockchain.getTransactionReceipt(req.params.txHash);
    if (!receipt) throw new ApiError.NotFoundError('Transaction not found or not yet mined');
    resU.success(res, receipt);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/blockchain/balance/:address
 * Retrieve real on-chain MATIC and USDC balance.
 */
router.get('/balance/:address', protect, async (req, res, next) => {
  try {
    const walletService = require('../services/walletService');
    const balance = await walletService.getBalance(req.params.address);
    resU.success(res, balance, 'Wallet balance fetched successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;

