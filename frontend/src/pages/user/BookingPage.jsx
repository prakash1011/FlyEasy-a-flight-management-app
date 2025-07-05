import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlane, FaUser, FaCreditCard, FaCheck } from 'react-icons/fa';

import BookingFlightDetails from '../../components/booking/BookingFlightDetails';
import PassengerForm from '../../components/booking/PassengerForm';
import PaymentForm from '../../components/booking/PaymentForm';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import { createBooking } from '../../store/slices/bookingSlice';

const BookingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { selectedFlight, selectedFlightClass, selectedPassengers } = useSelector((state) => state.flights);
  const { loading: isLoading, error } = useSelector((state) => state.bookings);
  
  // States
  const [activeStep, setActiveStep] = useState(0);
  const [passengers, setPassengers] = useState([]);
  const [errors, setErrors] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Initialize passengers based on selected passengers info
  useEffect(() => {
    if (!selectedFlight) {
      navigate('/search');
      return;
    }
    
    if (selectedPassengers) {
      const { adults = 1, children = 0, infants = 0 } = selectedPassengers;
      
      const newPassengers = [];
      
      // Add adult passengers
      for (let i = 0; i < adults; i++) {
        newPassengers.push({
          passengerType: 'adult',
          title: '',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          nationality: '',
          documentType: '',
          documentNumber: '',
          documentExpiry: '',
          ...(i === 0 && { 
            email: '',
            phone: '',
            emergencyContact: '',
            emergencyPhone: ''
          })
        });
      }
      
      // Add child passengers
      for (let i = 0; i < children; i++) {
        newPassengers.push({
          passengerType: 'child',
          title: '',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          nationality: '',
          documentType: '',
          documentNumber: '',
          documentExpiry: ''
        });
      }
      
      // Add infant passengers
      for (let i = 0; i < infants; i++) {
        newPassengers.push({
          passengerType: 'infant',
          title: '',
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          nationality: '',
          documentType: '',
          documentNumber: ''
        });
      }
      
      setPassengers(newPassengers);
    }
  }, [selectedFlight, selectedPassengers, navigate]);
  
  // Handle passenger data change
  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    };
    setPassengers(updatedPassengers);
    
    // Clear error for the field if it exists
    if (errors[`passenger_${index}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`passenger_${index}_${field}`];
        return newErrors;
      });
    }
  };
  
  // Validate passenger data
  const validatePassengerData = () => {
    const newErrors = {};
    
    passengers.forEach((passenger, index) => {
      const requiredFields = [
        'title', 'firstName', 'lastName', 'dateOfBirth', 
        'nationality', 'documentType', 'documentNumber'
      ];
      
      if (passenger.passengerType !== 'infant') {
        requiredFields.push('documentExpiry');
      }
      
      if (passenger.passengerType === 'adult' && index === 0) {
        requiredFields.push('email', 'phone', 'emergencyContact', 'emergencyPhone');
      }
      
      requiredFields.forEach(field => {
        if (!passenger[field]) {
          newErrors[`passenger_${index}_${field}`] = 'This field is required';
        }
      });
      
      // Validate email format if provided
      if (passenger.email && !/^\S+@\S+\.\S+$/.test(passenger.email)) {
        newErrors[`passenger_${index}_email`] = 'Invalid email format';
      }
      
      // Validate phone format if provided
      if (passenger.phone && !/^\+?[\d\s-]{8,15}$/.test(passenger.phone)) {
        newErrors[`passenger_${index}_phone`] = 'Invalid phone number';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle payment submission
  const handlePaymentSubmit = (paymentData) => {
    setFormSubmitted(true);
    
    const bookingData = {
      flight: selectedFlight,
      flightClass: searchCriteria.flightClass,
      passengers,
      payment: paymentData,
      totalAmount: calculateTotalPrice()
    };
    
    dispatch(createBooking(bookingData))
      .unwrap()
      .then(response => {
        navigate(`/booking-confirmation/${response.bookingId}`);
      })
      .catch(error => {
        setShowErrorModal(true);
        setFormSubmitted(false);
      });
  };
  
  // Calculate total price based on passengers and selected flight
  const calculateTotalPrice = () => {
    if (!selectedFlight || !searchCriteria) return 0;
    
    const { adults = 1, children = 0, infants = 0 } = searchCriteria.passengers || {};
    const { price, childPrice, infantPrice } = selectedFlight;
    
    const adultTotal = adults * price;
    const childTotal = children * (childPrice || price * 0.75);
    const infantTotal = infants * (infantPrice || price * 0.15);
    
    const basePrice = adultTotal + childTotal + infantTotal;
    
    // Add fees and taxes (typically around 15-20%)
    const taxesAndFees = basePrice * 0.18;
    
    return basePrice + taxesAndFees;
  };
  
  // Handle next step
  const handleNext = () => {
    if (activeStep === 0) {
      const isValid = validatePassengerData();
      if (!isValid) return;
    }
    
    setActiveStep(prevStep => prevStep + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  if (!selectedFlight) {
    return <div className="py-16 flex justify-center">
      <div className="text-center">
        <h2 className="text-xl text-white mb-4">No flight selected</h2>
        <Button onClick={() => navigate('/search-flights')}>
          Search Flights
        </Button>
      </div>
    </div>;
  }
  
  const steps = [
    { title: 'Passenger Details', icon: <FaUser /> },
    { title: 'Payment', icon: <FaCreditCard /> },
    { title: 'Confirmation', icon: <FaCheck /> }
  ];
  
  return (
    <div className="py-8">
      {/* Booking Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          <Button 
            variant="text" 
            className="mr-4"
            onClick={() => navigate('/search-flights')}
            icon={<FaArrowLeft />}
          >
            Back to Search
          </Button>
          <h1 className="text-2xl font-bold text-white">Book Your Flight</h1>
        </div>
        
        <div className="mt-8 flex justify-between relative">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center relative z-10 ${
                index <= activeStep ? 'opacity-100' : 'opacity-50'
              }`}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index < activeStep 
                    ? 'bg-green-600 text-white' 
                    : index === activeStep 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-dark-700 text-gray-400'
                }`}
              >
                {index < activeStep ? <FaCheck /> : step.icon}
              </div>
              <div className="mt-2 text-sm font-medium text-gray-300">
                {step.title}
              </div>
            </div>
          ))}
          
          {/* Connecting lines */}
          <div className="absolute top-5 left-0 w-full h-0.5 bg-dark-700">
            <div 
              className="h-full bg-primary-600" 
              style={{ 
                width: `${activeStep * 50}%`, 
                transition: 'width 0.3s ease-in-out' 
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Flight Details */}
      <BookingFlightDetails 
        flight={selectedFlight} 
        passengers={selectedPassengers} 
        flightClass={selectedFlightClass}
      />
      
      {/* Step Content */}
      <div className="mt-8">
        {/* Step 1: Passenger Details */}
        {activeStep === 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Passenger Information</h2>
            
            {passengers.map((passenger, index) => (
              <PassengerForm 
                key={index}
                passenger={passenger}
                index={index}
                onChange={handlePassengerChange}
                passengerType={passenger.passengerType}
                errors={{
                  title: errors[`passenger_${index}_title`],
                  firstName: errors[`passenger_${index}_firstName`],
                  lastName: errors[`passenger_${index}_lastName`],
                  dateOfBirth: errors[`passenger_${index}_dateOfBirth`],
                  nationality: errors[`passenger_${index}_nationality`],
                  documentType: errors[`passenger_${index}_documentType`],
                  documentNumber: errors[`passenger_${index}_documentNumber`],
                  documentExpiry: errors[`passenger_${index}_documentExpiry`],
                  email: errors[`passenger_${index}_email`],
                  phone: errors[`passenger_${index}_phone`],
                  emergencyContact: errors[`passenger_${index}_emergencyContact`],
                  emergencyPhone: errors[`passenger_${index}_emergencyPhone`]
                }}
              />
            ))}
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleNext}
                variant="primary"
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 2: Payment */}
        {activeStep === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Payment Information</h2>
            
            <PaymentForm 
              onSubmit={handlePaymentSubmit}
              total={calculateTotalPrice()}
              isLoading={isLoading || formSubmitted}
              errors={errors}
            />
            
            <div className="mt-6 flex justify-between">
              <Button 
                onClick={handleBack}
                variant="outline"
              >
                Back to Passenger Details
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Loading Overlay */}
      {(isLoading || formSubmitted) && (
        <div className="fixed inset-0 bg-dark-900 bg-opacity-70 flex items-center justify-center z-50">
          <Loader size="large" text="Processing your booking..." fullScreen />
        </div>
      )}
      
      {/* Error Modal */}
      <Modal 
        isOpen={showErrorModal} 
        onClose={() => setShowErrorModal(false)}
        title="Booking Error"
      >
        <div className="text-center p-4">
          <div className="bg-red-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <FaPlane className="text-red-300 h-8 w-8 transform rotate-45" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Payment Failed</h3>
          <p className="text-gray-400 mb-6">
            {error || 'There was an issue processing your payment. Please try again or use a different payment method.'}
          </p>
          <Button onClick={() => setShowErrorModal(false)} fullWidth>
            Try Again
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default BookingPage;
