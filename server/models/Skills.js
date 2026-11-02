// import { DataTypes } from 'sequelize';
// import sequelize from '../config/database.js';

// const userSkills = sequelize.define('userSkills', {
//      id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     userId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: {
//             model: 'Users',
//             key: 'id'
//         }
//     },
//     skillId: { //Skill ID To identify the skill
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: {
//             model: 'Skills',
//             key: 'id'
//         }
//     },
//     skillName: { //The name of the skill the user possess
//     type: DataTypes.STRING,
//     allowNull: true
//     },
//     skillDescription: { //Description For The Skill
//     type: DataTypes.STRING,
//     allowNull: true
//     }
// })

// export default userSkills;
