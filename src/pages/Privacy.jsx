import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FaShieldAlt, FaLock, FaUserShield, FaWhatsapp, FaBrain } from "react-icons/fa";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Privacy Policy - FinanceFlow</title>
        <meta
          name="description"
          content="Learn about how FinanceFlow collects, uses, and safeguards your financial data, receipt scans, and WhatsApp logs in compliance with modern privacy standards."
        />
        <link rel="canonical" href="https://financeflow24.vercel.app/privacy" />
      </Helmet>

      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-10 sm:p-12 text-center text-white">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-4">
            <FaShieldAlt className="text-4xl text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-lg text-blue-100 max-w-xl mx-auto">
            Your trust is our priority. Read how we protect and manage your financial data with transparency.
          </p>
          <div className="mt-4 text-xs text-blue-200">Last Updated: July 8, 2026</div>
        </div>

        {/* Content */}
        <div className="px-6 py-10 sm:p-12 space-y-8 text-gray-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <FaUserShield className="text-xl text-blue-700" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">1. Data We Collect</h2>
            </div>
            <p className="text-sm sm:text-base">
              FinanceFlow processes information to deliver a comprehensive financial tracking experience. We limit collection to the following categories:
            </p>
            <ul className="list-disc pl-5 text-sm sm:text-base space-y-1">
              <li>
                <strong>Account Credentials:</strong> Name, verified email address, hashed passwords, and profile preferences.
              </li>
              <li>
                <strong>Financial Data:</strong> Bank account names, transaction dates, descriptions, categories, and balance information.
              </li>
              <li>
                <strong>WhatsApp Ingestion Logs:</strong> If linked, phone numbers and the content of transactional SMS/WhatsApp prompts.
              </li>
              <li>
                <strong>Receipt Scans:</strong> Images uploaded for AI-assisted line item extraction.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <FaBrain className="text-xl text-blue-700" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">2. Processing receipt scans via Generative AI</h2>
            </div>
            <p className="text-sm sm:text-base">
              Receipt scans uploaded to FinanceFlow are processed by the <strong>Google Gemini 2.5 Flash</strong> model via the official Google Generative AI SDK. 
            </p>
            <ul className="list-disc pl-5 text-sm sm:text-base space-y-1">
              <li>Your uploaded receipt images are parsed programmatically to identify transaction totals, categories, dates, and vendors.</li>
              <li>FinanceFlow does not train generative AI models using your sensitive financial receipts or documents.</li>
              <li>Images are parsed transiently and stored in secure cloud buckets only to display historical uploads to the account owner.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <FaWhatsapp className="text-xl text-blue-700" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">3. WhatsApp Expense Tracking (Twilio Integration)</h2>
            </div>
            <p className="text-sm sm:text-base">
              Our WhatsApp ingestion utility leverages the <strong>Twilio WhatsApp Gateway API</strong> to receive webhook notifications containing text prompts (e.g., <em>"spent 500 on groceries"</em>).
            </p>
            <p className="text-sm sm:text-base">
              We only parse messages that strictly fit transaction logging formatting directives. Standard messaging records are filtered through authentication checks. Unassociated phone numbers are rejected immediately, and messages containing non-expense descriptions are ignored to preserve data hygiene and user privacy.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <FaLock className="text-xl text-blue-700" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">4. Data Protection & Security Controls</h2>
            </div>
            <p className="text-sm sm:text-base">
              We implement professional safeguards to secure information against unauthorized access:
            </p>
            <ul className="list-disc pl-5 text-sm sm:text-base space-y-1">
              <li><strong>Session Cookies:</strong> HTTP-Only cookies to protect against cross-site scripting (XSS) session hijack attempts.</li>
              <li><strong>Encryption:</strong> Password hashes generated via cryptographically secure salt algorithms (Bcrypt). SSL/TLS transit channels are enforced across all database connections.</li>
              <li><strong>Guest Lifespans:</strong> Guest profile credentials and associated balances are automatically deleted from database indexes after 7 minutes of inactivity.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">5. Data Retention & Deletion</h2>
            <p className="text-sm sm:text-base">
              Registered users retain total ownership over their files. You can delete transactions or terminate accounts directly from your personal settings screen. Upon account termination, all linked records are purged permanently from our active database within 24 hours.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">6. Policy Updates & Contact Information</h2>
            <p className="text-sm sm:text-base">
              We may update this Privacy Policy periodically. Continued use of the platform after updates constitutes consent to the revised terms.
            </p>
            <p className="text-sm sm:text-base font-medium">
              If you have any questions or require data deletion help, contact our data protection team at:{" "}
              <a href="mailto:financeflow341@gmail.com" className="text-blue-600 hover:underline">
                financeflow341@gmail.com
              </a>
            </p>
          </section>

          {/* Footer Back Link */}
          <div className="pt-8 border-t border-gray-100 flex justify-between items-center text-sm">
            <Link to="/" className="text-blue-600 hover:underline font-semibold flex items-center gap-1">
              ← Return to Landing Page
            </Link>
            <span className="text-gray-400">© 2026 FinanceFlow</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
