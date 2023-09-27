import React, { FunctionComponent } from 'react';
import LSBInfo from './LSBInfo';
import LSBGenerator from './LSBGenerator';
import LSBConcealer from './LSBConcealer';
import LSBRevealer from './LSBRevealer';
import TechniquePage, {
  TechniquePageProps,
} from '../../../components/TechniquePage';

export type LSBRouterProps = Omit<TechniquePageProps, 'id' | 'name' | 'tabs'>;

const LSBRouter: FunctionComponent<LSBRouterProps> = props => (
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

export default LSBRouter;
