import { decode as decodeBase45 } from 'base45-ts';
import { inflate } from 'pako';
import { decodeAll as decodeCbor } from 'cbor-web';
import { addDays, addHours } from 'date-fns';
import {
  EUDCC,
  EUDCCData,
  EUDCCStatus,
  RawEUDCC,
  RawEUDCCData,
  ValidEUDCC,
} from '../types/DCC.schema';
import {
  getValidationRuleValue,
  ValidationRuleName,
} from '../data/validationRules';
import { TestResult } from '../data/testResults';

export interface EUDCCDataOutput {
  raw: string;
  base45?: string;
  compressed?: Uint8Array;
  cose?: Uint8Array;
  cbor?: Uint8Array;
  content?: Map<number, string | number | Map<number, RawEUDCCData>>;
  parsed: EUDCC;
}

export const extractEUDCCData = async (
  raw: string,
): Promise<EUDCCDataOutput> => {
  try {
    // Strip the HCERT protocol prefix
    const base45 = raw.slice(4);

    // Decode the base45
    const compressed = decodeBase45(base45);

    // Inflate the compressed base45 using zlib
    const cose = inflate(compressed);

    const [
      {
        value: [, , cbor],
      },
    ] = await decodeCbor(cose);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [content] = (await decodeCbor(cbor)) as [
      Map<number, string | number | Map<number, RawEUDCCData>>,
    ];
    const rawEUDCC: RawEUDCC = {
      data: (content.get(-260) as Map<number, RawEUDCCData>).get(1)!,
      country: content.get(
        1,
      ) as keyof typeof import('../data/countryCodes').default,
      createdAt: content.get(6) as number,
      expiresAt: content.get(4) as number,
    };

    return {
      raw,
      base45,
      compressed,
      cose,
      cbor,
      content,
      parsed: parseEUDCC(rawEUDCC),
    };
  } catch {
    return {
      raw,
      parsed: {
        status: EUDCCStatus.NOT_EUDCC,
      },
    };
  }
};

const parseEUDCC = ({
  data,
  createdAt,
  expiresAt,
  ...rest
}: RawEUDCC): EUDCC => {
  const partialEUDCC: Omit<ValidEUDCC, 'status'> = {
    ...rest,
    createdAt: new Date(createdAt * 1000),
    expiresAt: new Date(expiresAt * 1000),
    data: {
      version: data.ver,
      name: data.nam
        ? {
            surname: data.nam.fn,
            standardisedSurname: data.nam.fnt,
            forename: data.nam.gn,
            standardisedForename: data.nam.gnt,
          }
        : undefined,
      birthDate: data.dob ? new Date(data.dob) : undefined,
      vaccinations: data.v?.map(vaccination => ({
        agentTargeted: vaccination.tg,
        prophylaxis: vaccination.vp,
        medicinalProduct: vaccination.mp,
        manufacturer: vaccination.ma,
        doseNumber: vaccination.dn,
        totalDoses: vaccination.sd,
        date: new Date(vaccination.dt),
        country: vaccination.co,
        issuer: vaccination.is,
        uvci: vaccination.ci,
      })),
      tests: data.t?.map(test => ({
        agentTargeted: test.tg,
        type: test.tt,
        name: test.nm,
        manufacturer: test.ma,
        sampleCollectionDate: new Date(test.sc),
        result: test.tr,
        testingCentre: test.tc,
        country: test.co,
        issuer: test.is,
        uvci: test.ci,
      })),
      recoveries: data.r?.map(recovery => ({
        agentTargeted: recovery.tg,
        firstPositiveResultDate: new Date(recovery.fr),
        country: recovery.co,
        issuer: recovery.is,
        validFromDate: new Date(recovery.df),
        validUntilDate: new Date(recovery.du),
        uvci: recovery.ci,
      })),
    },
  };

  return {
    ...partialEUDCC,
    status: computeEUDCCStatus(partialEUDCC),
  };
};

const computeEUDCCStatus = (
  partialEUDCC: Omit<ValidEUDCC, 'status'>,
): EUDCCStatus => {
  if (partialEUDCC.data.vaccinations) {
    return computeEUDCCStatusFromVaccination(partialEUDCC.data.vaccinations[0]);
  }
  if (partialEUDCC.data.tests) {
    return computeEUDCCStatusFromTest(partialEUDCC.data.tests[0]);
  }
  if (partialEUDCC.data.recoveries) {
    return computeEUDCCStatusFromRecovery(partialEUDCC.data.recoveries[0]);
  }

  return EUDCCStatus.NOT_VALID;
};

