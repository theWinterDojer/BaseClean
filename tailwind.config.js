/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
        "./src/shared/**/*.{js,ts,jsx,tsx}",
        "./src/features/**/*.{js,ts,jsx,tsx}",
        "./src/layout/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            borderWidth: {
                '3': '3px',
            },
            scale: {
                '102': '1.02',
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'progress': 'progress 3s ease-in-out infinite',
                'float-1': 'float1 4s ease-in-out infinite',
                'float-2': 'float2 5s ease-in-out infinite',
                'float-3': 'float3 6s ease-in-out infinite',
            },
            keyframes: {
                progress: {
                    '0%': { width: '0%' },
                    '50%': { width: '70%' },
                    '100%': { width: '100%' }
                },
                float1: {
                    '0%, 100%': { transform: 'translateY(0px) translateX(0px)', opacity: '0.3' },
                    '50%': { transform: 'translateY(-20px) translateX(10px)', opacity: '0.8' }
                },
                float2: {
                    '0%, 100%': { transform: 'translateY(0px) translateX(0px)', opacity: '0.2' },
                    '33%': { transform: 'translateY(-15px) translateX(-8px)', opacity: '0.6' },
                    '66%': { transform: 'translateY(-25px) translateX(15px)', opacity: '0.9' }
                },
                float3: {
                    '0%, 100%': { transform: 'translateY(0px) translateX(0px)', opacity: '0.4' },
                    '25%': { transform: 'translateY(-10px) translateX(12px)', opacity: '0.7' },
                    '75%': { transform: 'translateY(-30px) translateX(-5px)', opacity: '0.5' }
                }
            }
        },
    },
    plugins: [],
}