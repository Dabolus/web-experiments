export enum TestResult {
  NOT_DETECTED = 260415000,
  DETECTED = 260373001,
}

export default {
  [TestResult.NOT_DETECTED]: 'Not detected',
  [TestResult.DETECTED]: 'Detected',
};
