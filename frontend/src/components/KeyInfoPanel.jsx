import React from 'react';
import { CheckCircle, AlertTriangle, Clock, CreditCard, Info } from 'lucide-react';

/**
 * Displays the extracted key information from a government document.
 * Props:
 *   keyInfo: object with arrays: deadlines, eligibility, requiredDocs, fees, warnings, contacts
 */
export default function KeyInfoPanel({ keyInfo }) {
  if (!keyInfo) return null;
  const { deadlines = [], eligibility = [], requiredDocs = [], fees = [], warnings = [], contacts = [] } = keyInfo;

  const sections = [
    { label: 'Deadlines', icon: <Clock className="w-4 h-4 inline mr-1" />, items: deadlines },
    { label: 'Eligibility', icon: <CheckCircle className="w-4 h-4 inline mr-1" />, items: eligibility },
    { label: 'Required Documents', icon: <Info className="w-4 h-4 inline mr-1" />, items: requiredDocs },
    { label: 'Fees', icon: <CreditCard className="w-4 h-4 inline mr-1" />, items: fees },
    { label: 'Warnings', icon: <AlertTriangle className="w-4 h-4 inline mr-1" />, items: warnings },
    { label: 'Contact Details', icon: <Info className="w-4 h-4 inline mr-1" />, items: contacts },
  ];

  return (
    <div className="space-y-4">
      {sections.map((sec) => (
        sec.items && sec.items.length > 0 && (
          <div key={sec.label}>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center">
              {sec.icon}{sec.label}
            </h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {sec.items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </div>
        )
      ))}
    </div>
  );
}
