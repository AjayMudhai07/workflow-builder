/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        border: 'var(--border)',
        header: 'var(--header)',
        previewBackground: 'var(--preview-background)',
        previewBorder: 'var(--preview-border)',
        exportButton: 'var(--export-button)',
        exportButtonMenu: 'var(--export-button-menu)',
        exportButtonMenuHover: 'var(--export-button-menu-hover)',
      }
    },
  },
  plugins: [],
}