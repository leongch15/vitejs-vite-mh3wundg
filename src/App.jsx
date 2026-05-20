import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Header from "./components/layout/Header";
import Home from "./pages/Home";
import MyTrips from "./pages/MyTrips";
import TripDetail from "./pages/TripDetail";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <Header />

          <main>
            <Routes>
              <Route path="/" element={<Home />} />

              <Route path="/trips" element={<MyTrips />} />
              <Route path="/mes-voyages" element={<MyTrips />} />
              <Route path="/my-trips" element={<MyTrips />} />

              <Route path="/trip/:id" element={<TripDetail />} />
              <Route path="/voyage/:id" element={<TripDetail />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}