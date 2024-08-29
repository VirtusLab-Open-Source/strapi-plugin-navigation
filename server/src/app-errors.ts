export class NavigationError<T = unknown> extends Error {
  public type = 'NavigationError';

  constructor(
    message: string,
    public additionalInfo?: T
  ) {
    super(message);
  }
}
export class FillNavigationError extends NavigationError {
  public type = 'FillNavigationError';
}

export class InvalidParamNavigationError extends NavigationError {
  public type = 'InvalidParamNavigationError';
}
