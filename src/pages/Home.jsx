import React from 'react';
import LandingPage from './LandingPage';
import { Helmet } from 'react-helmet';

const Home = () => {
    return (
        <>
            <Helmet>
                <title>MyExpense - Manage Your Finances Efficiently</title>
            </Helmet>
            <LandingPage />
        </>
    );
};

export default Home;
