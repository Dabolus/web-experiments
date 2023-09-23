import React, { FunctionComponent } from 'react';
import SpectrogramInfo from '../../components/music/spectrogram/SpectrogramInfo';
import SpectrogramGenerator from '../../components/music/spectrogram/SpectrogramGenerator';
import TechniquePage, {
  TechniquePageProps,
} from '../../components/TechniquePage';

export type SpectrogramProps = Omit<TechniquePageProps, 'id' | 'name' | 'tabs'>;

const Spectrogram: FunctionComponent<SpectrogramProps> = props => (
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

export default Spectrogram;
