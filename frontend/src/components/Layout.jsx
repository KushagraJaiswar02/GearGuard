import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />
            <div className="flex-1 flex flex-col pl-16">
                <Navbar />
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
