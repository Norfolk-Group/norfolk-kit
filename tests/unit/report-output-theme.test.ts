import { describe, expect, it } from "vitest";
import {
  norfolkFinancialMonochromeTheme,
  REPORT_OUTPUT_FORMATS,
  resolveReportOutputTheme,
  ReportOutputThemeResolutionError,
  validateReportOutputTheme,
  type ReportOutputTheme,
  type ReportOutputThemeRegistry,
} from "@/reporting/report-output-theme";
import {
  negotiateRenderer,
  UnsupportedRendererProfileError,
  type RendererCapabilities,
} from "@/reporting/renderer-capabilities";

describe("Norfolk financial report output theme", () => {
  it("ships a readable monochrome default with restrained chart accents", () => {
    expect(validateReportOutputTheme(norfolkFinancialMonochromeTheme)).toEqual([]);
    expect(REPORT_OUTPUT_FORMATS).toContain("docx");
    expect(norfolkFinancialMonochromeTheme).toMatchObject({
      version: 2,
      supportedFormats: expect.arrayContaining(["docx"]),
    });
    expect(norfolkFinancialMonochromeTheme.typography.denseNumeric).toMatchObject({
      family: "IBM Plex Sans Condensed",
      minimumPointSize: 10,
      numericFeatures: ["tabular-nums", "lining-nums"],
    });
    expect(norfolkFinancialMonochromeTheme.typography.fixedWidthNumeric.family).toBe("IBM Plex Mono");
    expect(norfolkFinancialMonochromeTheme.fontAssets).toEqual(expect.arrayContaining([
      expect.objectContaining({
        family: "IBM Plex Sans Condensed",
        packageName: "@fontsource/ibm-plex-sans-condensed",
        packageVersion: "5.3.0",
      }),
      expect.objectContaining({
        family: "IBM Plex Mono",
        packageName: "@fontsource/ibm-plex-mono",
        packageVersion: "5.3.0",
      }),
    ]));
    expect(norfolkFinancialMonochromeTheme.chart.fullPagePaddingMm.horizontal).toBe(26);
    expect(norfolkFinancialMonochromeTheme.chart.allowThreeDimensionalEffects).toBe(false);
  });

  it("rejects themes that shrink tables and charts to fill the page", () => {
    const compressedTheme: ReportOutputTheme = {
      ...norfolkFinancialMonochromeTheme,
      typography: {
        ...norfolkFinancialMonochromeTheme.typography,
        denseNumeric: {
          ...norfolkFinancialMonochromeTheme.typography.denseNumeric,
          minimumPointSize: 8,
        },
      },
      chart: {
        ...norfolkFinancialMonochromeTheme.chart,
        fullPagePaddingMm: { horizontal: 12, top: 18, bottom: 22 },
        maximumPlotAreaPercent: 90,
      },
    };

    expect(validateReportOutputTheme(compressedTheme)).toEqual(expect.arrayContaining([
      "Dense financial-table figures must be at least 10pt.",
      "Full-page charts require at least one inch of horizontal page padding.",
      "A chart plot may occupy at most 75% of its page region.",
    ]));
  });

  it("maps screen themes explicitly and records default-theme fallback", () => {
    const registry: ReportOutputThemeRegistry = {
      version: 1,
      defaultThemeId: norfolkFinancialMonochromeTheme.id,
      themes: [norfolkFinancialMonochromeTheme],
      bindings: [{
        screenThemeId: "studio-noir",
        reportThemeId: norfolkFinancialMonochromeTheme.id,
        formats: ["pdf", "html"],
      }],
    };

    expect(resolveReportOutputTheme({
      format: "pdf",
      screenThemeId: "studio-noir",
    }, registry)).toMatchObject({
      source: "screen-theme-binding",
      screenThemeId: "studio-noir",
      theme: { id: "norfolk-financial-monochrome" },
    });

    expect(resolveReportOutputTheme({
      format: "xlsx",
      screenThemeId: "studio-noir",
    }, registry)).toMatchObject({
      source: "default-report-theme",
      disclosure: expect.stringContaining("no approved xlsx report mapping"),
    });
  });

  it("rejects ambiguous screen-theme mappings", () => {
    const duplicateTheme = {
      ...norfolkFinancialMonochromeTheme,
      id: "another-report-theme",
    };
    const registry: ReportOutputThemeRegistry = {
      version: 1,
      defaultThemeId: norfolkFinancialMonochromeTheme.id,
      themes: [norfolkFinancialMonochromeTheme, duplicateTheme],
      bindings: [
        { screenThemeId: "studio-noir", reportThemeId: norfolkFinancialMonochromeTheme.id },
        { screenThemeId: "studio-noir", reportThemeId: duplicateTheme.id },
      ],
    };

    expect(() => resolveReportOutputTheme({
      format: "pdf",
      screenThemeId: "studio-noir",
    }, registry)).toThrow(ReportOutputThemeResolutionError);
  });

  it("refuses to resolve a registered theme that violates the output contract", () => {
    const unreadableTheme: ReportOutputTheme = {
      ...norfolkFinancialMonochromeTheme,
      id: "unreadable-report-theme",
      typography: {
        ...norfolkFinancialMonochromeTheme.typography,
        denseNumeric: {
          ...norfolkFinancialMonochromeTheme.typography.denseNumeric,
          minimumPointSize: 8,
        },
      },
    };

    expect(() => resolveReportOutputTheme({ format: "pdf" }, {
      version: 1,
      defaultThemeId: unreadableTheme.id,
      themes: [unreadableTheme],
      bindings: [],
    })).toThrow("Dense financial-table figures must be at least 10pt.");
  });
});

