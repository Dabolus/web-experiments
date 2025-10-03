import React, { FunctionComponent } from 'react';
import PVDInfo from './PVDInfo';
import PVDConcealer from './PVDConcealer';
import PVDRevealer from './PVDRevealer';
import TechniquePage, {
  TechniquePageProps,
} from '../../../components/TechniquePage';

export type PVDRouterProps = Omit<TechniquePageProps, 'id' | 'name' | 'tabs'>;

const PVDRouter: FunctionComponent<PVDRouterProps> = props => (
  <TechniquePage
    id="pvd"
    name="Pixel Value Differencing"
    tabs={[
      {
        id: 'info',
        name: 'Info',
        component: <PVDInfo />,
      },
      {
        id: 'conceal',
        name: 'Conceal',
        component: <PVDConcealer />,
      },
      {
        id: 'reveal',
        name: 'Reveal',
        component: <PVDRevealer />,
      },
    ]}
    {...props}
  />
);

export default PVDRouter;