const computeEUDCCStatusFromVaccination = (
  vaccination: NonNullable<EUDCCData['vaccinations']>[number],
): EUDCCStatus => {
  // Check if vaccine is present in setting list; otherwise, return not valid
  const vaccineEndDayComplete = getValidationRuleValue(
    ValidationRuleName.VACCINE_END_DAY_COMPLETE,
    vaccination.medicinalProduct,
  );

  if (!vaccineEndDayComplete) {
    return EUDCCStatus.NOT_VALID;
  }

  const now = new Date();

  if (vaccination.doseNumber < vaccination.totalDoses) {
    const vaccineStartDayNotComplete = getValidationRuleValue(
      ValidationRuleName.VACCINE_START_DAY_NOT_COMPLETE,
      vaccination.medicinalProduct,
    )!;
    const vaccineEndDayNotComplete = getValidationRuleValue(
      ValidationRuleName.VACCINE_END_DAY_NOT_COMPLETE,
      vaccination.medicinalProduct,
    )!;

    const startDate = addDays(vaccination.date, vaccineStartDayNotComplete);
    const endDate = addDays(vaccination.date, vaccineEndDayNotComplete);

    if (startDate > now) {
      return EUDCCStatus.NOT_VALID_YET;
    }

    if (now > endDate) {
      return EUDCCStatus.EXPIRED;
    }

    return EUDCCStatus.PARTIALLY_VALID;
  } else {
    const vaccineStartDayComplete = getValidationRuleValue(
      ValidationRuleName.VACCINE_START_DAY_COMPLETE,
      vaccination.medicinalProduct,
    )!;
    const vaccineEndDayComplete = getValidationRuleValue(
      ValidationRuleName.VACCINE_END_DAY_COMPLETE,
      vaccination.medicinalProduct,
    )!;

    const startDate = addDays(vaccination.date, vaccineStartDayComplete);
    const endDate = addDays(vaccination.date, vaccineEndDayComplete);

    if (startDate > now) {
      return EUDCCStatus.NOT_VALID_YET;
    }

    if (now > endDate) {
      return EUDCCStatus.EXPIRED;
    }

    return EUDCCStatus.VALID;
  }
};

const computeEUDCCStatusFromTest = (
  test: NonNullable<EUDCCData['tests']>[number],
): EUDCCStatus => {
  if (test.result == TestResult.DETECTED) {
    return EUDCCStatus.NOT_VALID;
  }

  const rapidTestStartHours = getValidationRuleValue(
    ValidationRuleName.RAPID_TEST_START_HOURS,
  )!;
  const rapidTestEndHours = getValidationRuleValue(
    ValidationRuleName.RAPID_TEST_END_HOURS,
  )!;

  const startDate = addHours(test.sampleCollectionDate, rapidTestStartHours);
  const endDate = addHours(test.sampleCollectionDate, rapidTestEndHours);

  const now = new Date();

  if (startDate > now) {
    return EUDCCStatus.NOT_VALID_YET;
  }

  if (now > endDate) {
    return EUDCCStatus.EXPIRED;
  }

  return EUDCCStatus.VALID;
};

const computeEUDCCStatusFromRecovery = (
  recovery: NonNullable<EUDCCData['recoveries']>[number],
): EUDCCStatus => {
  const now = new Date();

  if (recovery.validFromDate > now) {
    return EUDCCStatus.NOT_VALID_YET;
  }

  if (now > recovery.validUntilDate) {
    return EUDCCStatus.EXPIRED;
  }

  return EUDCCStatus.VALID;
};

export const isValidEUDCC = (eudcc: EUDCC): eudcc is ValidEUDCC =>
  [
    EUDCCStatus.NOT_VALID_YET,
    EUDCCStatus.EXPIRED,
    EUDCCStatus.VALID,
    EUDCCStatus.PARTIALLY_VALID,
  ].includes(eudcc.status);

export const eudccStatusToMessageMap: Record<EUDCCStatus, string> = {
  [EUDCCStatus.NOT_VALID]: 'Invalid certificate',
  [EUDCCStatus.NOT_VALID_YET]: 'Certificate not valid yet',
  [EUDCCStatus.EXPIRED]: 'Certificate is expired',
  [EUDCCStatus.VALID]: 'Certificate valid in Europe',
  [EUDCCStatus.PARTIALLY_VALID]: 'Certificate valid in Italy',
  [EUDCCStatus.NOT_EUDCC]: 'The QR code is not an EUDCC',
};
