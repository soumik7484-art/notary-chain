'use strict';

const zlib = require('zlib');
const { processDocumentPipeline } = require('../services/documentAnalysisPipeline');

// Helper to create a synthetic PDF with specific text and ReportLab / C2PA metadata
function createMockPdf(contentStream, options = {}) {
  const compressed = zlib.deflateSync(Buffer.from(contentStream));

  const producer = options.producer || 'ReportLab PDF Library - www.reportlab.com';
  const c2paBlock = options.hasC2PA ? `
9 0 obj
<< /Type /C2PA /claim_generator (Adobe Photoshop / ReportLab C2PA Module) /c2pa_manifest_id (urn:c2pa:test-manifest-88321) >>
endobj
10 0 obj
<< /Type /Sig /Filter /Adobe.PPKLite /SubFilter /adbe.pkcs7.detached /ByteRange [0 100 200 300] /CN (SSL.com C2PA ICA R1 2025) >>
endobj` : '';

  const xmpBlock = `
8 0 obj
<< /Type /Metadata /Subtype /XML /Length 300 >>
stream
<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
      <pdf:Producer>${producer}</pdf:Producer>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>
endstream
endobj`;

  const pdf = Buffer.concat([
    Buffer.from(`%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R/Metadata 8 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj
4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
5 0 obj<</Length ${compressed.length}/Filter/FlateDecode>>stream\r\n`),
    compressed,
    Buffer.from(`\r\nendstream\nendobj
6 0 obj
<</Producer (${producer}) /CreationDate (D:20260818143000Z)>>
endobj
${xmpBlock}
${c2paBlock}
xref
0 11
0000000000 65535 f 
0000000009 00000 n 
trailer<</Size 11/Root 1 0 R/Info 6 0 R>>
startxref
900
%%EOF`)
  ]);

  return pdf;
}

