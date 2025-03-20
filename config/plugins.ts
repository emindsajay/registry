export default () => ({
  registry: {
    enabled: true,
    resolve: "./src/plugins/plugins/registry" // path to the plugin folder,
  },
  "users-permissions": {
    config: {
      jwt: {
        expiresIn: "24h"
      }
    }
  }
});
