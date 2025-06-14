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
                'orbit-small': 'orbit-small 12s linear infinite',
                'orbit-medium': 'orbit-medium 12s linear infinite',
                'orbit-large': 'orbit-large 12s linear infinite',
                'wavy-scan-1': 'wavy-scan-balanced 8s ease-in-out infinite',
                'wavy-scan-2': 'wavy-scan-balanced 10s ease-in-out infinite',
                'wavy-scan-3': 'wavy-scan-balanced 12s ease-in-out infinite',
                'wavy-scan-4': 'wavy-scan-balanced 9s ease-in-out infinite',
                'wave-flow-1': 'wave-flow-balanced 6s ease-in-out infinite',
                'wave-flow-2': 'wave-flow-balanced 7s ease-in-out infinite',
                'wave-flow-3': 'wave-flow-balanced 8s ease-in-out infinite',
                'wave-flow-4': 'wave-flow-balanced 6.5s ease-in-out infinite',
                'analysis-line-1': 'analysis-line-balanced 12s ease-in-out infinite',
                'analysis-line-2': 'analysis-line-balanced 14s ease-in-out infinite',
                'analysis-line-3': 'analysis-line-balanced 16s ease-in-out infinite',
                'pulse-gentle': 'pulse-gentle 10s ease-in-out infinite',
                'progress': 'progress 3s ease-in-out infinite',
            },
            keyframes: {
                progress: {
                    '0%': { width: '0%' },
                    '50%': { width: '70%' },
                    '100%': { width: '100%' }
                },
                'spin-reverse': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(-360deg)' }
                },
                'orbit-small': {
                    '0%': { transform: 'rotate(0deg) translateX(60px) rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg) translateX(60px) rotate(-360deg)' }
                },
                'orbit-medium': {
                    '0%': { transform: 'rotate(0deg) translateX(80px) rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg) translateX(80px) rotate(-360deg)' }
                },
                'orbit-large': {
                    '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' }
                },
                'wavy-scan-balanced': {
                    '0%': { 
                        transform: 'translateX(-130%) scaleY(0.7)',
                        opacity: '0'
                    },
                    '50%': { 
                        transform: 'translateX(0%) scaleY(1.4)',
                        opacity: '0.6'
                    },
                    '100%': { 
                        transform: 'translateX(130%) scaleY(0.7)',
                        opacity: '0'
                    }
                },
                'wave-flow-balanced': {
                    '0%, 100%': { 
                        transform: 'translateY(0px)',
                        filter: 'hue-rotate(0deg)',
                        opacity: '0.4'
                    },
                    '25%': { 
                        transform: 'translateY(-2px)',
                        filter: 'hue-rotate(15deg)',
                        opacity: '0.6'
                    },
                    '50%': { 
                        transform: 'translateY(0px)',
                        filter: 'hue-rotate(30deg)',
                        opacity: '0.7'
                    },
                    '75%': { 
                        transform: 'translateY(2px)',
                        filter: 'hue-rotate(15deg)',
                        opacity: '0.6'
                    }
                },
                'analysis-line-balanced': {
                    '0%, 100%': { 
                        opacity: '0.1',
                        transform: 'scaleY(0.8)'
                    },
                    '50%': { 
                        opacity: '0.25',
                        transform: 'scaleY(1.3)'
                    }
                },
                'pulse-gentle': {
                    '0%, 100%': { 
                        transform: 'scale(1)',
                        opacity: '0.2'
                    },
                    '50%': { 
                        transform: 'scale(1.8)',
                        opacity: '0.1'
                    }
                }
            }
        },
    },
    plugins: [],
}