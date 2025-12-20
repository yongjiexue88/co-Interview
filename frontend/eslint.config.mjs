import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
    { ignores: ["dist", "node_modules"] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.{ts,tsx}"],
        plugins: {
            react,
            "react-hooks": reactHooks,
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                browser: true,
                es2021: true,
                node: true,
            },
            parserOptions: {
                project: ["./tsconfig.json"],
            },
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "react/no-unescaped-entities": "off",
            "react/prop-types": "off",
            "react-hooks/set-state-in-effect": "off",
            "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "no-console": ["warn", { "allow": ["warn", "error"] }],
        },
    },
    prettierConfig
);
