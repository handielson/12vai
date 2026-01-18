/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./contexts/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Usa classe 'dark' no elemento HTML
    theme: {
        extend: {
            colors: {
                // Cores customizadas se necessário
            },
            transitionProperty: {
                'theme': 'background-color, border-color, color, fill, stroke',
            },
        },
    },
    plugins: [],
}
