import React, { FunctionComponent } from 'react';
import Cicada3301DyadsInfo from './Cicada3301DyadsInfo';
import Cicada3301DyadsConcealer from './Cicada3301DyadsConcealer';
import TechniquePage, {
  TechniquePageProps,
} from '../../../components/TechniquePage';

export type Cicada3301DyadsRouterProps = Omit<
  TechniquePageProps,
  'id' | 'name' | 'tabs'
>;

const Cicada3301DyadsRouter: FunctionComponent<
  Cicada3301DyadsRouterProps
> = props => (
  <TechniquePage
    id="cicada-3301-dyads"
    name="Cicada 3301 Dyads"
    tabs={[
      {
        id: 'info',
        name: 'Info',
        component: <Cicada3301DyadsInfo />,
      },
      {
        id: 'conceal',
        name: 'Conceal',
        component: <Cicada3301DyadsConcealer />,
      },
    ]}
    {...props}
  />
);

export default Cicada3301DyadsRouter;
