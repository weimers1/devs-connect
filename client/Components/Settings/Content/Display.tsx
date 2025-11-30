// import React, { useState, useEffect, useCallback } from 'react';
// import { Icon } from '@iconify/react/dist/iconify.js';
// import API from '../../../Service/service';
// // import { useTheme } from '../../../src/ThemeContext';

// const DISPLAY_OPTIONS = [
//     {
//         id: 'appearance',
//         name: 'Appearance',
//         description: 'Theme and visual preferences',
//     },
// ];

// function Display() {
//     // const { theme, setTheme } = useTheme();
//     const [openSetting, setOpenSetting] = useState<string | null>(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, seterror] = useState();
//     const [settings, setSettings] = useState({
//         // theme: theme,
//         font_size: 'medium',
//     });

//     const handleThemeChange = useCallback(
//         // async (newTheme) => {
//         //     const newSettings = {
//         //         theme: newTheme,
//         //         font_size: settings.font_size,
//         //     };

//             // setSettings(newSettings);
//             // setTheme(newTheme);

//             setIsLoading(true);
//             try {
//                 await API.updateDisplaySettings(newSettings);
//             } catch (error) {
//                 seterror(error);
//             } finally {
//                 setIsLoading(false);
//             }
//         },
//         [settings.font_size, setTheme]
//     );

//     //Handle Font Size Change
//     const handleFontChange = async (newSize) => {
//         const newFontSize = {
//             theme: settings.theme,
//             font_size: newSize,
//         };
//         setSettings(newFontSize); //Changing the state
//         setIsLoading(true);
//         try {
//             await API.updateDisplaySettings(newFontSize);
//         } catch (error) {
//             seterror(error);
//         } finally {
//             setIsLoading(false);
//         }
//     };
//     //Load the Users current Settings
//     useEffect(() => {
//         const fetchSettings = async () => {
//             setIsLoading(true);
//             try {
//                 const response = await API.getDisplaySettings();
//                 setSettings(response);
//             } catch (error) {
//                 seterror(error);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchSettings();
//     }, []);

//     const handleSettingClick = (settingId: string) => {
//         setOpenSetting(openSetting === settingId ? null : settingId);
//     };

//     return (
//         <div>
//             <div
//                 className={`md:w-200 w-full md:rounded-xl col-start-1 row-start-1 overflow-hidden shadow-sm border border-gray-100" id="Display ${
//                     theme === 'dark' ? 'bg-gray-900' : 'bg-white'
//                 }`}
//             >
//                 <div
//                     className={`p-6 border-b border-gray-100 ${
//                         theme === 'dark' ? 'text-white' : 'text-gray-900'
//                     }`}
//                 >
//                     <h2 className="text-xl font-semibold ">Display Settings</h2>
//                     <p className="text-sm  mt-1">
//                         Customize your visual experience
//                     </p>
//                 </div>

//                 {DISPLAY_OPTIONS.map((option, index) => (
//                     <div key={option.id}>
//                         <div
//                             className={`px-6 py-4 flex justify-between items-center transition-colors cursor-pointer ${
//                                 theme === 'dark'
//                                     ? 'hover:bg-gray-700'
//                                     : 'hover:bg-white'
//                             }`}
//                             onClick={() => handleSettingClick(option.id)}
//                         >
//                             <div
//                                 className={` ${
//                                     theme === 'dark'
//                                         ? 'text-white'
//                                         : 'text-gray-900'
//                                 }`}
//                             >
//                                 <h3 className="font-medium ">{option.name}</h3>
//                                 <p className="text-sm ">{option.description}</p>
//                             </div>
//                             <Icon
//                                 icon={
//                                     openSetting === option.id
//                                         ? 'mdi:chevron-up'
//                                         : 'mdi:chevron-down'
//                                 }
//                                 className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
//                                     openSetting === option.id
//                                         ? 'rotate-180'
//                                         : ''
//                                 }`}
//                             />
//                         </div>

//                         {openSetting === option.id && (
//                             <div
//                                 className={`mx-4 mb-4 rounded-lg shadow-sm border border-gray-100 ${
//                                     theme === 'dark'
//                                         ? 'bg-gray-900'
//                                         : 'bg-white'
//                                 }`}
//                             >
//                                 <div className="p-6 space-y-4">
//                                     {option.id === 'appearance' && (
//                                         <>
//                                             <div>
//                                                 <div
//                                                     className={` ${
//                                                         theme === 'dark'
//                                                             ? 'text-white'
//                                                             : 'text-gray-900'
//                                                     }`}
//                                                 >
//                                                     <h3 className="text-sm font-semibold mb-3">
//                                                         Theme
//                                                     </h3>
//                                                 </div>
//                                                 <div className="grid grid-cols-2 gap-3">
//                                                     <button
//                                                         onClick={() =>
//                                                             handleThemeChange(
//                                                                 'light'
//                                                             )
//                                                         }
//                                                         className={`flex items-center justify-center px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
//                                                             theme === 'light'
//                                                                 ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
//                                                                 : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
//                                                         }`}
//                                                     >
//                                                         <Icon
//                                                             icon="mdi:white-balance-sunny"
//                                                             className="w-5 h-5 mr-2"
//                                                         />
//                                                         <span className="font-medium">
//                                                             Light
//                                                         </span>
//                                                     </button>

//                                                     <button
//                                                         onClick={() =>
//                                                             handleThemeChange(
//                                                                 'dark'
//                                                             )
//                                                         } //Handle Theme Change Toggle
//                                                         className={`flex items-center justify-center px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
//                                                             theme === 'dark'
//                                                                 ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
//                                                                 : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
//                                                         }`}
//                                                     >
//                                                         <Icon
//                                                             icon="mdi:moon-waning-crescent"
//                                                             className="w-5 h-5 mr-2"
//                                                         />
//                                                         <span className="font-medium">
//                                                             Dark
//                                                         </span>
//                                                     </button>
//                                                 </div>
//                                             </div>

//                                             <div>
//                                                 <div
//                                                     className={` ${
//                                                         theme === 'dark'
//                                                             ? 'text-white'
//                                                             : 'text-gray-900'
//                                                     }`}
//                                                 >
//                                                     <h3 className="text-sm font-semibold  mb-3">
//                                                         Font Size
//                                                     </h3>
//                                                 </div>
//                                                 <div className="grid grid-cols-3 gap-3">
//                                                     {(
//                                                         [
//                                                             'small',
//                                                             'medium',
//                                                             'large',
//                                                         ] as const
//                                                     ).map((size) => (
//                                                         <button
//                                                             key={size}
//                                                             onClick={() =>
//                                                                 handleFontChange(
//                                                                     size
//                                                                 )
//                                                             } //Changes the fontsize
//                                                             className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 capitalize font-medium ${
//                                                                 settings.font_size ===
//                                                                 size
//                                                                     ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
//                                                                     : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
//                                                             }`}
//                                                         >
//                                                             {size}
//                                                         </button>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                         </>
//                                     )}
//                                 </div>
//                             </div>
//                         )}

//                         {index !== DISPLAY_OPTIONS.length - 1 && (
//                             <hr className="border-gray-100" />
//                         )}
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }

// export default Display;
