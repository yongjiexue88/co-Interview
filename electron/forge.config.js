const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
    packagerConfig: {
        asar: true,
        extraResource: ['./src/assets/SystemAudioDump'],
        name: 'Co-Interview',
        icon: 'src/assets/logo',
        // Ad-hoc signing (free, no Apple Developer account required)
        // This allows the app to run on Apple Silicon Macs
        // Users will still need to right-click -> Open to bypass Gatekeeper
        osxSign: {
            identity: '-', // '-' means ad-hoc signing
            optionsForFile: (filePath) => {
                return {
                    entitlements: 'entitlements.plist',
                };
            },
        },
        // Notarization requires $99/year Apple Developer account
        // Uncomment if you get a Developer ID certificate later
        // osxNotarize: {
        //    appleId: 'your apple id',
        //    appleIdPassword: 'app specific password (from appleid.apple.com)',
        //    teamId: 'your team id',
        // },
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                name: 'co-interview',
                productName: 'Co-Interview',
                shortcutName: 'Co-Interview',
                createDesktopShortcut: true,
                createStartMenuShortcut: true,
            },
        },
        {
            name: '@electron-forge/maker-dmg',
            platforms: ['darwin'],
        },
        {
            name: '@reforged/maker-appimage',
            platforms: ['linux'],
            config: {
                options: {
                    name: 'Co-Interview',
                    productName: 'Co-Interview',
                    genericName: 'AI Assistant',
                    description: 'AI assistant for interviews and learning',
                    categories: ['Development', 'Education'],
                    icon: 'src/assets/logo.png'
                }
            },
        },
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-auto-unpack-natives',
            config: {},
        },
        // Fuses are used to enable/disable various Electron functionality
        // at package time, before code signing the application
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
};
