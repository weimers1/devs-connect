import { Icon } from "@iconify/react/dist/iconify.js"
import React, { useState } from 'react'

function BillingPreferences() {
  const [openSetting, setOpenSetting] = useState<string | null>(null);

  const handleSettingClick = (settingId: string) => {
    setOpenSetting(openSetting === settingId ? null : settingId);
  };

  const BillingOptions = [
    {
      id: 'upgrade',
      name: 'Premium Plan',
      description: 'Upgrade to unlock all features'
    },
    {
      id: 'payment-history',
      name: 'Payment History',
      description: 'View your transaction history'
    },
    {
      id: 'billing-details',
      name: 'Billing Details',
      description: 'Manage payment methods and billing info'
    }
  ]
  
  return (
    <div>
      <div className="bg-white md:w-200 md:rounded-xl col-start-1 row-start-1 overflow-hidden shadow-sm border border-gray-100" id="Billing">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Payments & Subscriptions</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your billing and subscription settings</p>
        </div>
        
        {BillingOptions.map((item, index) => (
          <div key={item.id}>
            <div className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleSettingClick(item.id)}>
              <div>
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <Icon 
                icon={openSetting === item.id ? "mdi:chevron-up" : "mdi:chevron-down"} 
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                  openSetting === item.id ? 'rotate-180' : ''
                }`}
              />
            </div>
            
            {openSetting === item.id && (
              <div className="mx-4 mb-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6 space-y-4">
                  {item.id === 'upgrade' && (
                    <div>
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Premium Plan</h3>
                            <p className="text-sm text-gray-600">Unlock all features and get priority support</p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900">$25</div>
                            <div className="text-sm text-gray-600">per month</div>
                          </div>
                        </div>
                        <button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                          Upgrade to Premium
                        </button>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            'Unlimited hackathon entries',
                            'Access to all courses',
                            'Priority support',
                            'Advanced collaboration tools',
                            'Custom profile themes',
                            'Analytics dashboard'
                          ].map((feature, idx) => (
                            <div key={idx} className="flex items-center text-sm text-gray-700">
                              <Icon icon="mdi:check-circle" className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {item.id === 'payment-history' && (
                    <div>
                      <div className="space-y-3">
                        {[
                          { date: 'Jan 15, 2024', amount: '$25.00', status: 'Paid', description: 'Premium Subscription' },
                          { date: 'Dec 15, 2023', amount: '$25.00', status: 'Paid', description: 'Premium Subscription' },
                          { date: 'Nov 15, 2023', amount: '$25.00', status: 'Paid', description: 'Premium Subscription' }
                        ].map((transaction, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <Icon icon="mdi:check" className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{transaction.description}</div>
                                <div className="text-sm text-gray-600">{transaction.date}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">{transaction.amount}</div>
                              <div className="text-sm text-green-600">{transaction.status}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full mt-4 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                        View All Transactions
                      </button>
                    </div>
                  )}
                  
                  {item.id === 'billing-details' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Method</h3>
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <Icon icon="mdi:credit-card" className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">•••• •••• •••• 4242</div>
                              <div className="text-sm text-gray-600">Expires 12/25</div>
                            </div>
                          </div>
                          <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                            Edit
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Billing Address</h3>
                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="text-sm text-gray-900 space-y-1">
                            <div>123 Main Street</div>
                            <div>New York, NY 10001</div>
                            <div>United States</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                          Update Billing Info
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {index !== BillingOptions.length - 1 && <hr className="border-gray-100" />}
          </div>
        ))}
      </div> 
    </div>
  )
}

export default BillingPreferences