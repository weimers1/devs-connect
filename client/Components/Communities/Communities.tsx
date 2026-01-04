import Layout from '../Layout';
import Sidebar from '../Connections/Sidebar';
import CommunityExplore from '../Communities/CommunityExplore';
import React from 'react';

const Communities = () => {
    return (
        <Layout>
            <section className="flex w-full">
                <div className="flex-1 px-4 lg:px-8">
                    <CommunityExplore />
                </div>
                <Sidebar />
            </section>
        </Layout>
    );
};

export default Communities;
