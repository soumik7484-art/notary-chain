'use strict';

const logger = require('../../utils/logger');

/**
 * ocrService.js
 * 
 * Production OCR Fallback Engine using Tesseract.js.
 * Invoked whenever extracted PDF text is below the minimum threshold,
 * or when processing image-only / scanned PDF pages.
 */

class OCRService {
  /**
   * Runs OCR on an image buffer or renders page buffer.
   * @param {Buffer} imageBuffer - Image or page binary buffer
   * @param {string} mimeType - e.g. 'image/png', 'image/jpeg'
   * @param {object} options - Optional parameters (e.g. pageNumber)
   * @returns {Promise<{ text: string, confidence: number, pages: Array }>}
   */
  async processBuffer(imageBuffer, mimeType = 'image/png', options = {}) {
    try {
      if (!imageBuffer || imageBuffer.length === 0) {
        return { text: '', confidence: 0, pages: [] };
      }

      logger.info(`[OCR] Running OCR on buffer (${imageBuffer.length} bytes, ${mimeType})...`);

      const Tesseract = require('tesseract.js');
      const { data } = await Tesseract.recognize(imageBuffer, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text' && m.progress === 1) {
            logger.debug(`[OCR] Tesseract progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      const text = (data?.text || '').trim();
      const confidence = Math.round(data?.confidence || 0);

      logger.info(`[OCR] OCR completed: ${text.length} characters extracted with ${confidence}% confidence.`);

      return {
        text,
        confidence,
        pages: [
          {
            page_number: options.pageNumber || 1,
            text,
            confidence
          }
        ],
        ocr_used: true
      };
    } catch (err) {
      logger.warn('[OCR] Tesseract OCR error:', err.message);
      return {
        text: '',
        confidence: 0,
        pages: [],
        ocr_used: true,
        error: err.message
      };
    }
  }

  async processDocument(documentId, fileBuffer, options = {}) {
    return this.processBuffer(fileBuffer, 'application/pdf', options);
  }
}

module.exports = OCRService;
module.exports.OCRService = OCRService;
module.exports.ocrService = new OCRService();
