/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: '#002F34',
                secondary: '#00A49F',
                accent: '#3A77FF',
                surface: '#F5F7F8',
            }
        },
    },
    plugins: [],
}
