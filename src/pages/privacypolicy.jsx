import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PrivacyPolicy = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 id="privacy-policy">Privacy Policy</h1>
      <ul>
        <li>We collect only the data necessary to provide and improve our services.</li>
        <li>Cookies are used to enhance user experience and analyze site traffic.</li>
        <li>We do not share your personal information with third parties except as required by law or to provide our services.</li>
        <li>Your data is protected using industry-standard security measures.</li>
        <li>By using BlogSyte, you consent to our data collection and privacy practices.</li>
      </ul>
      <h1 id="terms-of-service" style={{ marginTop: '2rem' }}>Terms of Service</h1>
      <ul>
        <li>Users are responsible for the content they post and their activity on BlogSyte.</li>
        <li>Accounts may be suspended or terminated for violating our policies or terms.</li>
        <li>All content remains the intellectual property of its respective creators.</li>
        <li>We do not guarantee uninterrupted or error-free service availability.</li>
        <li>By using BlogSyte, you agree to abide by these terms and conditions.</li>
      </ul>
    </div>
  );
};

export default PrivacyPolicy;