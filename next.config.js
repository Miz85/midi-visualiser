import ReactComponentName from "react-scan/react-component-name/webpack";

/** @type {import("next").NextConfig} */
const config = {
    // Only needs to be enabled in production. 
    // If you're using Turborepo, you should disable React Component Name in development.
    webpack: (config) => {
        config.plugins.push(ReactComponentName({}));
        return config;
    },
};

export default config;