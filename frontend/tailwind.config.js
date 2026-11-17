/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // AgriPredict AI Design System Palette
        brand: {
          forest: '#183D2B',     // Primary forest green
          deep: '#10291F',       // Deep forest
          emerald: '#21865A',    // Emerald accent
          sage: '#A8B9A5',       // Muted sage
          bg: '#F7F8F4',         // Warm background
          surface: '#FFFFFF',    // Surface
          text: '#202923',       // Primary text
          muted: '#69766E',      // Secondary text
          secondary: '#69766E',  // Alias of muted
          border: '#E5E9E3',     // Border
          subtle: '#EEF2EC',     // Subtle surface highlight
        },
        risk: {
          low: '#27865B',        // Risk Low
          medium: '#D69B35',     // Risk Medium
          high: '#D45B4C',       // Risk High
          lowBg: '#EAF5EF',
          mediumBg: '#FDF6E8',
          highBg: '#FDEEED',
        },
        primary: {
          50: '#F7F9F6',
          100: '#E9EFE9',
          200: '#D3DFD4',
          300: '#A8B9A5',
          400: '#6B8E73',
          500: '#21865A',
          600: '#183D2B',
          700: '#143324',
          800: '#10291F',
          900: '#0C2018',
        }
      },
      fontFamily: {
        // Apple SF Pro system font stack — resolves to SF Pro on iPhone/Mac,
        // Segoe UI on Windows, Roboto on Android. No download required.
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          'Arial',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          '"Cascadia Code"',
          '"Roboto Mono"',
          'monospace',
        ],
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(16, 41, 31, 0.04)',
        card: '0 1px 3px 0 rgba(16, 41, 31, 0.06), 0 1px 2px -1px rgba(16, 41, 31, 0.04)',
        elevated: '0 4px 6px -1px rgba(16, 41, 31, 0.08), 0 2px 4px -2px rgba(16, 41, 31, 0.04)',
        dropdown: '0 10px 15px -3px rgba(16, 41, 31, 0.08), 0 4px 6px -4px rgba(16, 41, 31, 0.04)',
      }
    },
  },
  plugins: [],
}
