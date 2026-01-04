import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useCallback, useState } from 'react';
import API from "../../../Service/service";
// import { useTheme } from '../../../src/ThemeContext';

const TOGGLE_SWITCH_CLASSES =
    "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600";


interface GeneralPreferences {
    language: string, 
    time_zone: string, 
    }

const INITIAL_GENERAL_PREFERENCES: GeneralPreferences = {
    language: '',
    time_zone: '',
};


function GeneralPreferences() {
    const [openSetting, setOpenSetting] = useState<string | null>(null);
    const [GeneralPreferences, setGeneralPreferences] = useState<GeneralPreferences>(INITIAL_GENERAL_PREFERENCES);
    const [hasChanges, setHasChanges] = useState(false);
    const [loading, setLoading] = useState(false);
    const [originalData, setOriginalData] = useState<GeneralPreferences>(INITIAL_GENERAL_PREFERENCES);
    const [saveStatus, setSaveStatus] = useState('');
   
    // const { theme } = useTheme();

    const handleChange = (feild: string, value: string) => {
             setGeneralPreferences((prevProfile) => ({
                ...prevProfile,
                [feild]: value
                
            }));
            setHasChanges(true);
        }
    const handleSave = useCallback(async () => {
            setLoading(true);
            setSaveStatus('');
        try {
                const generalPreferencesData =  {
                    ...GeneralPreferences,
                    language: GeneralPreferences.language, 
                    time_zone: GeneralPreferences.time_zone,
                }

                await API.updateGeneralPreferences(generalPreferencesData);
                    setOriginalData(generalPreferencesData);
                    setSaveStatus('success');
                    setHasChanges(false);

                  setTimeout(() => setSaveStatus(''), 3000);
        } catch(error) {
            console.log("Couldn't Save general Prefreences Data", error);
            setSaveStatus('error');
        } finally {
            setLoading(false);

        }
     
    }, [GeneralPreferences]) 

    const handleSettingClick = (settingId: string) => {
        setOpenSetting(openSetting === settingId ? null : settingId);
    };
        const handleCancel = () => {
        setGeneralPreferences(originalData);
        setHasChanges(false);
    };

    const Preferences = [
        {
            id: 'language',
            name: 'Language',
            description: 'Choose your preferred language',
        },
        {
            id: 'timezone',
            name: 'Time Zone',
            description: 'Set your local time zone',
        },
        // { WILL BE IN FUTURE ITERATION
        //   id: 'notifications',
        //   name: 'Notifications',
        //   description: 'Manage notification preferences'
        // },
        // {
        //   id: 'preferred-feed',
        //   name: 'Feed Preferences',
        //   description: 'Customize your content feed'
        // },
        // {
        //   id: 'content-filtering',
        //   name: 'Content Filtering',
        //   description: 'Control what content you see'
        // }
    ];

    return (
        <div>
            <div
                id="General-Preferences"
                className={`md:w-200 w-full md:rounded-xl col-start-1 row-start-1 overflow-hidden shadow-sm border border-gray-100"  
                    // theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                `}
            >
                <div
                    className={`p-6 border-b border-gray-100 
                        // theme === 'dark' ? 'text-white' : 'text-gray-900'
                    `}
                >
                    <h2 className="text-xl font-semibold ">
                        General Preferences
                    </h2>
                    <p className="text-sm  mt-1">
                        Customize your experience and preferences
                    </p>
                </div>

                {Preferences.map((item, index) => (
                    <div key={item.id}>
                        <div
                            className={`px-6 py-4 flex justify-between items-center transition-colors cursor-pointer 
                                // theme === 'dark'
                                //     ? 'hover:bg-gray-700'
                                //     : 'hover:bg-white'
                            `}
                            onClick={() => handleSettingClick(item.id)}
                        >
                            <div
                                className={` 
                                    // theme === 'dark'
                                    //     ? 'text-white'
                                    //     : 'text-gray-900'
                                `}
                            >
                                <h3 className="font-medium ">{item.name}</h3>
                                <p className="text-sm ">{item.description}</p>
                            </div>
                            <Icon
                                icon={
                                    openSetting === item.id
                                        ? 'mdi:chevron-up'
                                        : 'mdi:chevron-down'
                                }
                                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                    openSetting === item.id ? 'rotate-180' : ''
                                }`}
                            />
                        </div>

                        {openSetting === item.id && (
                            <div
                                className={`mx-4 mb-4 rounded-lg shadow-sm border border-gray-100
                                    // theme === 'dark'
                                    //     ? 'bg-gray-800'
                                    //     : 'bg-white'
                                `}
                            >
                                <div className="p-6 space-y-4">
                                    {item.id === 'language' && (
                                        <div>
                                            <div
                                                className={` 
                                                    // theme === 'dark'
                                                    //     ? 'text-white'
                                                    //     : 'text-gray-900'
                                                `}
                                            >
                                                <label className="block text-sm font-medium mb-2">
                                                    Language
                                                </label>
                                            </div>
                                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                onChange={(e) => {
                                                          handleChange(
                                                                'language',
                                                                e.target.value
                                                            
                                                            )
                                                }}
                                            >
                                                <option value="en">
                                                    English
                                                </option>
                                                <option value="es">
                                                    Spanish
                                                </option>
                                                <option value="fr">
                                                    French
                                                </option>
                                                <option value="de">
                                                    German
                                                </option>
                                                <option value="ja">
                                                    Japanese
                                                </option>
                                                <option value="zh">
                                                    Chinese
                                                </option>
                                            </select>
                                        </div>
                                    )}

                                    {item.id === 'timezone' && (
                                        <div>
                                            <div
                                                className={` 
                                                    // theme === 'dark'
                                                    //     ? 'text-white'
                                                    //     : 'text-gray-900'
                                                `}
                                            >
                                                <label className="block text-sm font-medium mb-2">
                                                    Time Zone
                                                </label>
                                            </div>
                                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                  onChange={(e) => {
                                                          handleChange(
                                                                'time_zone',
                                                                e.target.value
                                                            )
                                                }}
                                            >
                                                <option value="UTC">
                                                    UTC (Coordinated Universal
                                                    Time)
                                                </option>
                                                <option value="EST">
                                                    EST (Eastern Standard Time)
                                                </option>
                                                <option value="CST">
                                                    CST (Central Standard Time)
                                                </option>
                                                <option value="MST">
                                                    MST (Mountain Standard Time)
                                                </option>
                                                <option value="PST">
                                                    PST (Pacific Standard Time)
                                                </option>
                                                <option value="GMT">
                                                    GMT (Greenwich Mean Time)
                                                </option>
                                                <option value="JST">
                                                    JST (Japan Standard Time)
                                                </option>
                                            </select>
                                        </div>
                                        
                                    )}
                                     <div className="flex justify-end space-x-2 space-y-0">
                                                                                    <div className="flex justify-center pt-1 bg-red-600 w-25 rounded-2xl h-8.5 hover:bg-red-500 ">
                                                                                        <button
                                                                                            className="border-gray-500"
                                                                                            onClick={() =>
                                                                                                handleCancel()
                                                                                            }
                                                                                        >
                                                                                            Cancel
                                                                                        </button>
                                                                                    </div>
                                                                                    <button
                                                                                        onClick={handleSave}
                                                                                        disabled={
                                                                                            !hasChanges || loading
                                                                                        }
                                                                                        className={`w-25 rounded-2xl font-medium transition-colors ${
                                                                                            saveStatus === 'success'
                                                                                                ? 'bg-green-600 text-white'
                                                                                                : saveStatus ===
                                                                                                  'error'
                                                                                                ? 'bg-red-600 text-white'
                                                                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                                                                        }`}
                                                                                    >
                                                                                        {' '}
                                                                                        {loading ? (
                                                                                            <>
                                                                                                <Icon
                                                                                                    icon="mdi:loading"
                                                                                                    className="animate-spin w-4 h-4 mr-2"
                                                                                                />
                                                                                                Saving...
                                                                                            </>
                                                                                        ) : saveStatus ===
                                                                                          'success' ? (
                                                                                            <>
                                                                                                <div className="flex justify-center">
                                                                                                    Saved!
                                                                                                </div>
                                                                                            </>
                                                                                        ) : saveStatus ===
                                                                                          'error' ? (
                                                                                            <>
                                                                                                <Icon
                                                                                                    icon="mdi:alert"
                                                                                                    className="w-4 h-4 mr-2"
                                                                                                />
                                                                                                Error
                                                                                            </>
                                                                                        ) : (
                                                                                            'Save'
                                                                                        )}
                                                                                    </button>
                                                                                </div>

                                    {item.id === 'notifications' && (
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                Notification Settings
                                            </h3>
                                            {[
                                                {
                                                    id: 'sound',
                                                    label: 'Sound effects',
                                                    description:
                                                        'Play sounds for interactions',
                                                },
                                                {
                                                    id: 'push',
                                                    label: 'Push notifications',
                                                    description:
                                                        'Receive push notifications',
                                                },
                                                {
                                                    id: 'email',
                                                    label: 'Email notifications',
                                                    description:
                                                        'Get updates via email',
                                                },
                                                {
                                                    id: 'desktop',
                                                    label: 'Desktop notifications',
                                                    description:
                                                        'Show desktop notifications',
                                                },
                                            ].map((setting) => (
                                                <div
                                                    key={setting.id}
                                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                                                >
                                                    <div
                                                        className={` 
                                                            // theme === 'dark'
                                                            //     ? 'text-white'
                                                            //     : 'text-gray-900'
                                                        `}
                                                    >
                                                        <div className="font-medium">
                                                            {setting.label}
                                                        </div>
                                                        <div className="text-sm ">
                                                            {
                                                                setting.description
                                                            }
                                                        </div>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            defaultChecked={
                                                                setting.id ===
                                                                'sound'
                                                            }
                                                        />
                                                        <div
                                                            className={
                                                                TOGGLE_SWITCH_CLASSES
                                                            }
                                                        ></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {item.id === 'preferred-feed' && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                                Default Feed View
                                            </h3>
                                            <div className="space-y-3">
                                                {[
                                                    {
                                                        value: 'latest',
                                                        label: 'Latest Posts',
                                                        description:
                                                            'Show newest posts first',
                                                    },
                                                    {
                                                        value: 'popular',
                                                        label: 'Most Popular',
                                                        description:
                                                            'Show trending and popular content',
                                                    },
                                                    {
                                                        value: 'following',
                                                        label: 'Following Only',
                                                        description:
                                                            'Only show posts from people you follow',
                                                    },
                                                ].map((option) => (
                                                    <div
                                                        className={` 
                                                            // theme === 'dark'
                                                            //     ? 'hover:bg-gray-600'
                                                            //     : 'hover:bg-gray-50'
                                                        `}
                                                    >
                                                        <label
                                                            key={option.value}
                                                            className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg  cursor-pointer"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="feed"
                                                                value={
                                                                    option.value
                                                                }
                                                                className="w-4 h-4 text-blue-600"
                                                                defaultChecked={
                                                                    option.value ===
                                                                    'latest'
                                                                }
                                                            />
                                                            <div
                                                                className={` 
                                                                    // theme ===
                                                                    // 'dark'
                                                                    //     ? 'text-white'
                                                                    //     : 'text-gray-900'
                                                                `}
                                                            >
                                                                <div className="font-medium ">
                                                                    {
                                                                        option.label
                                                                    }
                                                                </div>
                                                                <div className="text-sm ">
                                                                    {
                                                                        option.description
                                                                    }
                                                                </div>
                                                            </div>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {item.id === 'content-filtering' && (
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                Content Filters
                                            </h3>
                                            {[
                                                {
                                                    id: 'nsfw',
                                                    label: 'Hide NSFW content',
                                                    description:
                                                        'Filter out not-safe-for-work content',
                                                    defaultChecked: true,
                                                },
                                                {
                                                    id: 'spam',
                                                    label: 'Filter spam',
                                                    description:
                                                        'Automatically hide spam content',
                                                    defaultChecked: true,
                                                },
                                                {
                                                    id: 'profanity',
                                                    label: 'Filter profanity',
                                                    description:
                                                        'Hide posts with strong language',
                                                    defaultChecked: false,
                                                },
                                            ].map((filter) => (
                                                <div
                                                    key={filter.id}
                                                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                                                >
                                                    <div
                                                        className={` 
                                                            // theme === 'dark'
                                                            //     ? 'text-white'
                                                            //     : 'text-gray-900'
                                                    `}
                                                    >
                                                        <div className="font-medium ">
                                                            {filter.label}
                                                        </div>
                                                        <div className="text-sm ">
                                                            {filter.description}
                                                        </div>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            defaultChecked={
                                                                filter.defaultChecked
                                                            }
                                                        />
                                                        <div className={TOGGLE_SWITCH_CLASSES}></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {index !== Preferences.length - 1 && (
                            <hr className="border-gray-100" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GeneralPreferences;
function setSaveStatus(arg0: string) {
    throw new Error('Function not implemented.');
}

