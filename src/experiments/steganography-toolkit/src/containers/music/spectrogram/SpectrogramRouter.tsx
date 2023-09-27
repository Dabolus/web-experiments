import React, { FunctionComponent } from 'react';
import SpectrogramInfo from './SpectrogramInfo';
import SpectrogramGenerator from './SpectrogramGenerator';
import TechniquePage, {
  TechniquePageProps,
} from '../../../components/TechniquePage';

export type SpectrogramRouterProps = Omit<
  TechniquePageProps,
  'id' | 'name' | 'tabs'
>;

const SpectrogramRouter: FunctionComponent<SpectrogramRouterProps> = props => (
  <TechniquePage
    id="spectrogram"
    name="Spectrogram"
    tabs={[
      {
        id: 'info',
        name: 'Info',
        component: <SpectrogramInfo />,
      },
      {
        id: 'generate',
        name: 'Generate',
        component: <SpectrogramGenerator />,
      },
    ]}
    {...props}
  />
);

export default SpectrogramRouter;
