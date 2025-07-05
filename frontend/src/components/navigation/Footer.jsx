import { Link } from 'react-router-dom';
import { FaPlaneDeparture, FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark-900 border-t border-dark-700 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6 md:order-2">
            {/* Social links */}
            <Link to="https://twitter.com" className="text-gray-400 hover:text-primary-400" target="_blank" rel="noopener noreferrer">
              <span className="sr-only">Twitter</span>
              <FaTwitter className="h-5 w-5" />
            </Link>
            <Link to="https://facebook.com" className="text-gray-400 hover:text-primary-400" target="_blank" rel="noopener noreferrer">
              <span className="sr-only">Facebook</span>
              <FaFacebook className="h-5 w-5" />
            </Link>
            <Link to="https://instagram.com" className="text-gray-400 hover:text-primary-400" target="_blank" rel="noopener noreferrer">
              <span className="sr-only">Instagram</span>
              <FaInstagram className="h-5 w-5" />
            </Link>
          </div>
          
          <div className="mt-8 md:mt-0 md:order-1">
            <div className="flex items-center justify-center md:justify-start">
              <FaPlaneDeparture className="h-6 w-6 text-primary-500 mr-2" />
              <span className="text-lg font-semibold text-white">FlyEasy</span>
            </div>
            <p className="mt-2 text-center md:text-left text-xs text-gray-400">
              &copy; {currentYear} FlyEasy. All rights reserved.
            </p>
          </div>
        </div>
        
        <div className="mt-8 border-t border-dark-700 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex flex-wrap justify-center sm:justify-start space-x-4 mb-4 sm:mb-0">
              <Link to="/terms" className="text-xs text-gray-400 hover:text-primary-400">
                Terms & Conditions
              </Link>
              <Link to="/privacy" className="text-xs text-gray-400 hover:text-primary-400">
                Privacy Policy
              </Link>
              <Link to="/faq" className="text-xs text-gray-400 hover:text-primary-400">
                FAQ
              </Link>
              <Link to="/support" className="text-xs text-gray-400 hover:text-primary-400">
                Support
              </Link>
            </div>
            
            <div className="text-xs text-gray-500">
              Designed with <span className="text-primary-500">♥</span> for a better travel experience
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
