// app.json'u genişletir: web sürümü bir alt klasörde yayınlanacaksa (GitHub Pages: /Rifftown)
// EXPO_BASE_URL ile taban adres verilir. Yerelde boş bırakılır.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
