import React from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const Layout = ({ children }) => {
    return (
        <div>
            <TopBar />
            <div className="app-body">
                <Sidebar />
                <div className="app-content">
                    {children}
                </div>
            </div>
            <MobileNav />
        </div>
    );
};

export default Layout;