/** @type {import('tailwindcss').Config} */
import animate from 'tailwindcss-animate';

export default {
    darkMode: ['class'],
    content: [
      './index.html',
      './src/**/*.{js,jsx,ts,tsx}', // Include both .js and .ts/.tsx files
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                  light: "hsl(222, 83%, 95%)",
                  DEFAULT: "hsl(222, 83%, 53%)",
                  dark: "hsl(222, 83%, 43%)",
                },
                secondary: {
                  light: "hsl(215, 28%, 95%)",
                  DEFAULT: "hsl(215, 28%, 17%)",
                  dark: "hsl(215, 28%, 12%)",
                },
                success: {
                  light: "hsl(142, 71%, 95%)",
                  DEFAULT: "hsl(142, 71%, 45%)",
                  dark: "hsl(142, 71%, 35%)",
                },
                warning: {
                  light: "hsl(38, 92%, 95%)",
                  DEFAULT: "hsl(38, 92%, 50%)",
                  dark: "hsl(38, 92%, 40%)",
                },
                error: {
                  light: "hsl(0, 84%, 95%)",
                  DEFAULT: "hsl(0, 84%, 60%)",
                  dark: "hsl(0, 84%, 50%)",
                },
                gray: {
                  50: "hsl(210, 20%, 98%)",
                  100: "hsl(210, 20%, 96%)",
                  200: "hsl(210, 16%, 93%)",
                  300: "hsl(210, 14%, 89%)",
                  400: "hsl(210, 12%, 83%)",
                  500: "hsl(210, 11%, 71%)",
                  600: "hsl(210, 7%, 56%)",
                  700: "hsl(210, 9%, 31%)",
                  800: "hsl(210, 10%, 23%)",
                  900: "hsl(210, 11%, 15%)",
                },
                // Add these to match your CSS variables
                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",
                background: "var(--background)",
                foreground: "var(--foreground)",
                destructive: {
                  DEFAULT: "var(--destructive)",
                  foreground: "var(--destructive-foreground)",
                },
                muted: {
                  DEFAULT: "var(--muted)",
                  foreground: "var(--muted-foreground)",
                },
                accent: {
                  DEFAULT: "var(--accent)",
                  foreground: "var(--accent-foreground)",
                },
                popover: {
                  DEFAULT: "var(--popover)",
                  foreground: "var(--popover-foreground)",
                },
                card: {
                  DEFAULT: "var(--card)",
                  foreground: "var(--card-foreground)",
                },
              },
            typography: {
                DEFAULT: {
                  css: {
                    maxWidth: '65ch',
                    color: 'var(--tw-prose-body)',
                    lineHeight: '1.75'
                  }
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
                ],
                raleway: [
                    'Inter',
                    'sans-serif'
                ],
                satoshi: [
                    'Satoshi',
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
                },
                slideDown: {
                    from: {
                        opacity: '0',
                        transform: 'translateY(-10px)'
                    },
                    to: {
                        opacity: '1',
                        transform: 'translateY(0)'
                    }
                }
            },
            animation: {
                'progress-bar': 'progressBar 2.5s linear forwards',
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'slideDown': 'slideDown 0.3s ease-out'
            }
        }
    },
    plugins: [
        animate
    ]
};
