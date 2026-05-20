import React, { useEffect, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  const location = useLocation();

  const forceScrollTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    });

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    forceScrollTop();

    requestAnimationFrame(() => {
      forceScrollTop();

      requestAnimationFrame(() => {
        forceScrollTop();
      });
    });

    const timeout = setTimeout(() => {
      forceScrollTop();
    }, 120);

    return () => clearTimeout(timeout);
  }, [location.pathname, location.search, location.key]);

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}