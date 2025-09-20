import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const GeneralPreferences = sequelize.define('GeneralPreferences', {
          id: { //ID
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    userId: { //ID
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    language: { //Language Settings
    type: DataTypes.STRING,
    allowNull: false,
     defaultValue: 'English',

    }, 
    time_zone: { //Time Zone 
    type: DataTypes.STRING,
    allowNull: false
    }, 
    notifications: { //Notifications Settings
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
        sound_effects: false,
        push_notifications: false,
        email_notifications: false,
        desktop_notifications: false,
    }
},
    feed_preferences: { //Feed Preferences
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
        latest_posts: false,
        most_popular: true,
        following_only: false,
    }
},
    content_filtering: { //Content Filtering
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
        explicit_content: false,
        filter_spam: false,
        filter_profanity: false,
    }
},
})

export default GeneralPreferences;