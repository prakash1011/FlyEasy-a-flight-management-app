import React, { useState } from 'react';
import { FaCreditCard, FaPaypal, FaApplePay, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const PaymentMethods = () => {
  const { user } = useSelector((state) => state.auth);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    cardType: 'visa',
    cardNumber: '',
    nameOnCard: '',
    expiryDate: '',
    cvv: ''
  });
  
  // Payment methods will be populated when the user adds them
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  // Payment transactions will be populated when payments are made
  const [transactions, setTransactions] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, this would be an API call
    const newPaymentMethod = {
      id: `card${Date.now()}`,
      type: formData.cardType,
      lastFour: formData.cardNumber.slice(-4),
      expiryDate: formData.expiryDate,
      isDefault: false,
      name: formData.nameOnCard
    };
    
    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    setShowAddForm(false);
    setFormData({
      cardType: 'visa',
      cardNumber: '',
      nameOnCard: '',
      expiryDate: '',
      cvv: ''
    });
  };

  const handleDelete = (id) => {
    // In a real app, this would be an API call
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
  };

  const setAsDefault = (id) => {
    // In a real app, this would be an API call
    setPaymentMethods(
      paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const getCardIcon = (type) => {
    switch(type) {
      case 'visa':
      case 'mastercard':
        return <FaCreditCard className="text-primary-400" />;
      case 'paypal':
        return <FaPaypal className="text-primary-400" />;
      case 'apple':
        return <FaApplePay className="text-primary-400" />;
      default:
        return <FaCreditCard className="text-primary-400" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Payment Methods</h1>
      
      {/* Payment Methods List */}
      <div className="bg-dark-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Saved Payment Methods</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors duration-300"
          >
            <FaPlus className="mr-2" /> Add New
          </button>
        </div>
        
        {paymentMethods.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-gray-400 mb-4">You don't have any saved payment methods</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors duration-300"
            >
              Add Payment Method
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div 
                key={method.id} 
                className={`flex items-center justify-between p-4 rounded-md ${
                  method.isDefault ? 'bg-dark-700 border border-primary-500' : 'bg-dark-700'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center bg-dark-600 rounded-md">
                    {getCardIcon(method.type)}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-white font-medium capitalize">
                        {method.type}
                        {method.lastFour && ` •••• ${method.lastFour}`}
                      </p>
                      {method.isDefault && (
                        <span className="ml-2 text-xs bg-primary-500 text-white py-1 px-2 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {method.expiryDate ? `Expires ${method.expiryDate}` : method.email}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => setAsDefault(method.id)}
                      className="text-sm text-primary-400 hover:text-primary-300"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="text-sm text-red-500 hover:text-red-400 ml-4"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add New Payment Method Form */}
      {showAddForm && (
        <div className="bg-dark-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Add New Payment Method</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-gray-400 mb-2">Card Type</label>
                <select
                  name="cardType"
                  value={formData.cardType}
                  onChange={handleChange}
                  className="w-full bg-dark-700 border border-dark-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="amex">American Express</option>
                </select>
              </div>
              
              <div className="col-span-2">
                <label className="block text-gray-400 mb-2">Name on Card</label>
                <input
                  type="text"
                  name="nameOnCard"
                  value={formData.nameOnCard}
                  onChange={handleChange}
                  className="w-full bg-dark-700 border border-dark-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-gray-400 mb-2">Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  className="w-full bg-dark-700 border border-dark-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="XXXX XXXX XXXX XXXX"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">Expiry Date</label>
                <input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full bg-dark-700 border border-dark-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="MM/YY"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                  className="w-full bg-dark-700 border border-dark-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="XXX"
                  required
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-dark-600 text-white px-6 py-2 rounded-md mr-4 hover:bg-dark-500 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary-500 text-white px-6 py-2 rounded-md hover:bg-primary-600 transition-colors duration-300"
              >
                Save Payment Method
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Recent Transactions */}
      <div className="bg-dark-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Recent Payment Activity</h2>
        
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No payment activity to display</p>
            <p className="text-gray-500 text-sm mt-2">Your recent transactions will appear here when you make payments</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Payment Method</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Description</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={transaction.id || index} className={index < transactions.length - 1 ? "border-b border-dark-700" : ""}>
                    <td className="py-3 px-4 text-white">{transaction.date}</td>
                    <td className="py-3 px-4 text-white">{transaction.paymentMethod}</td>
                    <td className="py-3 px-4 text-white">{transaction.description}</td>
                    <td className="py-3 px-4 text-white text-right">{transaction.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethods;
