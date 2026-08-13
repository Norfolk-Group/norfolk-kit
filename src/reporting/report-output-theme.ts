export const REPORT_OUTPUT_FORMATS = ["html", "pdf", "xlsx", "csv", "png", "pptx"] as const;

export type ReportOutputFormat = (typeof REPORT_OUTPUT_FORMATS)[number];

export interface ReportFontRole {
  family: string;
  fallbacks: readonly string[];
  weights: readonly number[];
  minimumPointSize: number;
  preferredPointSize: number;
  numericFeatures?: readonly string[];
}

export interface ReportOutputTheme {
  id: string;
  version: number;
  name: string;
  supportedFormats: readonly ReportOutputFormat[];
  fontAssets: readonly {
    family: string;
    packageName: string;
    packageVersion: string;
    weights: readonly number[];
  }[];
  typography: {
    narrative: ReportFontRole;
    denseLabel: ReportFontRole;
    denseNumeric: ReportFontRole;
    fixedWidthNumeric: ReportFontRole;
    note: ReportFontRole;
    chartLabel: ReportFontRole;
  };
  palette: {
    paper: string;
    ink: string;
    mutedInk: string;
    rule: string;
    subtleFill: string;
    strongFill: string;
    accents: readonly string[];
  };
  financialTable: {
    labelColumnPercent: number;
    numericAlignment: "right";
    repeatHeaderRows: boolean;
    negativeStyle: "accounting-parentheses";
    zeroStyle: "em-dash";
    verticalRules: "none";
    keepTotalsWithPreviousRow: boolean;
  };
  chart: {
    fullPagePaddingMm: { horizontal: number; top: number; bottom: number };
    inlinePaddingMm: number;
    maximumPlotAreaPercent: number;
    gridlines: "major-only";
    requireNonColorEncoding: boolean;
    allowThreeDimensionalEffects: false;
  };
  graphics: {
    minimumPrintDpi: number;
    preferVector: boolean;
    allowDecorativeCharts: false;
    requireCaptionOrTextAlternative: boolean;
  };
}

export interface ReportOutputThemeBinding {
  screenThemeId: string;
  reportThemeId: string;
  formats?: readonly ReportOutputFormat[];
}

export interface ReportOutputThemeRegistry {
  version: number;
  defaultThemeId: string;
  themes: readonly ReportOutputTheme[];
  bindings: readonly ReportOutputThemeBinding[];
}

export interface ReportOutputThemeRequest {
  format: ReportOutputFormat;
  requestedReportThemeId?: string;
  screenThemeId?: string;
}

export interface ResolvedReportOutputTheme {
  theme: ReportOutputTheme;
  registryVersion: number;
  source: "explicit-report-theme" | "screen-theme-binding" | "default-report-theme";
  screenThemeId?: string;
  disclosure?: string;
}

export class ReportOutputThemeResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportOutputThemeResolutionError";
  }
}

const TABULAR_NUMERIC_FEATURES = ["tabular-nums", "lining-nums"] as const;

export const norfolkFinancialMonochromeTheme = {
  id: "norfolk-financial-monochrome",
  version: 1,
  name: "Norfolk Financial Monochrome",
  supportedFormats: REPORT_OUTPUT_FORMATS,
  fontAssets: [
    { family: "Inter", packageName: "@fontsource/inter", packageVersion: "5.3.0", weights: [400, 500, 600] },
    {
      family: "IBM Plex Sans Condensed",
      packageName: "@fontsource/ibm-plex-sans-condensed",
      packageVersion: "5.3.0",
      weights: [400, 500, 600],
    },
    {
      family: "IBM Plex Mono",
      packageName: "@fontsource/ibm-plex-mono",
      packageVersion: "5.3.0",
      weights: [400, 500],
    },
  ],
  typography: {
    narrative: {
      family: "Inter",
      fallbacks: ["Arial", "sans-serif"],
      weights: [400, 500, 600],
      minimumPointSize: 10,
      preferredPointSize: 10.5,
    },
    denseLabel: {
      family: "IBM Plex Sans Condensed",
      fallbacks: ["Arial Narrow", "Arial", "sans-serif"],
      weights: [400, 500, 600],
      minimumPointSize: 10,
      preferredPointSize: 10.5,
    },
    denseNumeric: {
      family: "IBM Plex Sans Condensed",
      fallbacks: ["Arial Narrow", "Arial", "sans-serif"],
      weights: [400, 500, 600],
      minimumPointSize: 10,
      preferredPointSize: 10.5,
      numericFeatures: TABULAR_NUMERIC_FEATURES,
    },
    fixedWidthNumeric: {
      family: "IBM Plex Mono",
      fallbacks: ["Consolas", "monospace"],
      weights: [400, 500],
      minimumPointSize: 10,
      preferredPointSize: 10,
      numericFeatures: TABULAR_NUMERIC_FEATURES,
    },
    note: {
      family: "Inter",
      fallbacks: ["Arial", "sans-serif"],
      weights: [400, 500],
      minimumPointSize: 9,
      preferredPointSize: 9,
    },
    chartLabel: {
      family: "IBM Plex Sans Condensed",
      fallbacks: ["Arial Narrow", "Arial", "sans-serif"],
      weights: [400, 500],
      minimumPointSize: 9.5,
      preferredPointSize: 10,
      numericFeatures: TABULAR_NUMERIC_FEATURES,
    },
  },
  palette: {
    paper: "#ffffff",
    ink: "#171717",
    mutedInk: "#5b5b5b",
    rule: "#c8c8c8",
    subtleFill: "#f2f2f0",
    strongFill: "#252525",
    accents: ["#28756b", "#315c78", "#a57529", "#934e42", "#675a83"],
  },
  financialTable: {
    labelColumnPercent: 38,
    numericAlignment: "right",
    repeatHeaderRows: true,
    negativeStyle: "accounting-parentheses",
    zeroStyle: "em-dash",
    verticalRules: "none",
    keepTotalsWithPreviousRow: true,
  },
  chart: {
    fullPagePaddingMm: { horizontal: 26, top: 18, bottom: 22 },
    inlinePaddingMm: 16,
    maximumPlotAreaPercent: 74,
    gridlines: "major-only",
    requireNonColorEncoding: true,
    allowThreeDimensionalEffects: false,
  },
  graphics: {
    minimumPrintDpi: 300,
    preferVector: true,
    allowDecorativeCharts: false,
    requireCaptionOrTextAlternative: true,
  },
} as const satisfies ReportOutputTheme;