describe("renderer capability negotiation", () => {
  const pluginRenderer: RendererCapabilities = {
    id: "example-pdf-plugin",
    execution: "plugin",
    formats: ["pdf", "png"],
    features: [
      "local-font-embedding",
      "controlled-page-breaks",
      "repeated-table-headers",
      "raster-charts",
    ],
    fontFamilies: ["Inter", "IBM Plex Sans Condensed", "IBM Plex Mono"],
    limits: { maximumPages: 100, maximumInputBytes: 20_000_000 },
  };

  it("records an explicit supported fallback instead of pretending the preferred feature exists", () => {
    expect(negotiateRenderer({
      format: "pdf",
      fontFamilies: ["Inter", "IBM Plex Sans Condensed"],
      features: [
        { feature: "local-font-embedding" },
        {
          feature: "vector-charts",
          fallback: {
            feature: "raster-charts",
            disclosure: "Charts are embedded at the profile's print-resolution requirement.",
          },
        },
      ],
      estimatedPages: 24,
    }, pluginRenderer)).toEqual({
      rendererId: "example-pdf-plugin",
      format: "pdf",
      fallbacks: [{
        requested: "vector-charts",
        applied: "raster-charts",
        disclosure: "Charts are embedded at the profile's print-resolution requirement.",
      }],
    });
  });

  it("fails before rendering when a server or plugin cannot meet the contract", () => {
    expect(() => negotiateRenderer({
      format: "pdf",
      fontFamilies: ["Inter", "IBM Plex Sans Condensed"],
      features: [{ feature: "tagged-pdf" }, { feature: "vector-charts" }],
      estimatedPages: 120,
    }, pluginRenderer)).toThrow(UnsupportedRendererProfileError);

    try {
      negotiateRenderer({
        format: "xlsx",
        fontFamilies: ["Roboto Condensed"],
        features: [{ feature: "native-xlsx-numbers" }],
      }, pluginRenderer);
    } catch (error) {
      expect(error).toMatchObject({
        findings: expect.arrayContaining([
          "Format xlsx is not supported.",
          "Font family Roboto Condensed is unavailable.",
          "Feature native-xlsx-numbers is unavailable and has no supported fallback.",
        ]),
      });
    }
  });

  it("uses the selected format profile instead of leaking capabilities across formats", () => {
    const multiFormatRenderer: RendererCapabilities = {
      id: "multi-format-service",
      execution: "server",
      formats: ["pdf", "png"],
      features: ["raster-charts"],
      fontFamilies: ["Inter"],
      formatProfiles: {
        pdf: {
          features: ["local-font-embedding", "vector-charts", "tagged-pdf"],
          fontFamilies: ["Inter", "IBM Plex Sans Condensed"],
        },
        png: {
          features: ["raster-charts", "transparent-background"],
          fontFamilies: ["Inter"],
        },
      },
    };

    expect(negotiateRenderer({
      format: "pdf",
      fontFamilies: ["IBM Plex Sans Condensed"],
      features: [{ feature: "tagged-pdf" }],
    }, multiFormatRenderer)).toMatchObject({ format: "pdf" });

    expect(() => negotiateRenderer({
      format: "png",
      fontFamilies: ["IBM Plex Sans Condensed"],
      features: [{ feature: "tagged-pdf" }],
    }, multiFormatRenderer)).toThrow(UnsupportedRendererProfileError);
  });

  it("requires DOCX renderers to preserve native editable document structure", () => {
    const docxRenderer: RendererCapabilities = {
      id: "example-docx-sdk",
      execution: "server",
      formats: ["docx"],
      features: [
        "local-font-embedding",
        "controlled-page-breaks",
        "repeated-table-headers",
        "native-docx-structure",
      ],
      fontFamilies: ["Inter", "IBM Plex Sans Condensed", "IBM Plex Mono"],
    };

    expect(negotiateRenderer({
      format: "docx",
      fontFamilies: ["Inter", "IBM Plex Sans Condensed"],
      features: [
        { feature: "controlled-page-breaks" },
        { feature: "repeated-table-headers" },
        { feature: "native-docx-structure" },
      ],
    }, docxRenderer)).toEqual({
      rendererId: "example-docx-sdk",
      format: "docx",
      fallbacks: [],
    });

    expect(() => negotiateRenderer({
      format: "docx",
      fontFamilies: ["Inter"],
      features: [{ feature: "native-docx-structure" }],
    }, {
      ...docxRenderer,
      id: "flattened-document-exporter",
      features: ["raster-charts"],
    })).toThrow("Feature native-docx-structure is unavailable and has no supported fallback.");
  });
});
