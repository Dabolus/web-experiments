/**
 * Version of the schema, according to Semantic versioning (ISO, https://semver.org/ version 2.0.0 or newer)
 */
export type SchemaVersion = string;
/**
 * The surname or primary name(s) of the person addressed in the certificate
 */
export type Surname = string;
/**
 * The surname(s) of the person, transliterated ICAO 9303
 */
export type StandardisedSurname = string;
/**
 * The forename(s) of the person addressed in the certificate
 */
export type Forename = string;
/**
 * The forename(s) of the person, transliterated ICAO 9303
 */
export type StandardisedForename = string;
/**
 * Date of Birth of the person addressed in the DCC. ISO 8601 date format restricted to range 1900-2099 or empty
 */
export type DateOfBirth = string;

/**
 * Raw EU Digital Covid Certificate
 */
export interface RawEUDCCData {
  ver?: SchemaVersion;
  /**
   * Surname(s), forename(s) - in that order
   */
  nam?: {
    fn?: Surname;
    fnt: StandardisedSurname;
    gn?: Forename;
    gnt?: StandardisedForename;
  };
  dob?: DateOfBirth;
  /**
   * Vaccination Group
   */
  v?: {
    /**
     * disease or agent targeted
     */
    tg: keyof typeof import('../data/agentsTargeted').default;
    /**
     * vaccine or prophylaxis
     */
    vp: keyof typeof import('../data/prophylaxes').default;
    /**
     * vaccine medicinal product
     */
    mp: keyof typeof import('../data/medicinalProducts').default;
    /**
     * Marketing Authorization Holder - if no MAH present, then manufacturer
     */
    ma: keyof typeof import('../data/vaccineManufacturers').default;
    /**
     * Dose Number
     */
    dn: number;
    /**
     * Total Series of Doses
     */
    sd: number;
    /**
     * ISO8601 complete date: Date of Vaccination
     */
    dt: string;
    /**
     * Country of Vaccination
     */
    co: keyof typeof import('../data/countryCodes').default;
    /**
     * Certificate Issuer
     */
    is: string;
    /**
     * Unique Certificate Identifier: UVCI
     */
    ci: string;
  }[];
  /**
   * Test Group
   */
  t?: {
    /**
     * EU eHealthNetwork: Value Sets for Digital Covid Certificates. version 1.0, 2021-04-16, section 2.1
     */
    tg: keyof typeof import('../data/agentsTargeted').default;
    /**
     * Type of Test
     */
    tt: keyof typeof import('../data/testTypes').default;
    /**
     * NAA Test Name
     */
    nm?: string;
    /**
     * RAT Test name and manufacturer
     */
    ma?: keyof typeof import('../data/testManufacturers').default;
    /**
     * Date/Time of Sample Collection
     */
    sc: string;
    /**
     * Test Result
     */
    tr: keyof typeof import('../data/testResults').default;
    /**
     * Testing Centre
     */
    tc?: string;
    /**
     * Country of Test
     */
    co: keyof typeof import('../data/countryCodes').default;
    /**
     * Certificate Issuer
     */
    is: string;
    /**
     * Unique Certificate Identifier, UVCI
     */
    ci: string;
  }[];
  /**
   * Recovery Group
   */
  r?: {
    /**
     * EU eHealthNetwork: Value Sets for Digital Covid Certificates. version 1.0, 2021-04-16, section 2.1
     */
    tg: keyof typeof import('../data/agentsTargeted').default;
    /**
     * ISO 8601 complete date of first positive NAA test result
     */
    fr: string;
    /**
     * Country of Test
     */
    co: keyof typeof import('../data/countryCodes').default;
    /**
     * Certificate Issuer
     */
    is: string;
    /**
     * ISO 8601 complete date: Certificate Valid From
     */
    df: string;
    /**
     * ISO 8601 complete date: Certificate Valid Until
     */
    du: string;
    /**
     * Unique Certificate Identifier, UVCI
     */
    ci: string;
  }[];
}

/**
 * Parsed EU Digital Covid Certificate
 */
