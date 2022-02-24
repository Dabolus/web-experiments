import { basename } from 'path';

const publicPath = `/${basename(process.cwd())}/`;

export default {
  webpack(config, env, helpers, options) {
    config.output = {
      ...config.output,
      publicPath,
    };
    if (config.devServer) {
      config.devServer = {
        ...config.devServer,
        devMiddleware: {
          ...config.devServer.devMiddleware,
          publicPath,
        },
        historyApiFallback: {
          ...config.devServer.historyApiFallback,
          index: publicPath,
        },
      };
    }
  },
};
