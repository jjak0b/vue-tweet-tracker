module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  devServer: {
    port: 80,
    proxy: {
      '^/api': {
        target: 'http://localhost:3000'
      }
    }
  }
}