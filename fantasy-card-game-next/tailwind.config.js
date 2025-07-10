/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    safelist: [
      // Rarity Borders
      'border-gray-400', 'border-green-500', 'border-blue-500',
      'border-purple-600', 'border-yellow-500', 'border-red-600',
      // Star Colors
      'text-gray-400', 'text-green-500', 'text-blue-500',
      'text-purple-600', 'text-yellow-500', 'text-red-600',
      // Type Colors
      'bg-red-500/90', 'border-red-500', 'text-white',
      'bg-green-500/90', 'border-green-500',
      'bg-blue-500/90', 'border-blue-500',
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };
  