/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./*.html", // Scan root HTML files
        "./partials/**/*.html", // Scan HTML files in partials folder
        "./assets/js/**/*.js" // Scan JS files if they manipulate classes
    ],
    darkMode: 'class', // or 'media' if you prefer OS setting
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                neutral: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#e5e5e5',
                    300: '#d4d4d4',
                    400: '#a3a3a3',
                    500: '#737373',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717',
                    950: '#0a0a0a'
                },
                blue: {
                    400: '#60A5FA',
                    500: '#3B82F6',
                    600: '#2563EB',
                    700: '#1D4ED8',
                },
                indigo: {
                    200: '#C7D2FE',
                    500: '#6366F1',
                    600: '#4F46E5',
                    700: '#4338CA',
                    800: '#3730A3',
                    900: '#312E81'
                }
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
            animation: {
                fadeIn: 'fadeIn 0.5s ease-in-out',
            },
            // Add aspect ratio directly if needed, though native support is good
            aspectRatio: {
                '1/1': '1 / 1',
            }
        },
    },
    plugins: [
        // require('@tailwindcss/forms'), // Uncomment if you want enhanced form styling
        // require('@tailwindcss/aspect-ratio'), // Uncomment if you want the aspect ratio plugin (though Tailwind now has native support)
        // require('@tailwindcss/typography'), // Uncomment if you want the prose plugin for styling markdown/html content
    ],
}