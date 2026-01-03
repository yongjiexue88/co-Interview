import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default [
    { ignores: ["dist", "node_modules", "src/assets"] },
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.browser,
                coInterview: "readonly",
            },
        },
        rules: {
            "no-console": "off",
            "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
            "no-undef": "warn",
            "no-redeclare": "warn",
            "no-cond-assign": "off",
            "no-useless-escape": "off",
            "no-prototype-builtins": "off",
            "no-control-regex": "off",
            "no-constant-binary-expression": "off",
            "no-dupe-class-members": "warn",
            "no-func-assign": "warn",
            "no-misleading-character-class": "warn",
        },
    },
    prettierConfig,
];
