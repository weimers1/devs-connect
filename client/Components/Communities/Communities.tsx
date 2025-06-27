import Layout from '../Layout';
import Sidebar from '../Connections/Sidebar';
import CommunityExplore from '../Communities/CommunityExplore';

const Communities = () => {
    return (
        <Layout>
            <section className="flex justify-center">
                <CommunityExplore />
                <Sidebar />
            </section>
        </Layout>
    );
};

export default Communities;
