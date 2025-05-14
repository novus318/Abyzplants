import React from 'react';

const PolicyPage = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Policies</h1>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Return Policy</h2>
        <p className="text-gray-700 leading-relaxed">We accept returns of unused items in their original packaging within 14 days of delivery. To initiate a return, please contact our customer service team at [customer service email] and fill out the return form provided. Refunds will be processed to the original payment method or as store credit, depending on your preference. Please note that the customer is responsible for return shipping costs unless the item is defective or incorrect.</p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
        <p className="text-gray-700 leading-relaxed">We collect personal data such as name, email, and payment information to process orders and improve our services. Your data is shared with third parties only for order fulfillment and is protected with advanced security measures. You have the right to access, correct, or delete your personal data. For privacy-related inquiries, please contact us at [privacy contact email].</p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Policy for Plans</h2>
        <p className="text-gray-700 leading-relaxed">Our subscription plans are billed on a monthly basis. You can cancel your subscription at any time through your account settings. Changes to plans, including pricing updates, will be communicated via email at least 30 days in advance. For any questions regarding your subscription, please contact us at [subscription contact email].</p>
      </section>
    </div>
  );
};

export default PolicyPage;