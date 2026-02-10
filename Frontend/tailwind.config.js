/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#4f46e5', // indigo-600
                    hover: '#4338ca',   // indigo-700
                },
                secondary: '#0ea5e9', // sky-500
                accent: '#f43f5e',    // rose-500
                gray: {
                    DEFAULT: '#64748b', // slate-500
                    light: '#94a3b8',   // slate-400
                    dark: '#1e293b',    // slate-800
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            }
        },
    },
    plugins: [],
}
