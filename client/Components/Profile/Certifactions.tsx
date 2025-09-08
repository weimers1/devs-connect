import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import API from '../../Service/service';

// TypeScript interface for certification
interface Certification {
    id: number;
    certName: string;
    issuer: string;
    dateEarned: string;
    dateExpiration?: string;
    credentialID: string;
    credentialURL?: string;
}

function Certifications() {
       const [showCertModal, setShowCertModal] = useState(false);
       const [isLoading, setLoading] = useState(true);
       const [certifications, setCertifications] = useState<Certification[]>([]);
       const [certSaving, setCertSaving] = useState(false);
       const [certSaveStatus, setCertSaveStatus] = useState('');
       const [hasChanges, setHasChanges] = useState(false);
       const [showAll, setShowAll] = useState(false);
       const [editingCert, setEditingCert] = useState<Certification | null>(null);
       const [showDropdown, setShowDropdown] = useState<number | null>(null);
       
       // Certification form data
       const [certData, setCertData] = useState({
         certName: '',
         issuer: '',
         issuedMonth: '',
         issuedYear: '',
         expiryMonth: '',
         expiryYear: '',
         credentialID: '',
         credentialURL: ''
       });
       
       // Years array for dropdowns
       const currentYear = new Date().getFullYear();
       const startYear = currentYear - 100;
       const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
       const sortedYears = [...years].sort((a,b) => b - a);
       
       const handleCertificationClick = () => {
         setEditingCert(null);
         setCertData({
           certName: '',
           issuer: '',
           issuedMonth: '',
           issuedYear: '',
           expiryMonth: '',
           expiryYear: '',
           credentialID: '',
           credentialURL: ''
         });
         setShowCertModal(true);
       }
       
       const handleEditCert = (cert: Certification) => {
         const [month, year] = cert.dateEarned.split('-');
         const [expiryMonth, expiryYear] = cert.dateExpiration ? cert.dateExpiration.split('-') : ['', ''];
         
         setEditingCert(cert);
         setCertData({
           certName: cert.certName,
           issuer: cert.issuer,
           issuedMonth: month,
           issuedYear: year,
           expiryMonth: expiryMonth || '',
           expiryYear: expiryYear || '',
           credentialID: cert.credentialID,
           credentialURL: cert.credentialURL || ''
         });
         setShowCertModal(true);
         setShowDropdown(null);
       }
       
       const handleDeleteCert = async (certId: number) => {
         try {
           await API.deleteCertification(certId);
           const updatedCerts = await API.getCertifications();
           setCertifications(updatedCerts || []);
           setShowDropdown(null);
         } catch (error) {
           console.error('Error deleting certification:', error);
         }
       }
       
       // Handle form changes
       const handleChange = (field: string, value: string) => {
         setCertData((prevData) => ({
           ...prevData,
           [field]: value,
         }));
         setHasChanges(true);
       };
       
       // Handle form save
       const handleSave = async () => {
         setCertSaving(true);
         setCertSaveStatus('');
         try {
           const certPayload = {
             certName: certData.certName,
             issuer: certData.issuer,
             dateEarned: `${certData.issuedMonth}-${certData.issuedYear}`,
             dateExpiration: certData.expiryMonth && certData.expiryYear ? `${certData.expiryMonth}-${certData.expiryYear}` : '',
             credentialID: certData.credentialID,
             credentialURL: certData.credentialURL
           };
           
           if (editingCert) {
             await API.updateCertifications(editingCert.id.toString(), certPayload);
           } else {
             await API.addCertifications(certPayload);
           }
           setCertSaveStatus('success');
           
           // Refresh certifications list
           const response = await API.getCertifications();
           setCertifications(response || []);
           
           setTimeout(() => {
             setShowCertModal(false);
             setCertSaving(false);
             setCertSaveStatus('');
             // Reset form
             setCertData({
               certName: '',
               issuer: '',
               issuedMonth: '',
               issuedYear: '',
               expiryMonth: '',
               expiryYear: '',
               credentialID: '',
               credentialURL: ''
             });
           }, 1500);
         } catch (error) {
           console.error('Error saving certification:', error);
           setCertSaveStatus('error');
           setCertSaving(false);
         }
       }; 

           useEffect(() => {
const loadCertifications = async () => {
    try {
      const response = await API.getCertifications();
      console.log('Certifications from DB:', response);
      setCertifications(response || []);
    } catch(error) {
      console.log("Unable to fetch certifications:", error);
      setCertifications([]);
    } finally {
      setLoading(false);
    }
  }
  loadCertifications();
 }, [])

 // Close dropdown when clicking outside
 useEffect(() => {
   const handleClickOutside = () => setShowDropdown(null);
   if (showDropdown) {
     document.addEventListener('click', handleClickOutside);
     return () => document.removeEventListener('click', handleClickOutside);
   }
 }, [showDropdown])

    // Loading state
    if (isLoading) {
        return (
            <div className="bg-white shadow-md p-4 sm:p-6 w-full sm:rounded-lg mt-2">
                <div className="flex justify-center items-center h-32">
                    <Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading certifications...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-md p-4 sm:p-6 w-full sm:rounded-lg mt-2">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Certifications</h2>
                <button className="text-blue-600 hover:text-blue-800"
                onClick={handleCertificationClick}
                >
                    <Icon icon="mdi:plus" className="w-5 h-5" />
                </button>
            </div>

            {/* Certifications List */}
            {certifications.length === 0 ? (
                <div className="text-center py-8">
                    <Icon icon="mdi:certificate-outline" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No certifications added yet</p>
                    <p className="text-gray-400 text-sm">Add your professional certifications to showcase your skills</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {(showAll ? certifications : certifications.slice(0,3)).map (cert => (
                    <div key={cert.id} className="flex border-b border-gray-100 pb-4">
                        {/* Logo - Default certification icon since DB doesn't store logos */}
                        <div className="flex-shrink-0 mr-4">
                            <div className="w-26 h-26 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Icon icon="mdi:certificate" className="w-12 h-12 text-blue-600" />
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 overflow-hidden">
                            <h3 className="font-medium text-gray-900 truncate">{cert.certName}</h3>
                            <p className="text-gray-600 text-sm">{cert.issuer}</p>
                            <p className="text-gray-500 text-sm">
                                Issued {cert.dateEarned} {cert.dateExpiration && `· Expires ${cert.dateExpiration}`}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                                Credential ID: {cert.credentialID}
                            </p>
                            {cert.credentialURL && (
                                <a 
                                    href={cert.credentialURL} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 text-xs hover:underline"
                                >
                                    View Credential
                                </a>
                            )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex-shrink-0 self-start relative">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDropdown(showDropdown === cert.id ? null : cert.id);
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <Icon icon="mdi:dots-vertical" className="w-5 h-5" />
                            </button>
                            {showDropdown === cert.id && (
                                <div className="absolute right-0 top-8 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditCert(cert);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center rounded-t-lg"
                                    >
                                        <Icon icon="mdi:pencil" className="w-4 h-4 mr-2" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('Are you sure you want to delete this certification?')) {
                                                handleDeleteCert(cert.id);
                                            }
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center rounded-b-lg"
                                    >
                                        <Icon icon="mdi:delete" className="w-4 h-4 mr-2" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    ))}
                      {/* Show all button */}
            {certifications.length > 3 && (
                <button 
                    onClick={() => setShowAll(!showAll)}
                    className="mt-4 text-blue-600 font-medium text-sm hover:text-blue-800 flex items-center"
                >
                    {showAll ? 'Show less' : `Show all ${certifications.length} certifications`}
                    <Icon icon={showAll ? "mdi:chevron-up" : "mdi:chevron-down"} className="w-4 h-4 ml-1" />
                </button>
            )}
                </div>
            )}
         
         {showCertModal && (
           <div className=" fixed inset-0 flex items-start justify-center pt-16 z-[9999]"
            style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}} //Provides transparency for the background 
           >
              <div className="bg-white rounded-lg mr-5 p-6 w-170 max-h-fit">
                <h2 className="text-xl font-bold mb-2">{editingCert ? 'Edit Certification' : 'Add Certification'}</h2>
                <hr className="bg-gray-700"></hr>
           {/* Form fields will go here */}
                       <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                              <label className="block text-sm font-medium mt-2">Certification Name</label>
                              <input 
                                type="text" 
                                value={certData.certName}
                                onChange={(e) => handleChange('certName', e.target.value)}
                                className="w-full px-3 py-1 border border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <label className="block text-sm font-medium  mt-2">Issuer</label>
                              <input 
                                type="text"
                                value={certData.issuer}
                                onChange={(e) => handleChange('issuer', e.target.value)}
                                className="w-full px-3 py-1 border border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              /> 
                              </div>
                               <label className="block text-sm font-medium mt-2 mb-2">Issued Date</label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <select className="rounded-xl focus:outline-none focus:ring-1 border-1 py-1"
                                  onChange={(e) => handleChange('issuedMonth', e.target.value)}
                                  value={certData.issuedMonth}
                                >
                                  <option value="">Month</option>
                                  <option value="January">January</option>
                                  <option value="February">February</option>
                                  <option value="March">March</option>
                                  <option value="April">April</option>
                                  <option value="May">May</option>
                                  <option value="June">June</option>
                                  <option value="July">July</option>
                                  <option value="August">August</option>
                                  <option value="September">September</option>
                                  <option value="October">October</option>
                                  <option value="November">November</option>
                                  <option value="December">December</option>
                                </select>
                                <select className="rounded-xl focus:outline-none focus:ring-1 border-1 py-1"
                                  onChange={(e) => handleChange('issuedYear', e.target.value)}
                                  value={certData.issuedYear}
                                >
                                  <option value="">Year</option>
                                 {sortedYears.map(year => ( //to map the years for the licenses/certifications 
                                  <option key={year} value={year}>{year}</option>
                                  ))}
                                </select>
                                 </div>
                                     <label className="block text-sm font-medium mt-2 mb-2">Expiration Date</label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <select className="rounded-xl focus:outline-none focus:ring-1 border-1 py-1"
                                  onChange={(e) => handleChange('expiryMonth', e.target.value)}
                                  value={certData.expiryMonth}
                                >
                                  <option value="">Month</option>
                                  <option value="January">January</option>
                                  <option value="February">February</option>
                                  <option value="March">March</option>
                                  <option value="April">April</option>
                                  <option value="May">May</option>
                                  <option value="June">June</option>
                                  <option value="July">July</option>
                                  <option value="August">August</option>
                                  <option value="September">September</option>
                                  <option value="October">October</option>
                                  <option value="November">November</option>
                                  <option value="December">December</option>
                                </select>
                                <select className="rounded-xl focus:outline-none focus:ring-1 border-1 py-1"
                                  onChange={(e) => handleChange('expiryYear', e.target.value)}
                                  value={certData.expiryYear}
                                >
                                  <option value="">Year</option>
                                 {sortedYears.map(year => ( //to map the years for the licenses/certifications 
                                  <option key={year} value={year}>{year}</option>
                                  ))}
                                </select>
                              </div>
                               <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                              <label className="block text-sm font-medium  mt-2">Credential ID</label>
                              <input 
                                type="text" 
                                value={certData.credentialID}
                                onChange={(e) => handleChange('credentialID', e.target.value)}
                                className="w-full px-3 py-1 border border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <label className="block text-sm font-medium  mt-2">Credential URL</label>
                              <input 
                                type="text"
                                value={certData.credentialURL}
                                onChange={(e) => handleChange('credentialURL', e.target.value)}
                                className="w-full px-3 py-1 border border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              /> 
                              </div>
                         
                <div className="flex justify-end space-x-2 mt-4">
                  <button onClick={() => setShowCertModal(false)}>Cancel</button>
                 <button 
      onClick={handleSave}
      disabled={certSaving}
      className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 ${
        certSaveStatus === 'success' 
          ? 'bg-green-600 text-white' 
          : certSaveStatus === 'error'
          ? 'bg-red-600 text-white'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {certSaving ? (
        <>
          <Icon icon="mdi:loading" className="animate-spin w-4 h-4 mr-2" />
          Saving...
        </>
      ) : certSaveStatus === 'success' ? (
        <>
          <Icon icon="mdi:check" className="w-4 h-4 mr-2" />
          Saved!
        </>
      ) : certSaveStatus === 'error' ? (
        <>
          <Icon icon="mdi:alert" className="w-4 h-4 mr-2" />
          Error
        </>
      ) : (
        'Save'
      )}
    </button>
    
                </div>
              </div>
            </div>
          )}
        </div>
    );
    
}

export default Certifications;