async function runTestSuite() {
  console.log('================================================================');
  console.log(' NOTARYCHAIN DOCUMENT ANALYSIS PIPELINE TEST SUITE (5 DOCUMENTS)');
  console.log('================================================================\n');

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 1: CLEAN MUTUAL NDA
  // ───────────────────────────────────────────────────────────────────────────
  console.log('--- TEST 1: Mutual NDA (With ReportLab & SSL.com C2PA metadata) ---');
  const ndaStream = `
BT /F1 12 Tf 72 720 Td (MUTUAL NON-DISCLOSURE AGREEMENT) Tj
0 -20 Td (Document ID: NC-TEST-NDA-2026-00417) Tj
0 -20 Td (This Mutual Non-Disclosure Agreement is entered into by and between) Tj
0 -20 Td (BlueLedger Analytics Pte. Ltd. and Northstar Robotics India Private Limited) Tj
0 -20 Td (Effective Date: 2026-08-18) Tj
0 -20 Td (Execution Date: 2026-08-18) Tj
0 -20 Td (Governing Law: Laws of Singapore) Tj
0 -20 Td (Both parties agree to mutual confidentiality covenants for 3 years.) Tj
0 -20 Td (Signed by Authorized Signatories:) Tj
0 -20 Td (Mei Lin Tan, Chief Executive Officer) Tj
0 -20 Td (Arjun Malhotra, Director) Tj
ET`;
  const ndaPdf = createMockPdf(ndaStream, { hasC2PA: true, producer: 'ReportLab PDF Library 3.6.12' });
  const ndaResult = await processDocumentPipeline(ndaPdf, 'application/pdf', 'NC-TEST-NDA-2026-00417.pdf', 'Mutual NDA');

  console.log('Classification:', ndaResult.document.category);
  console.log('Parties Extracted:', ndaResult.document_content.parties.map(p => p.value));
  console.log('Signatories Extracted:', ndaResult.document_signatures.map(s => `${s.name} (${s.role})`));
  console.log('Dates Extracted:', ndaResult.document_content.dates.map(d => `${d.label}: ${d.raw}`));
  console.log('Governing Law:', ndaResult.document_content.governing_law);
  console.log('Technical Metadata (Separated): Producer =', ndaResult.technical_metadata.pdf_producer, '| C2PA =', ndaResult.technical_metadata.c2pa?.has_c2pa);
  console.log('Risk Level:', ndaResult.risk_analysis.risk_level);
  console.log('Trust Score:', ndaResult.risk_analysis.trust_score, '/ 100');
  console.log('Risk Factors:', ndaResult.risk_analysis.risk_factors.length === 0 ? 'None (Clean Document)' : ndaResult.risk_analysis.risk_factors);

  // Assertions for NDA
  const ndaPassed = (
    ndaResult.document_content.parties.some(p => p.value.includes('BlueLedger')) &&
    ndaResult.document_content.parties.some(p => p.value.includes('Northstar')) &&
    ndaResult.document_signatures.some(s => s.name.includes('Mei Lin Tan')) &&
    ndaResult.document_signatures.some(s => s.name.includes('Arjun Malhotra')) &&
    ndaResult.risk_analysis.trust_score >= 90 &&
    ndaResult.risk_analysis.risk_level === 'LOW' &&
    !JSON.stringify(ndaResult.document_content.parties).includes('SSL.com') &&
    !JSON.stringify(ndaResult.document_content.parties).includes('ReportLab')
  );
  console.log('-> TEST 1 PASSED:', ndaPassed ? 'YES ✅' : 'NO ❌');
  console.log('\n');

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 2: MASTER SERVICES AGREEMENT (MSA WITH CONFLICTS)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('--- TEST 2: Master Services Agreement (MSA With Conflicts) ---');
  const msaStream = `
BT /F1 12 Tf 72 720 Td (MASTER SERVICES AGREEMENT) Tj
0 -20 Td (This Agreement is by and between Acme Global Tech Inc and Beta Logistics Corp) Tj
0 -20 Td (Effective Date: 01 September 2026) Tj
0 -20 Td (Section 2 - Invoicing: Invoices billed in advance on the 1st of each month.) Tj
0 -20 Td (Schedule B - Statement of Work: Commencement Date: 01 October 2026) Tj
0 -20 Td (Schedule B Payment Terms: Invoices billed in arrears upon milestone delivery.) Tj
0 -20 Td (Governing Law: State of Delaware) Tj
0 -20 Td (Provider Signature: John Doe, Managing Director, Date: 2026-09-01) Tj
0 -20 Td (Client Signature: [Signature] __________ Date: [blank]) Tj
ET`;
  const msaPdf = createMockPdf(msaStream);
  const msaResult = await processDocumentPipeline(msaPdf, 'application/pdf', 'MSA_Conflict_Contract.pdf', 'Master Services Agreement');

  console.log('Classification:', msaResult.document.category);
  console.log('Contradictions Detected:', msaResult.document_content.contradictions.map(c => `${c.code}: ${c.explanation}`));
  console.log('Risk Level:', msaResult.risk_analysis.risk_level);
  console.log('Trust Score:', msaResult.risk_analysis.trust_score, '/ 100');

  const msaPassed = (
    msaResult.document_content.contradictions.some(c => c.code === 'DATE_CONFLICT') &&
    msaResult.document_content.contradictions.some(c => c.code === 'PAYMENT_TERM_CONFLICT') &&
    (msaResult.risk_analysis.risk_level === 'MEDIUM' || msaResult.risk_analysis.risk_level === 'HIGH')
  );
  console.log('-> TEST 2 PASSED:', msaPassed ? 'YES ✅' : 'NO ❌');
  console.log('\n');

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 3: COMMERCIAL INVOICE
  // ───────────────────────────────────────────────────────────────────────────
  console.log('--- TEST 3: Commercial Invoice ---');
  const invoiceStream = `
BT /F1 12 Tf 72 720 Td (COMMERCIAL INVOICE) Tj
0 -20 Td (Invoice No: INV-88421) Tj
0 -20 Td (Date: 2026-08-15) Tj
0 -20 Td (Seller: Apex Cloud Infrastructure Inc) Tj
0 -20 Td (Bill To: Zenith Global Retail Ltd) Tj
0 -20 Td (Item 1: Enterprise Dedicated Cluster - Monthly Subscription: USD 4,800.00) Tj
0 -20 Td (Total Amount Due: $4,800.00 USD) Tj
0 -20 Td (Payment Terms: Net 30 Days via Wire Transfer) Tj
ET`;
  const invoicePdf = createMockPdf(invoiceStream);
  const invoiceResult = await processDocumentPipeline(invoicePdf, 'application/pdf', 'Invoice_INV-88421.pdf', 'Commercial Invoice');

  console.log('Classification:', invoiceResult.document.category);
  console.log('Seller & Buyer:', invoiceResult.document_content.parties.map(p => `${p.type}: ${p.value}`));
  console.log('Monetary Values Extracted:', invoiceResult.document_content.monetary_values);
  console.log('Trust Score:', invoiceResult.risk_analysis.trust_score, '/ 100');

  const invoicePassed = (
    invoiceResult.document.category.includes('Invoice') &&
    invoiceResult.document_content.monetary_values.some(m => m.amount === 4800 && m.currency === 'USD') &&
    !invoiceResult.document_content.monetary_values.some(m => m.amount === 88421) // Did not confuse INV-88421 with money!
  );
  console.log('-> TEST 3 PASSED:', invoicePassed ? 'YES ✅' : 'NO ❌');
  console.log('\n');

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 4: IDENTITY VERIFICATION REPORT (BIOMETRIC FAILURE)
  // ───────────────────────────────────────────────────────────────────────────
  console.log('--- TEST 4: Identity Verification Report (Biometric Threshold Failure) ---');
  const idStream = `
BT /F1 12 Tf 72 720 Td (IDENTITY VERIFICATION AND BIOMETRIC FACIAL AUDIT) Tj
0 -20 Td (Applicant Name: Marcus Vance) Tj
0 -20 Td (ID Document Extracted Name: Marcus Vance Jr) Tj
0 -20 Td (Name Mismatch Detected in Primary Record) Tj
0 -20 Td (Biometric Neural Model: SSD MobileNet + 128D FaceNet Embedding) Tj
0 -20 Td (Biometric Similarity Score: 94.7%) Tj
0 -20 Td (Mandatory Minimum Threshold Required: 95.0%) Tj
0 -20 Td (Biometric Verification: FAILED) Tj
ET`;
  const idPdf = createMockPdf(idStream);
  const idResult = await processDocumentPipeline(idPdf, 'application/pdf', 'ID_Verification_MarcusVance.pdf', 'Identity Verification');

  console.log('Classification:', idResult.document.category);
  console.log('Contradictions / Failures Detected:', idResult.document_content.contradictions.map(c => `${c.code}: ${c.explanation}`));
  console.log('Risk Level:', idResult.risk_analysis.risk_level);
  console.log('Trust Score:', idResult.risk_analysis.trust_score, '/ 100');

  const idPassed = (
    idResult.document_content.contradictions.some(c => c.code === 'BIOMETRIC_THRESHOLD_FAILED') &&
    idResult.document_content.contradictions.some(c => c.code === 'IDENTITY_MISMATCH') &&
    idResult.risk_analysis.risk_level === 'HIGH' &&
    idResult.risk_analysis.trust_score <= 50
  );
  console.log('-> TEST 4 PASSED:', idPassed ? 'YES ✅' : 'NO ❌');
  console.log('\n');

  // ───────────────────────────────────────────────────────────────────────────
  // TEST 5: CONTRACT AMENDMENT
  // ───────────────────────────────────────────────────────────────────────────
  console.log('--- TEST 5: Contract Amendment ---');
  const amendStream = `
BT /F1 12 Tf 72 720 Td (CONTRACT AMENDMENT AGREEMENT) Tj
0 -20 Td (By and between Alpha Ventures LLC and Beta Technologies Inc) Tj
0 -20 Td (This First Amendment amends the Original SaaS Service Agreement) Tj
0 -20 Td (Effective Date: TBD upon mutual execution) Tj
0 -20 Td (Section 1: Revised Monthly Fee shall be USD 6,200 per month.) Tj
0 -20 Td (Signature for Alpha Ventures: John Alpha, CEO, Date: 2026-08-20) Tj
0 -20 Td (Signature for Beta Technologies: [Signature] __________ Date: [blank]) Tj
ET`;
  const amendPdf = createMockPdf(amendStream);
  const amendResult = await processDocumentPipeline(amendPdf, 'application/pdf', 'Contract_Amendment_01.pdf', 'Contract Amendment');

  console.log('Classification:', amendResult.document.category);
  console.log('Parties Extracted:', amendResult.document_content.parties.map(p => p.value));
  console.log('Monetary Fee Extracted:', amendResult.document_content.monetary_values);
  console.log('Risk Flags:', amendResult.risk_analysis.risk_factors.map(r => r.code));
  console.log('Trust Score:', amendResult.risk_analysis.trust_score, '/ 100');

  const amendPassed = (
    amendResult.document.category.includes('Amendment') &&
    amendResult.document_content.monetary_values.some(m => m.amount === 6200 && m.currency === 'USD') &&
    amendResult.document_content.contradictions.some(c => c.code === 'UNEXECUTED_SIGNATURE') &&
    amendResult.document_content.contradictions.some(c => c.code === 'UNCLEAR_EFFECTIVE_DATE')
  );
  console.log('-> TEST 5 PASSED:', amendPassed ? 'YES ✅' : 'NO ❌');
  console.log('\n');

  console.log('================================================================');
  const allPassed = ndaPassed && msaPassed && invoicePassed && idPassed && amendPassed;
  console.log(` OVERALL TEST SUITE RESULT: ${allPassed ? 'ALL 5 TESTS PASSED ✅' : 'FAILURES DETECTED ❌'}`);
  console.log('================================================================');
}

runTestSuite();
