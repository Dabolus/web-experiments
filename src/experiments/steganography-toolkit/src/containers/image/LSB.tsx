import React, { FunctionComponent } from 'react';
import LSBInfo from '../../components/image/lsb/LSBInfo';
import LSBGenerator from '../../components/image/lsb/LSBGenerator';
import LSBConcealer from '../../components/image/lsb/LSBConcealer';
import LSBRevealer from '../../components/image/lsb/LSBRevealer';
import TechniquePage, {
  TechniquePageProps,
} from '../../components/TechniquePage';

export type LSBProps = Omit<TechniquePageProps, 'id' | 'name' | 'tabs'>;

const LSB: FunctionComponent<LSBProps> = props => (
  <TechniquePage
    id="lsb"
    name="Least Significant Bit"
    tabs={[
      {
        id: 'info',
        name: 'Info',
        component: <LSBInfo />,
      },
      {
        id: 'generate',
        name: 'Generate',
        component: <LSBGenerator />,
      },
      {
        id: 'conceal',
        name: 'Conceal',
        component: <LSBConcealer />,
      },
      {
        id: 'reveal',
        name: 'Reveal',
        component: <LSBRevealer />,
      },
    ]}
    {...props}
  />
);

export default LSB;
