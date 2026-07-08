import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FaFileContract, FaExclamationTriangle, FaCheckCircle, FaUserCheck } from "react-icons/fa";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Terms of Service - FinanceFlow</title>
        <meta
          name="description"
          content="Review the terms and conditions for using the FinanceFlow AI-powered financial management platform. Know your rights, limitations, and responsibilities."
        />
        <link rel="canonical" href="https://financeflow24.vercel.app/terms" />
      </Helmet>

      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-10 sm:p-12 text-center text-white">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-4">
            <FaFileContract className="text-4xl text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="mt-3 text-lg text-blue-100 max-w-xl mx-auto">
            Please read these terms and conditions carefully before using our financial tools.
          </p>
          <div className="mt-4 text-xs text-blue-200">Effective Date: July 8, 2026</div>
        </div>

        {/* Content */}
        <div className="px-6 py-10 sm:p-12 space-y-8 text-gray-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <FaUserCheck className="text-xl text-blue-700" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">1. Acceptance of Terms</h2>
            </div>
            <p className="text-sm sm:text-base">
              By registering an account, linking your WhatsApp number, uploading receipt images, or using the FinanceFlow dashboard, you signify your agreement to be bound by these Terms of Service. If you do not agree to these terms, do not access or use our services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-xl text-blue-700" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">2. Disclaimers: AI Calculations & Gemini Scanning</h2>
            </div>
            <p className="text-sm sm:text-base">
              FinanceFlow provides automated features to parse transactions via third-party artificial intelligence engines (specifically <strong>Google Gemini 2.5 Flash</strong>).
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg text-sm text-amber-800 space-y-2">
              <p className="font-semibold">Important AI Processing Limitation Notice:</p>
              <p>
                Optical Character Recognition (OCR) and context-based category determinations are processed programmatically. AI outputs are not guaranteed to be 100% accurate, clean, or error-free. 
              </p>
              <p>
                <strong>You are solely responsible</strong> for reviewing, validating, and updating all scanned transactions, category classifications, and account balances generated via our receipt scanner or WhatsApp message templates before making financial decisions.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">3. WhatsApp Tracking & Message Rules</h2>
            <p className="text-sm sm:text-base">
              The WhatsApp logging utility (powered by Twilio) is meant strictly for logging personal expenses. You agree not to spam our webhook, transmit automated loop scripts, send abusive contents, or use our sandbox credentials for anything other than logging your valid expense details.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-xl text-blue-700" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">4. User Account Responsibilities</h2>
            </div>
            <p className="text-sm sm:text-base">
              You are responsible for keeping your login credentials, password, and session cookie identifiers confidential. You must notify us immediately of any unauthorized usage of your email. FinanceFlow cannot and will not be liable for any loss or damage arising from your failure to protect your login tokens.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">5. Guest Profile Automated Lifetime Limits</h2>
            <p className="text-sm sm:text-base">
              To allow users to evaluate FinanceFlow's dashboard without signing up, we offer a "Guest Mode." Guest account records, mock balances, and transaction logs are stored on temporary database indexes and are <strong>automatically deleted after 7 minutes of inactivity</strong> (with no recovery options).
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">6. Limitation of Liability</h2>
            <p className="text-sm sm:text-base">
              In no event shall FinanceFlow, its developers, or its API providers (Google Gemini, Twilio) be liable for any financial losses, investment damages, lost savings, system downtime, or database connectivity issues arising from your use of the website or the automated insights provided.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">7. Governing Law</h2>
            <p className="text-sm sm:text-base">
              These terms are governed by and construed in accordance with the laws applicable to internet services, without giving effect to any principles of conflicts of law.
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

export default Terms;
