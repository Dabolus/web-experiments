import { preact } from '@preact/preset-vite';
import createConfig, {
  DefineConfigOptions,
  DefineConfigOptionsCallback,
} from './vanilla';

const createPreactConfig = async (
  options?: DefineConfigOptions | DefineConfigOptionsCallback,
) => {
  const userOptions =
    (typeof options === 'function' ? await options() : options) || {};
  return createConfig({
    ...userOptions,
    plugins: [preact(), ...(userOptions.plugins || [])],
  });
};

export default createPreactConfig;
