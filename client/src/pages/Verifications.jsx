import React from 'react';
import VerificationQueue from '../components/verification/VerificationQueue';

const Verifications = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-[#2D2A27] tracking-tight">Document Verification Center</h1>
        <p className="text-[13px] text-[#9B9490] mt-0.5">
          Audit, approve, and cryptographically seal legal documents on Polygon Amoy
        </p>
      </div>

      <VerificationQueue />
    </div>
  );
};

export default Verifications;
