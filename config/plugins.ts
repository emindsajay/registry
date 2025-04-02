export default ({ env }) => ({
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
  },
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env("EMAIL_HOST"),
        port: env("EMAIL_PORT"),
        secure: false,
        auth: {
          user: env("EMAIL_USERNAME"),
          pass: env("EMAIL_PASSWORD"),
        },
      },
      settings: {
        defaultFrom: env("EMAIL_FROM"),
        defaultReplyTo: env("EMAIL_REPLY_TO"),
      },
    },
  },
});
