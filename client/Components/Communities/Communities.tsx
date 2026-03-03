import Layout from '../Layout';
import Sidebar from '../Connections/Sidebar';
import CommunityExplore from '../Communities/CommunityExplore';
import React from 'react';
import {UserConnectionContextProvider} from "../Connections/UserConnectionContext.tsx";

const Communities = () => {
    return (
        <Layout>
            <UserConnectionContextProvider>
           
            <section className="flex w-full">
                <div className="flex-1 px-4 lg:px-8">
                    <CommunityExplore />
                </div>
                <Sidebar />
            </section>
             </UserConnectionContextProvider>
        </Layout>
    );
};

export default Communities;
