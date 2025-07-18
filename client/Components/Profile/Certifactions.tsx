import React from 'react';
import { Icon } from '@iconify/react';

function Certifications() {
    // Sample certification data - replace with your actual data
    const certifications = [
        {
            id: 1,
            name: "AWS Certified Solutions Architect",
            issuer: "Amazon Web Services",
            issueDate: "May 2023",
            expiryDate: "May 2026",
            credentialId: "AWS-123456",
            credentialURL: "https://aws.amazon.com/verification",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/1024px-Amazon_Web_Services_Logo.svg.png"
        },
        {
            id: 2,
            name: "React Developer Certification",
            issuer: "Meta",
            issueDate: "January 2023",
            expiryDate: null,
            credentialId: "FB-789012",
            credentialURL: "https://developers.facebook.com/certification",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png"
        }
    ];

    return (
        <div className="bg-white shadow-md p-4 sm:p-6 w-full sm:rounded-lg mt-2">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Certifications</h2>
                <button className="text-blue-600 hover:text-blue-800">
                    <Icon icon="mdi:plus" className="w-5 h-5" />
                </button>
            </div>

            {/* Certifications List */}
            <div className="space-y-4">
                {certifications.map(cert => (
                    <div key={cert.id} className="flex border-b border-gray-100 pb-4">
                        {/* Logo */}
                        <div className="flex-shrink-0 mr-4">
                            <img 
                                src={cert.logo} 
                                alt={cert.issuer} 
                                className="w-12 h-12 object-contain"
                            />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 overflow-hidden">
                            <h3 className="font-medium text-gray-900 truncate">{cert.name}</h3>
                            <p className="text-gray-600 text-sm">{cert.issuer}</p>
                            <p className="text-gray-500 text-sm">
                                Issued {cert.issueDate} {cert.expiryDate && `· Expires ${cert.expiryDate}`}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                                Credential ID: {cert.credentialId}
                            </p>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex-shrink-0 self-start">
                            <button className="text-gray-400 hover:text-gray-600">
                                <Icon icon="mdi:dots-vertical" className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Show all button */}
            {certifications.length > 2 && (
                <button className="mt-4 text-blue-600 font-medium text-sm hover:text-blue-800 flex items-center">
                    Show all {certifications.length} certifications
                    <Icon icon="mdi:chevron-down" className="w-4 h-4 ml-1" />
                </button>
            )}
        </div>
    );
}

export default Certifications;