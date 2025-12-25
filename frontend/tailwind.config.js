/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neutral: {
                    900: '#0b0b0b',
                    800: '#121212',
                    700: '#1a1a1a'
                }
            }
        },
    },
    plugins: [],
}
