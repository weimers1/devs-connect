import Layout from '../Layout';
import Sidebar from '../Connections/Sidebar';
import CommunityExplore from '../Communities/CommunityExplore';

const Communities = () => {
    return (
        <Layout>
            <section className="flex lg:w-2/3">
                <div className=" md:ml-15 md:w-3/4 lg:w-2/3 xl:w-6/6 ">
                <CommunityExplore />
                </div>
                <Sidebar />
            </section>
        </Layout>
    );
};

export default Communities;
