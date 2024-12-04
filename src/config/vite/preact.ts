import { preact } from '@preact/preset-vite';
import createConfig, {
  DefineConfigOptions,
  DefineConfigOptionsCallback,
} from './vanilla';

const createPreactConfig = async (
  options?: DefineConfigOptions | DefineConfigOptionsCallback,
) =>
  createConfig(async env => {
    const userOptions =
      (typeof options === 'function' ? await options(env) : options) || {};
    return {
      ...userOptions,
      plugins: [preact(), ...(userOptions.plugins || [])],
    };
  });

export default createPreactConfig;
