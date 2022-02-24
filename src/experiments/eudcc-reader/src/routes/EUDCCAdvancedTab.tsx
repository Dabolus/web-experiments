import { FunctionalComponent, h, Fragment, ComponentChildren } from 'preact';
import { useMemo } from 'preact/hooks';
import countryCodes from '../data/countryCodes';
import agentsTargeted from '../data/agentsTargeted';
import prophylaxes from '../data/prophylaxes';
import medicinalProducts from '../data/medicinalProducts';
import vaccineManufacturers from '../data/vaccineManufacturers';
import testTypes from '../data/testTypes';
import testManufacturers from '../data/testManufacturers';
import testResults from '../data/testResults';
import { ValidEUDCC } from '../types/DCC.schema';
import { eudccStatusToMessageMap } from '../utils/extractor';
import { formatDate } from '../utils/helpers';
import classes from './EUDCCAdvancedTab.module.scss';

export interface EUDCCAdvancedTabProps {
  value: ValidEUDCC;
}

interface Section {
  condition?(value: ValidEUDCC): boolean;
  fields: Record<string, (eudcc: ValidEUDCC) => ComponentChildren>;
}

/* eslint-disable @typescript-eslint/explicit-function-return-type */
const sections: Record<string, Section> = {
  Holder: {
    fields: {
      Name: eudcc => eudcc.data.name?.forename,
      'Standardized name': eudcc => eudcc.data.name?.standardisedForename,
      Surname: eudcc => eudcc.data.name?.surname,
      'Standardized surname': eudcc => eudcc.data.name?.standardisedSurname,
      'Birth date': eudcc => formatDate(eudcc.data.birthDate),
    },
  },
  'QR Code': {
    fields: {
      'Issuer country': eudcc => countryCodes[eudcc.country],
      'Generation date': eudcc => formatDate(eudcc.createdAt),
      'Expiration date': eudcc => formatDate(eudcc.expiresAt),
      Version: eudcc => eudcc.data.version,
      Validity: eudcc => eudccStatusToMessageMap[eudcc.status],
    },
  },
  Vaccination: {
    condition: eudcc => (eudcc.data.vaccinations?.length || 0) > 0,
    fields: {
      'Agent targeted': ({ data: { vaccinations: [vaccination] = [] } }) =>
        agentsTargeted[vaccination.agentTargeted],
      Prophylaxis: ({ data: { vaccinations: [vaccination] = [] } }) =>
        prophylaxes[vaccination.prophylaxis],
      'Medicinal product': ({ data: { vaccinations: [vaccination] = [] } }) =>
        medicinalProducts[vaccination.medicinalProduct],
      Manufacturer: ({ data: { vaccinations: [vaccination] = [] } }) =>
        vaccineManufacturers[vaccination.manufacturer],
      Doses: ({ data: { vaccinations: [vaccination] = [] } }) =>
        `${vaccination.doseNumber}/${vaccination.totalDoses}`,
      'Vaccination date': ({ data: { vaccinations: [vaccination] = [] } }) =>
        formatDate(vaccination.date),
      'Vaccination country': ({ data: { vaccinations: [vaccination] = [] } }) =>
        countryCodes[vaccination.country],
      Issuer: ({ data: { vaccinations: [vaccination] = [] } }) =>
        vaccination.issuer,
      UVCI: ({ data: { vaccinations: [vaccination] = [] } }) =>
        vaccination.uvci,
    },
  },
  Test: {
    condition: eudcc => (eudcc.data.tests?.length || 0) > 0,
    fields: {
      'Agent targeted': ({ data: { tests: [test] = [] } }) =>
        agentsTargeted[test.agentTargeted],
      Type: ({ data: { tests: [test] = [] } }) => testTypes[test.type],
      Name: ({ data: { tests: [test] = [] } }) => test.name,
      Manufacturer: ({ data: { tests: [test] = [] } }) =>
        test.manufacturer ? testManufacturers[test.manufacturer] : undefined,
      'Sample collection date': ({ data: { tests: [test] = [] } }) =>
        formatDate(test.sampleCollectionDate),
      Result: ({ data: { tests: [test] = [] } }) => testResults[test.result],
      'Testing center': ({ data: { tests: [test] = [] } }) =>
        test.testingCentre,
      'Test country': ({ data: { tests: [test] = [] } }) =>
        countryCodes[test.country],
      Issuer: ({ data: { tests: [test] = [] } }) => test.issuer,
      UVCI: ({ data: { tests: [test] = [] } }) => test.uvci,
    },
  },
  Recovery: {
    condition: eudcc => (eudcc.data.recoveries?.length || 0) > 0,
    fields: {
      'Agent targeted': ({ data: { recoveries: [recovery] = [] } }) =>
        agentsTargeted[recovery.agentTargeted],
      'First positive result date': ({
        data: { recoveries: [recovery] = [] },
      }) => formatDate(recovery.firstPositiveResultDate),
      'Recovery country': ({ data: { recoveries: [recovery] = [] } }) =>
        countryCodes[recovery.country],
      Issuer: ({ data: { recoveries: [recovery] = [] } }) => recovery.issuer,
      'Valid from': ({ data: { recoveries: [recovery] = [] } }) =>
        formatDate(recovery.validFromDate),
      'Valid until': ({ data: { recoveries: [recovery] = [] } }) =>
        formatDate(recovery.validUntilDate),
      UVCI: ({ data: { recoveries: [recovery] = [] } }) => recovery.uvci,
    },
  },
};
/* eslint-enable @typescript-eslint/explicit-function-return-type */

const EUDCCAdvancedTab: FunctionalComponent<EUDCCAdvancedTabProps> = ({
  value,
}) => {
  const sectionsMarkup = useMemo(
    () =>
      Object.entries(sections).map(([name, { condition, fields }]) =>
        condition?.(value) ?? true ? (
          <Fragment key={name}>
            <h2>{name}</h2>
            {Object.entries(fields).map(([label, get]) => {
              const id = label.toLowerCase().replace(/\s+/g, '-');
              return (
                <Fragment key={`${name}-${id}`}>
                  <label id={`${id}-label`}>{label}</label>
                  <span aria-labelledby={`${id}-label`}>
                    {get(value) ?? '-'}
                  </span>
                </Fragment>
              );
            })}
          </Fragment>
        ) : null,
      ),
    [value],
  );

  return <div className={classes.list}>{sectionsMarkup}</div>;
};
export default EUDCCAdvancedTab;
