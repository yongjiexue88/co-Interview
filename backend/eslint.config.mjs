import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
        rules: {
            "no-console": "off",
            "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
        },
    },
    prettierConfig,
];
