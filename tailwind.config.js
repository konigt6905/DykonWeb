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
                },
                metal: {
                    100: '#E1E1E3',
                    200: '#C3C3C7',
                    300: '#A6A6AC',
                    400: '#888890',
                    500: '#6A6A75',
                    600: '#4D4D5A',
                    700: '#2F303F',
                    800: '#212224',
                    900: '#121417',
                }
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                pulse: {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.7 },
                },
                zap: {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.2)' },
                    '100%': { transform: 'scale(1)' },
                },
                rocket: {
                    '0%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-4px)' },
                    '100%': { transform: 'translateY(0)' },
                }
            },
            animation: {
                fadeIn: 'fadeIn 0.5s ease-in-out',
                shimmer: 'shimmer 3s ease-in-out infinite',
                float: 'float 3s ease-in-out infinite',
                pulse: 'pulse 2s ease-in-out infinite',
                zap: 'zap 0.5s ease-in-out',
                rocket: 'rocket 0.5s ease-in-out',
            },
            aspectRatio: {
                '1/1': '1 / 1',
                '16/9': '16 / 9',
                '4/3': '4 / 3',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'metal-texture': "url('/assets/images/metal-texture.jpg')",
            },
            boxShadow: {
                'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
                'glow-blue': '0 0 15px rgba(59, 130, 246, 0.5)',
                'glow-indigo': '0 0 15px rgba(99, 102, 241, 0.5)',
            }
        },
    },
    plugins: [
        // require('@tailwindcss/forms'), // Uncomment if you want enhanced form styling
        // require('@tailwindcss/aspect-ratio'), // Uncomment if you want the aspect ratio plugin (though Tailwind now has native support)
        // require('@tailwindcss/typography'), // Uncomment if you want the prose plugin for styling markdown/html content
    ],
}