export const norfolkReportOutputThemeRegistry: ReportOutputThemeRegistry = {
  version: 1,
  defaultThemeId: norfolkFinancialMonochromeTheme.id,
  themes: [norfolkFinancialMonochromeTheme],
  bindings: [],
};

export function resolveReportOutputTheme(
  request: ReportOutputThemeRequest,
  registry: ReportOutputThemeRegistry = norfolkReportOutputThemeRegistry,
): ResolvedReportOutputTheme {
  let reportThemeId = request.requestedReportThemeId;
  let source: ResolvedReportOutputTheme["source"] = "explicit-report-theme";
  let disclosure: string | undefined;

  if (!reportThemeId && request.screenThemeId) {
    const bindings = registry.bindings.filter(binding => (
      binding.screenThemeId === request.screenThemeId
      && (!binding.formats || binding.formats.includes(request.format))
    ));
    const formatBindings = bindings.filter(binding => binding.formats);
    const candidates = formatBindings.length > 0 ? formatBindings : bindings;
    const themeIds = [...new Set(candidates.map(binding => binding.reportThemeId))];

    if (themeIds.length > 1) {
      throw new ReportOutputThemeResolutionError(
        `Screen theme ${request.screenThemeId} has multiple report-theme bindings for ${request.format}.`,
      );
    }
    if (themeIds.length === 1) {
      [reportThemeId] = themeIds;
      source = "screen-theme-binding";
    }
  }

  if (!reportThemeId) {
    reportThemeId = registry.defaultThemeId;
    source = "default-report-theme";
    if (request.screenThemeId) {
      disclosure = `Screen theme ${request.screenThemeId} has no approved ${request.format} report mapping; the default report theme was used.`;
    }
  }

  const theme = registry.themes.find(candidate => candidate.id === reportThemeId);
  if (!theme) {
    throw new ReportOutputThemeResolutionError(`Report theme ${reportThemeId} is not registered.`);
  }
  if (!theme.supportedFormats.includes(request.format)) {
    throw new ReportOutputThemeResolutionError(
      `Report theme ${reportThemeId} does not support ${request.format}.`,
    );
  }
  const themeFindings = validateReportOutputTheme(theme);
  if (themeFindings.length > 0) {
    throw new ReportOutputThemeResolutionError(
      `Report theme ${reportThemeId} violates the Norfolk output contract: ${themeFindings.join(" ")}`,
    );
  }

  return {
    theme,
    registryVersion: registry.version,
    source,
    ...(request.screenThemeId ? { screenThemeId: request.screenThemeId } : {}),
    ...(disclosure ? { disclosure } : {}),
  };
}

export function validateReportOutputTheme(theme: ReportOutputTheme): string[] {
  const findings: string[] = [];

  if (theme.typography.denseLabel.minimumPointSize < 10) {
    findings.push("Dense financial-table labels must be at least 10pt.");
  }
  if (theme.typography.denseNumeric.minimumPointSize < 10) {
    findings.push("Dense financial-table figures must be at least 10pt.");
  }
  if (theme.typography.note.minimumPointSize < 9) {
    findings.push("Notes and disclosures must be at least 9pt.");
  }
  if (theme.typography.chartLabel.minimumPointSize < 9.5) {
    findings.push("Chart labels must be at least 9.5pt.");
  }
  if (theme.chart.fullPagePaddingMm.horizontal < 25.4) {
    findings.push("Full-page charts require at least one inch of horizontal page padding.");
  }
  if (theme.chart.maximumPlotAreaPercent > 75) {
    findings.push("A chart plot may occupy at most 75% of its page region.");
  }
  if (theme.palette.accents.length < 3) {
    findings.push("Charts require at least three approved accent colors.");
  }
  if (!theme.chart.requireNonColorEncoding) {
    findings.push("Charts must distinguish series with more than color alone.");
  }

  return findings;
}
