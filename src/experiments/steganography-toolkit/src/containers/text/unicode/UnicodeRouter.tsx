import React, { FunctionComponent } from 'react';
import UnicodeInfo from './UnicodeInfo';
import UnicodeConcealer from './UnicodeConcealer';
import UnicodeRevealer from './UnicodeRevealer';
import TechniquePage, {
  TechniquePageProps,
} from '../../../components/TechniquePage';

export type UnicodeRouterProps = Omit<
  TechniquePageProps,
  'id' | 'name' | 'tabs'
>;

const UnicodeRouter: FunctionComponent<UnicodeRouterProps> = props => (
  <TechniquePage
    id="unicode"
    name="Unicode"
    tabs={[
      {
        id: 'info',
        name: 'Info',
        component: <UnicodeInfo />,
      },
      {
        id: 'conceal',
        name: 'Conceal',
        component: <UnicodeConcealer />,
      },
      {
        id: 'reveal',
        name: 'Reveal',
        component: <UnicodeRevealer />,
      },
    ]}
    {...props}
  />
);

export default UnicodeRouter;