export interface EUDCCData {
  version?: SchemaVersion;
  /**
   * Surname(s), forename(s) - in that order
   */
  name?: {
    surname?: Surname;
    standardisedSurname: StandardisedSurname;
    forename?: Forename;
    standardisedForename?: StandardisedForename;
  };
  birthDate?: Date;
  /**
   * Vaccination Group
   */
  vaccinations?: {
    /**
     * disease or agent targeted
     */
    agentTargeted: keyof typeof import('../data/agentsTargeted').default;
    /**
     * vaccine or prophylaxis
     */
    prophylaxis: keyof typeof import('../data/prophylaxes').default;
    /**
     * vaccine medicinal product
     */
    medicinalProduct: keyof typeof import('../data/medicinalProducts').default;
    /**
     * Marketing Authorization Holder - if no MAH present, then manufacturer
     */
    manufacturer: keyof typeof import('../data/vaccineManufacturers').default;
    /**
     * Dose Number
     */
    doseNumber: number;
    /**
     * Total Series of Doses
     */
    totalDoses: number;
    /**
     * ISO8601 complete date: Date of Vaccination
     */
    date: Date;
    /**
     * Country of Vaccination
     */
    country: keyof typeof import('../data/countryCodes').default;
    /**
     * Certificate Issuer
     */
    issuer: string;
    /**
     * Unique Certificate Identifier: UVCI
     */
    uvci: string;
  }[];
  /**
   * Test Group
   */
  tests?: {
    /**
     * EU eHealthNetwork: Value Sets for Digital Covid Certificates. version 1.0, 2021-04-16, section 2.1
     */
    agentTargeted: keyof typeof import('../data/agentsTargeted').default;
    /**
     * Type of Test
     */
    type: keyof typeof import('../data/testTypes').default;
    /**
     * NAA Test Name
     */
    name?: string;
    /**
     * RAT Test name and manufacturer
     */
    manufacturer?: keyof typeof import('../data/testManufacturers').default;
    /**
     * Date/Time of Sample Collection
     */
    sampleCollectionDate: Date;
    /**
     * Test Result
     */
    result: keyof typeof import('../data/testResults').default;
    /**
     * Testing Centre
     */
    testingCentre?: string;
    /**
     * Country of Test
     */
    country: keyof typeof import('../data/countryCodes').default;
    /**
     * Certificate Issuer
     */
    issuer: string;
    /**
     * Unique Certificate Identifier, UVCI
     */
    uvci: string;
  }[];
  /**
   * Recovery Group
   */
  recoveries?: {
    /**
     * EU eHealthNetwork: Value Sets for Digital Covid Certificates. version 1.0, 2021-04-16, section 2.1
     */
    agentTargeted: keyof typeof import('../data/agentsTargeted').default;
    /**
     * ISO 8601 complete date of first positive NAA test result
     */
    firstPositiveResultDate: Date;
    /**
     * Country of Test
     */
    country: keyof typeof import('../data/countryCodes').default;
    /**
     * Certificate Issuer
     */
    issuer: string;
    /**
     * ISO 8601 complete date: Certificate Valid From
     */
    validFromDate: Date;
    /**
     * ISO 8601 complete date: Certificate Valid Until
     */
    validUntilDate: Date;
    /**
     * Unique Certificate Identifier, UVCI
     */
    uvci: string;
  }[];
}

export interface RawEUDCC {
  createdAt: number;
  expiresAt: number;
  country: keyof typeof import('../data/countryCodes').default;
  data: RawEUDCCData;
}

export enum EUDCCStatus {
  NOT_VALID,
  NOT_VALID_YET,
  EXPIRED,
  VALID,
  PARTIALLY_VALID,
  NOT_EUDCC,
}

export interface InvalidEUDCC {
  status: EUDCCStatus.NOT_EUDCC | EUDCCStatus.NOT_VALID;
}

export interface ValidEUDCC {
  createdAt: Date;
  expiresAt: Date;
  country: keyof typeof import('../data/countryCodes').default;
  data: EUDCCData;
  status:
    | EUDCCStatus.NOT_VALID_YET
    | EUDCCStatus.EXPIRED
    | EUDCCStatus.VALID
    | EUDCCStatus.PARTIALLY_VALID;
}

export type EUDCC = InvalidEUDCC | ValidEUDCC;
