import User from '../models/User.js';
import UserProfile from '../Models/UserProfile.js';
import sequelize from '../config/database.js';
export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const profile =
            (await UserProfile.findOne({ where: { userId } })) || {};

        res.json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            bio: profile.bio || '',
            location: profile.location || '',
            career: profile.career || '',
            school: profile.school || '',
            pfp: profile.profileImageUrl || '',
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            userId: userId,
        });
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ error: 'Failed to fetch current user' });
    }
};
//Obtain All User information:
export const getAllUsers = async(req,res) => {
        try {
            const currentUser = req.userId;
            // if(!currentUser || currentUser != '1'
            // ) {
            //     return;
            // }
            let UserData =[]
                    UserData= await sequelize.query(
            `
            SELECT u.firstName, u.lastName, u.email, u.verifiedAt, u.id, u.createdAt, up.userId,up.school, up.career, up.profileImageUrl FROM dev_connect.users u
  LEFT JOIN dev_connect.userprofiles up ON u.id = up.userId;
            
            `,
            {
                type: sequelize.QueryTypes.SELECT,
            },
        );
      const FormattedData =  UserData.map((index) => ({
        firstName: index.firstName || 'First Name',
        lastName: index.lastName || 'Last Name',
        email: index.email,
        id: index.id,
        createdAt: index.createdAt,
        verifiedAt: index.verifiedAt,
        career: index.career || 'Temp',
        profileImage: index.profileImageUrl, 
        }));  

        res.json(FormattedData)
        } catch(error){
            console.log("THERE WAS AN ERROR OBTAINING USER INFORMATION", error);
        }
}