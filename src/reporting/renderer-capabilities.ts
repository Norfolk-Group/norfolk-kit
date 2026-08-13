import type { ReportOutputFormat } from "./report-output-theme";

export const RENDERER_FEATURES = [
  "local-font-embedding",
  "css-paged-media",
  "controlled-page-breaks",
  "repeated-table-headers",
  "vector-charts",
  "raster-charts",
  "document-links",
  "bookmarks",
  "tagged-pdf",
  "pdf-a",
  "native-docx-structure",
  "native-xlsx-numbers",
  "transparent-background",
] as const;

export type RendererFeature = (typeof RENDERER_FEATURES)[number];

export interface RendererCapabilities {
  id: string;
  execution: "client" | "server" | "plugin";
  formats: readonly ReportOutputFormat[];
  features: readonly RendererFeature[];
  fontFamilies: readonly string[];
  limits?: {
    maximumPages?: number;
    maximumInputBytes?: number;
  };
  formatProfiles?: Partial<Record<ReportOutputFormat, {
    features?: readonly RendererFeature[];
    fontFamilies?: readonly string[];
    limits?: {
      maximumPages?: number;
      maximumInputBytes?: number;
    };
  }>>;
}

export interface RendererFeatureRequirement {
  feature: RendererFeature;
  fallback?: {
    feature: RendererFeature;
    disclosure: string;
  };
}

export interface RendererJobRequirements {
  format: ReportOutputFormat;
  features: readonly RendererFeatureRequirement[];
  fontFamilies: readonly string[];
  estimatedPages?: number;
  estimatedInputBytes?: number;
}

export interface RendererNegotiation {
  rendererId: string;
  format: ReportOutputFormat;
  fallbacks: Array<{
    requested: RendererFeature;
    applied: RendererFeature;
    disclosure: string;
  }>;
}

export class UnsupportedRendererProfileError extends Error {
  readonly findings: readonly string[];

  constructor(rendererId: string, findings: readonly string[]) {
    super(`Renderer ${rendererId} cannot satisfy the requested output profile: ${findings.join(" ")}`);
    this.name = "UnsupportedRendererProfileError";
    this.findings = findings;
  }
}

export function negotiateRenderer(
  requirements: RendererJobRequirements,
  renderer: RendererCapabilities,
): RendererNegotiation {
  const findings: string[] = [];
  const formatProfile = renderer.formatProfiles?.[requirements.format];
  const supportedFeatures = new Set(formatProfile?.features ?? renderer.features);
  const supportedFonts = new Set(formatProfile?.fontFamilies ?? renderer.fontFamilies);
  const limits = { ...renderer.limits, ...formatProfile?.limits };
  const fallbacks: RendererNegotiation["fallbacks"] = [];

  if (!renderer.formats.includes(requirements.format)) {
    findings.push(`Format ${requirements.format} is not supported.`);
  }

  for (const family of requirements.fontFamilies) {
    if (!supportedFonts.has(family)) findings.push(`Font family ${family} is unavailable.`);
  }

  for (const requirement of requirements.features) {
    if (supportedFeatures.has(requirement.feature)) continue;
    if (requirement.fallback && supportedFeatures.has(requirement.fallback.feature)) {
      fallbacks.push({
        requested: requirement.feature,
        applied: requirement.fallback.feature,
        disclosure: requirement.fallback.disclosure,
      });
      continue;
    }
    findings.push(`Feature ${requirement.feature} is unavailable and has no supported fallback.`);
  }

  const maximumPages = limits.maximumPages;
  if (maximumPages !== undefined && requirements.estimatedPages !== undefined && requirements.estimatedPages > maximumPages) {
    findings.push(`Estimated page count ${requirements.estimatedPages} exceeds the ${maximumPages}-page limit.`);
  }

  const maximumInputBytes = limits.maximumInputBytes;
  if (
    maximumInputBytes !== undefined
    && requirements.estimatedInputBytes !== undefined
    && requirements.estimatedInputBytes > maximumInputBytes
  ) {
    findings.push(`Estimated input size ${requirements.estimatedInputBytes} exceeds the ${maximumInputBytes}-byte limit.`);
  }

  if (findings.length > 0) throw new UnsupportedRendererProfileError(renderer.id, findings);

  return { rendererId: renderer.id, format: requirements.format, fallbacks };
}
