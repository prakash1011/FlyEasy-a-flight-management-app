import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaCreditCard, FaCalendarAlt, FaLock, FaUser, FaMapMarkerAlt } from 'react-icons/fa';

import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const PaymentForm = ({ onSubmit, total, isLoading, errors = {} }) => {
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    saveCard: false
  });
  
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCardData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const formatCardNumber = (value) => {
    // Remove non-digit characters
    const digits = value.replace(/\D/g, '');
    // Split into groups of 4 digits
    const groups = [];
    for (let i = 0; i < digits.length; i += 4) {
      groups.push(digits.slice(i, i + 4));
    }
    return groups.join(' ').slice(0, 19); // Limit to 16 digits + 3 spaces
  };
  
  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardData(prev => ({
      ...prev,
      cardNumber: formattedValue
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      paymentMethod,
      ...cardData
    });
  };
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  
  const getCardIcon = () => {
    const cardNumber = cardData.cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cardNumber)) return '💳 Visa';
    if (/^5[1-5]/.test(cardNumber)) return '💳 Mastercard';
    if (/^3[47]/.test(cardNumber)) return '💳 American Express';
    if (/^6(?:011|5)/.test(cardNumber)) return '💳 Discover';
    return '💳 Card';
  };
  
  return (
    <Card className="mb-6">
      <h3 className="text-lg font-medium text-white mb-4 border-b border-dark-700 pb-2">
        Payment Details
      </h3>
      
      <div className="mb-6">
        <h4 className="text-white mb-3">Payment Methods</h4>
        <div className="flex flex-wrap gap-3">
          {/* Credit Card Option - Simplified for maximum reliability */}
          <button 
            type="button"
            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors w-full md:w-auto ${
              paymentMethod === 'creditCard' 
                ? 'bg-primary-900 border-primary-600' 
                : 'bg-dark-700 border-dark-600 hover:bg-dark-600'
            }`}
            onClick={() => setPaymentMethod('creditCard')}
          >
            <div className={`w-4 h-4 rounded-full mr-2 border ${
              paymentMethod === 'creditCard' 
                ? 'bg-primary-500 border-primary-600' 
                : 'bg-dark-600 border-gray-500'
            }`}></div>
            <span className="mr-2">💳</span>
            <span className="text-gray-200">Credit/Debit Card</span>
          </button>
          
          {/* PayPal Option */}
          <button 
            type="button"
            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors w-full md:w-auto ${
              paymentMethod === 'paypal' 
                ? 'bg-primary-900 border-primary-600' 
                : 'bg-dark-700 border-dark-600 hover:bg-dark-600'
            }`}
            onClick={() => setPaymentMethod('paypal')}
          >
            <div className={`w-4 h-4 rounded-full mr-2 border ${
              paymentMethod === 'paypal' 
                ? 'bg-primary-500 border-primary-600' 
                : 'bg-dark-600 border-gray-500'
            }`}></div>
            <span className="mr-2">🔵</span>
            <span className="text-gray-200">PayPal</span>
          </button>
          
          {/* Apple Pay Option */}
          <button 
            type="button"
            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors w-full md:w-auto ${
              paymentMethod === 'applePay' 
                ? 'bg-primary-900 border-primary-600' 
                : 'bg-dark-700 border-dark-600 hover:bg-dark-600'
            }`}
            onClick={() => setPaymentMethod('applePay')}
          >
            <div className={`w-4 h-4 rounded-full mr-2 border ${
              paymentMethod === 'applePay' 
                ? 'bg-primary-500 border-primary-600' 
                : 'bg-dark-600 border-gray-500'
            }`}></div>
            <span className="mr-2">🍏</span>
            <span className="text-gray-200">Apple Pay</span>
          </button>
        </div>
      </div>
      
      {paymentMethod === 'creditCard' && (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              name="cardNumber"
              type="text"
              label="Card Number"
              value={cardData.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="XXXX XXXX XXXX XXXX"
              maxLength={19}
              icon={<FaCreditCard />}
              error={errors.cardNumber}
              required
            />
            {cardData.cardNumber && (
              <div className="mt-1 text-right text-gray-400 text-sm">
                {getCardIcon()}
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <Input
              name="cardholderName"
              type="text"
              label="Cardholder Name"
              value={cardData.cardholderName}
              onChange={handleInputChange}
              placeholder="Name on card"
              icon={<FaUser />}
              error={errors.cardholderName}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-300 mb-1">
                Expiration Date <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <Select
                  name="expiryMonth"
                  value={cardData.expiryMonth}
                  onChange={handleInputChange}
                  options={[
                    { value: '', label: 'MM' },
                    ...[...Array(12)].map((_, i) => {
                      const month = i + 1;
                      return {
                        value: month.toString().padStart(2, '0'),
                        label: month.toString().padStart(2, '0')
                      };
                    })
                  ]}
                  className="w-1/2"
                  error={errors.expiryMonth}
                  required
                />
                <Select
                  name="expiryYear"
                  value={cardData.expiryYear}
                  onChange={handleInputChange}
                  options={[
                    { value: '', label: 'YYYY' },
                    ...years.map(year => ({
                      value: year.toString(),
                      label: year.toString()
                    }))
                  ]}
                  className="w-1/2"
                  error={errors.expiryYear}
                  required
                />
              </div>
              {errors.expiryDate && (
                <p className="mt-1 text-red-400 text-xs">{errors.expiryDate}</p>
              )}
            </div>
            
            <div>
              <Input
                name="cvv"
                type="password"
                label="CVV"
                value={cardData.cvv}
                onChange={handleInputChange}
                placeholder="XXX"
                maxLength={4}
                icon={<FaLock />}
                error={errors.cvv}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-white mb-3">Billing Address</h4>
            
            <div className="mb-4">
              <Input
                name="billingAddress"
                type="text"
                label="Address"
                value={cardData.billingAddress}
                onChange={handleInputChange}
                placeholder="Street address"
                icon={<FaMapMarkerAlt />}
                error={errors.billingAddress}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Input
                name="city"
                type="text"
                label="City"
                value={cardData.city}
                onChange={handleInputChange}
                placeholder="City"
                error={errors.city}
                required
              />
              
              <Input
                name="state"
                type="text"
                label="State/Province"
                value={cardData.state}
                onChange={handleInputChange}
                placeholder="State/Province"
                error={errors.state}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="zipCode"
                type="text"
                label="ZIP/Postal Code"
                value={cardData.zipCode}
                onChange={handleInputChange}
                placeholder="ZIP/Postal code"
                error={errors.zipCode}
                required
              />
              
              <Select
                name="country"
                label="Country"
                value={cardData.country}
                onChange={handleInputChange}
                options={[
                  { value: 'US', label: 'United States' },
                  { value: 'CA', label: 'Canada' },
                  { value: 'UK', label: 'United Kingdom' },
                  { value: 'AU', label: 'Australia' },
                  { value: 'IN', label: 'India' }
                ]}
                error={errors.country}
                required
              />
            </div>
          </div>
          
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="saveCard"
              name="saveCard"
              checked={cardData.saveCard}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500 focus:ring-offset-dark-800"
            />
            <label htmlFor="saveCard" className="ml-2 text-sm text-gray-300">
              Save this card for future payments
            </label>
          </div>
          
          <div className="border-t border-dark-700 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Subtotal:</span>
              <span className="text-white">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-white">Total Payment:</span>
              <span className="text-xl font-bold text-primary-400">${total.toFixed(2)}</span>
            </div>
            
            <Button
              type="submit"
              fullWidth
              className="mt-6"
              disabled={isLoading}
              icon={<FaLock />}
            >
              {isLoading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
            </Button>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              Your payment information is encrypted and secure.
              By completing this payment, you agree to our Terms and Conditions.
            </p>
          </div>
        </form>
      )}
      
      {paymentMethod === 'paypal' && (
        <div className="py-8 text-center">
          <div className="bg-dark-700 p-8 rounded-lg mb-6">
            <p className="text-lg text-gray-300 mb-4">
              You'll be redirected to PayPal to complete your payment of ${total.toFixed(2)}
            </p>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              icon={<FaLock />}
            >
              {isLoading ? 'Processing...' : 'Continue to PayPal'}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            PayPal is a secure payment method that doesn't share your financial information.
          </p>
        </div>
      )}
      
      {paymentMethod === 'applePay' && (
        <div className="py-8 text-center">
          <div className="bg-dark-700 p-8 rounded-lg mb-6">
            <p className="text-lg text-gray-300 mb-4">
              Complete your payment of ${total.toFixed(2)} with Apple Pay
            </p>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              icon={<FaLock />}
            >
              {isLoading ? 'Processing...' : 'Pay with Apple Pay'}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Apple Pay is a secure payment method that uses device-specific numbers and unique transaction codes.
          </p>
        </div>
      )}
    </Card>
  );
};

PaymentForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
  isLoading: PropTypes.bool,
  errors: PropTypes.object
};

export default PaymentForm;
