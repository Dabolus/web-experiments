// This represents a 1:1 mapping with the class in the Program.cs file.
export interface ValidationError {
  description: string;
  errorType: ValidationErrorType;
  id: string;
  xPath: string;
  uri: string;
}

export const enum ValidationErrorType {
  SCHEMA,
  SEMANTIC,
  PACKAGE,
  MARKUP_COMPATIBILITY,
}
