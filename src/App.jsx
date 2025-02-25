// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./layouts/Navbar";
import Footer from "./layouts/Footer";
import FormSkeleton from "./skeletons/FormSkeleton";
import HomeSkeleton from "./skeletons/HomeSkeleton";
import GraphSkeleton from "./skeletons/GraphSkeleton";
import ListSkeleton from "./skeletons/ListSkeleton";

const Dashboard = lazy(() => import("./components/Dashboard"));
const CreateAccForm = lazy(() => import("./components/CreateAccForm"));
const TransactionForm = lazy(() => import("./components/TransactionForm"));
const EditTransaction = lazy(() => import("./components/EditTransaction"));
const AccountDetail = lazy(() => import("./components/AccountDetails"));
const Analytics = lazy(() => import("./components/Analytics"));
const Home = lazy(() => import("./pages/Home"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow p-4 mt-17 lg:mt-12">
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<HomeSkeleton />}>
                <Home />
              </Suspense>
            }
          />
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<ListSkeleton />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/addAccount"
            element={
              <Suspense fallback={<FormSkeleton />}>
                <CreateAccForm />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/:accountId/createTransaction"
            element={
              <Suspense fallback={<FormSkeleton />}>
                <TransactionForm />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/:accountId/transaction/:transactionId/edit"
            element={
              <Suspense fallback={<FormSkeleton />}>
                <EditTransaction />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/:accountId"
            element={
              <Suspense fallback={<ListSkeleton />}>
                <AccountDetail />
              </Suspense>
            }
          />
          <Route
            path="/dashboard/:accountId/analytics"
            element={
              <Suspense fallback={<GraphSkeleton />}>
                <Analytics />
              </Suspense>
            }
          />
          <Route
            path="/signup"
            element={
              <Suspense fallback={<FormSkeleton />}>
                <Signup />
              </Suspense>
            }
          />
          <Route
            path="/login"
            element={
              <Suspense fallback={<FormSkeleton />}>
                <Login />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <h1 className="text-red-500 text-center">404: Page Not Found</h1>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
