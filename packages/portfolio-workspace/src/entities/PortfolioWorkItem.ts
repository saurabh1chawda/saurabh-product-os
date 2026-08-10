import { InvalidExecutionOperationError } from "../errors/PortfolioWorkspaceDomainErrors";
import {
  PortfolioWorkItemLifecycle,
  type PortfolioWorkItemLifecycleValue
} from "../models/PortfolioWorkItemLifecycle";
import { WorkItemId } from "../value-objects/WorkItemId";

export class PortfolioWorkItem {
  private readonly __portfolioWorkItemBrand!: never;

  readonly id: WorkItemId;
  readonly lifecycle: PortfolioWorkItemLifecycleValue;

  constructor(input: {
    readonly id: WorkItemId;
    readonly lifecycle: PortfolioWorkItemLifecycleValue;
  }) {
    if (!(input.id instanceof WorkItemId)) {
      throw new InvalidExecutionOperationError();
    }
    if (!isPortfolioWorkItemLifecycle(input.lifecycle)) {
      throw new InvalidExecutionOperationError();
    }

    this.id = input.id;
    this.lifecycle = input.lifecycle;
    Object.freeze(this);
  }

  equals(other: PortfolioWorkItem | undefined): boolean {
    return other instanceof PortfolioWorkItem && this.id.equals(other.id);
  }

  toJSON(): {
    readonly id: string;
    readonly lifecycle: PortfolioWorkItemLifecycleValue;
  } {
    return {
      id: this.id.toJSON(),
      lifecycle: this.lifecycle
    };
  }
}

function isPortfolioWorkItemLifecycle(value: string): value is PortfolioWorkItemLifecycleValue {
  return Object.values(PortfolioWorkItemLifecycle).includes(value as PortfolioWorkItemLifecycleValue);
}
