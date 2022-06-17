import { NavigationError } from "../../utils/NavigationError";

export class DefaultLocaleMissingError extends NavigationError {
  constructor(message = "Default locale is required.") {
    super(message);
  }
}

export class FillNavigationError extends NavigationError {}
