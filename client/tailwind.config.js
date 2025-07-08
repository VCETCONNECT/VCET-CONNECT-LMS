import flowbitePlugin from 'flowbite/plugin';
import tailwindScrollbar from 'tailwind-scrollbar';
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue':'#0082b6',
        'secondary-blue':'#2290c1',
        'ternary-blue':'#dcedf4',
        'dark-blue': '#1a2130',
        'cream': '#F5F5F5',
        'dusk-blue': '#6A5ACD',
        'sage-green': '#8B9467',
        'earthy-brown': '#964B00',
        'powder-blue': '#B2E6CE',
        'soft-peach': '#FFD7BE',
        'dark-gray': '#333333',
        'linkedin-blue': '#2867B2', // LinkedIn Blue
        'professional-blue': '#2E4053', // Professional Blue
        'business-blue': '#1A1D23', // Business Blue
        'trust-blue': '#4567B7', // Trust Blue
        'corporate-blue': '#2F4F7F', // Corporate Blue
      },
      
    },
  },
  plugins: [
    flowbitePlugin,
    tailwindScrollbar,
  ],
};