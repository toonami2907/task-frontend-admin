// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ['class'],
	content: [
	  './index.html',
	  './src/**/*.{js,jsx,ts,tsx}', // Include both .js and .ts/.tsx files
	],
	theme: {
    	extend: {
    		colors: {
    			monochrome: {
    				'400': '#F2F4F6',
    				'500': '#8E8E8E',
    				'600': '#737373',
    				'700': '#FFFFFF',
    				'800': '#E4E6E8',
    				'900': '#000000'
    			},
    			accent: {
    				primary: '#FFFF00',
    				secondary: '#575756',
    				tertiary: '#FEFA17',
    				quaternary: '#D6D7D8',
    				highlight: '#E3F0FF',
    				dark: '#CFDE82',
    				warning: '#F09814',
    				muted: '#FF0EC'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			}
    		},
    		fontFamily: {
    			Inter: [
    				'Inter',
    				'sans-serif'
    			],
    			sans: [
    				'Inter',
    				'sans-serif'
    			],
    			InterMed: [
    				'Inter-Med',
    				'sans-serif'
    			],
    			InterSem: [
    				'Inter-Sem',
    				'sans-serif'
    			],
    			InterBold: [
    				'Inter-Bold',
    				'sans-serif'
    			],
    			InterSlim: [
    				'Inter-Slim',
    				'sans-serif'
    			],
    			manrope: [
    				'Manrope',
    				'sans-serif'
    			]
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		fontSize: {
    			md: '1rem'
    		},
    		screens: {
    			xs: '475px'
    		},
    		keyframes: {
    			progressBar: {
    				'0%': {
    					width: '0%'
    				},
    				'100%': {
    					width: '100%'
    				}
    			},
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			}
    		},
    		animation: {
    			'progress-bar': 'progressBar 2.5s linear forwards',
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out'
    		}
    	}
    },
  };
  