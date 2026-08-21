const AIReport = require('../../models/AIReport');

class OCRService {
  async processDocument(id, b, o) {
    const r = await AIReport.create({ documentId: id, reportType: 'ocr', status: 'pending' });
    setTimeout(async () => {
      r.status = 'completed';
      r.results = { text: 'Extracted mock text', pages: [{ pageNumber: 1, text: 'Mock', confidence: 99 }], wordCount: 3, language: 'en', confidence: 99 };
      await r.save();
    }, 1000);
    return r._id;
  }
  async getResults(id) {
    return await AIReport.findById(id);
  }
}
module.exports = OCRService;
