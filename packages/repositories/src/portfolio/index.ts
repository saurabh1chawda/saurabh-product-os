import type { PortfolioAsset, PortfolioAssetId } from "@career-companion/career-knowledge";
import type { Repository } from "../contracts";

export type PortfolioAssetRepository = Repository<PortfolioAsset, PortfolioAssetId>;
