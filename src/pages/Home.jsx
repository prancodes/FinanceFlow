import React from 'react';
import LandingPage from './LandingPage';
import { Helmet } from 'react-helmet-async';

const Home = () => {
    return (
        <>
            <Helmet>
                <title>FinanceFlow - AI-Powered Financial Tracking & Analytics</title>
                <meta name="description" content="FinanceFlow is an AI-powered financial management platform. Scan receipts using Gemini, log transactions on WhatsApp, and view real-time analytics." />
                <link rel="canonical" href="https://financeflow24.vercel.app/" />
                <meta property="og:title" content="FinanceFlow - AI-Powered Financial Tracking & Analytics" />
                <meta property="og:description" content="FinanceFlow is an AI-powered financial management platform. Scan receipts using Gemini, log transactions on WhatsApp, and view real-time analytics." />
                <meta property="og:url" content="https://financeflow24.vercel.app/" />
                <meta property="og:image" content="https://financeflow24.vercel.app/og-image.png" />
                <meta name="twitter:title" content="FinanceFlow - AI-Powered Financial Tracking & Analytics" />
                <meta name="twitter:description" content="FinanceFlow is an AI-powered financial management platform. Scan receipts using Gemini, log transactions on WhatsApp, and view real-time analytics." />
                <meta name="twitter:image" content="https://financeflow24.vercel.app/og-image.png" />
            </Helmet>
            <LandingPage />
        </>
    );
};

export default Home;
