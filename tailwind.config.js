/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      // 確保所有動態產生的 type 顏色類別都能被正確編譯
      pattern: /(bg|ring|text)-type-(normal|grass|fire|water|electric|bug|flying|rock|poison|ground|ice|fighting|psychic|ghost|dragon|dark|steel|fairy)/,
    }
  ],
  theme: {
    extend: {
      colors: {
        type: {
          normal: '#A8A878',
          grass: '#78C850',
          fire: '#F08030',
          water: '#6890F0',
          electric: '#F8D030',
          bug: '#A8B820',
          flying: '#A890F0',
          rock: '#B8A038',
          poison: '#A040A0',
          ground: '#E0C068',
          ice: '#98D8D8',
          fighting: '#C03028',
          psychic: '#F85888',
          ghost: '#705898',
          dragon: '#7038F8',
          dark: '#705848',
          steel: '#B8B8D0',
          fairy: '#EE99AC',
        }
      }
    },
  },
  plugins: [],
}
