export enum ValidationRuleName {
  RECOVERY_CERT_END_DAY = 'recovery_cert_end_day',
  RECOVERY_CERT_START_DAY = 'recovery_cert_start_day',
  MOLECULAR_TEST_END_HOURS = 'molecular_test_end_hours',
  MOLECULAR_TEST_START_HOURS = 'molecular_test_start_hours',
  RAPID_TEST_END_HOURS = 'rapid_test_end_hours',
  RAPID_TEST_START_HOURS = 'rapid_test_start_hours',
  VACCINE_START_DAY_NOT_COMPLETE = 'vaccine_start_day_not_complete',
  VACCINE_END_DAY_NOT_COMPLETE = 'vaccine_end_day_not_complete',
  VACCINE_START_DAY_COMPLETE = 'vaccine_start_day_complete',
  VACCINE_END_DAY_COMPLETE = 'vaccine_end_day_complete',
}

export interface ValidationRule {
  name: ValidationRuleName;
  type: string;
  value: number;
}

const validationRules: ValidationRule[] = [
  {
    name: ValidationRuleName.RECOVERY_CERT_END_DAY,
    type: 'GENERIC',
    value: 180,
  },
  {
    name: ValidationRuleName.RECOVERY_CERT_START_DAY,
    type: 'GENERIC',
    value: 0,
  },
  {
    name: ValidationRuleName.MOLECULAR_TEST_END_HOURS,
    type: 'GENERIC',
    value: 48,
  },
  {
    name: ValidationRuleName.MOLECULAR_TEST_START_HOURS,
    type: 'GENERIC',
    value: 0,
  },
  {
    name: ValidationRuleName.RAPID_TEST_END_HOURS,
    type: 'GENERIC',
    value: 48,
  },
  {
    name: ValidationRuleName.RAPID_TEST_START_HOURS,
    type: 'GENERIC',
    value: 0,
  },

  {
    name: ValidationRuleName.VACCINE_START_DAY_NOT_COMPLETE,
    type: 'EU/1/20/1528',
    value: 15,
  },
  {
    name: ValidationRuleName.VACCINE_END_DAY_NOT_COMPLETE,
    type: 'EU/1/20/1528',
    value: 42,
  },
  {
    name: ValidationRuleName.VACCINE_START_DAY_COMPLETE,
    type: 'EU/1/20/1528',
    value: 15,
  },
  {
    name: ValidationRuleName.VACCINE_END_DAY_COMPLETE,
    type: 'EU/1/20/1528',
    value: 270,
  },

  {
    name: ValidationRuleName.VACCINE_START_DAY_NOT_COMPLETE,
    type: 'EU/1/20/1507',
    value: 15,
  },
  {
    name: ValidationRuleName.VACCINE_END_DAY_NOT_COMPLETE,
    type: 'EU/1/20/1507',
    value: 42,
  },
  {
    name: ValidationRuleName.VACCINE_START_DAY_COMPLETE,
    type: 'EU/1/20/1507',
    value: 15,
  },
  {
    name: ValidationRuleName.VACCINE_END_DAY_COMPLETE,
    type: 'EU/1/20/1507',
    value: 270,
  },

  {
    name: ValidationRuleName.VACCINE_START_DAY_NOT_COMPLETE,
    type: 'EU/1/21/1529',
    value: 15,
  },
  {
    name: ValidationRuleName.VACCINE_END_DAY_NOT_COMPLETE,
    type: 'EU/1/21/1529',
    value: 84,
  },
  {
    name: ValidationRuleName.VACCINE_START_DAY_COMPLETE,
    type: 'EU/1/21/1529',
    value: 15,
  },
  {
    name: ValidationRuleName.VACCINE_END_DAY_COMPLETE,
    type: 'EU/1/21/1529',
    value: 270,
  },

  {
    name: ValidationRuleName.VACCINE_START_DAY_NOT_COMPLETE,
    type: 'EU/1/20/1525',
    value: 15,
  },
  {
    name: ValidationRuleName.VACCINE_END_DAY_NOT_COMPLETE,
    type: 'EU/1/20/1525',
    value: 270,
  },
  {
    name: ValidationRuleName.VACCINE_START_DAY_COMPLETE,
    type: 'EU/1/20/1525',
    value: 15,
  },
  {
    name: ValidationRuleName.VACCINE_END_DAY_COMPLETE,
    type: 'EU/1/20/1525',
    value: 270,
  },
];

export const getValidationRuleValue = (
  name: ValidationRuleName,
  type?: string,
): number | undefined =>
  validationRules.find(rule => {
    const nameMatches = rule.name === name;

    return typeof type === 'string'
      ? nameMatches && rule.type === type
      : nameMatches;
  })?.value;

export default validationRules;
