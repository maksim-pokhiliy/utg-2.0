import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const COLOR_LITERAL = "#[0-9a-fA-F]{3,8}\\b";
const COLOR_FUNCTION = "(rgba?|hsla?|oklch)\\(";
const PALETTE_UTILITY =
  "\\b(bg|text|border|ring|fill|stroke|from|via|to)-(black|white|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(-\\d{1,3})?\\b";
const TYPE_UTILITY =
  "(\\btext-(xs|sm|base|lg|[2-9]?xl)\\b|text-\\[|leading-\\[)";

const COLOR_LITERAL_MSG =
  "Raw color value is sealed inside the design system — use a token utility (bg-ink, text-accent…) or a DS component.";
const PALETTE_MSG =
  "Legacy palette utility does not exist in this app — use a design-system semantic token utility.";
const TYPE_MSG =
  "Raw text-size/leading utility is sealed — render text through the Typography component.";

const sealSyntax = [
  { selector: `Literal[value=/${COLOR_LITERAL}/]`, message: COLOR_LITERAL_MSG },
  {
    selector: `Literal[value=/${COLOR_FUNCTION}/]`,
    message: COLOR_LITERAL_MSG,
  },
  {
    selector: `TemplateElement[value.raw=/${COLOR_LITERAL}/]`,
    message: COLOR_LITERAL_MSG,
  },
  {
    selector: `TemplateElement[value.raw=/${COLOR_FUNCTION}/]`,
    message: COLOR_LITERAL_MSG,
  },
  { selector: `Literal[value=/${PALETTE_UTILITY}/]`, message: PALETTE_MSG },
  {
    selector: `TemplateElement[value.raw=/${PALETTE_UTILITY}/]`,
    message: PALETTE_MSG,
  },
  { selector: `Literal[value=/${TYPE_UTILITY}/]`, message: TYPE_MSG },
  {
    selector: `TemplateElement[value.raw=/${TYPE_UTILITY}/]`,
    message: TYPE_MSG,
  },
];

const RAW_ELEMENT_MSG =
  "Raw interactive element is sealed — compose a DS control (Button, IconButton, TextTab, IconLink, Dialog) or a routing NavLink instead of a bare <button>/<a>.";

const sealElements = [
  {
    selector: "JSXOpeningElement[name.name='button']",
    message: RAW_ELEMENT_MSG,
  },
  { selector: "JSXOpeningElement[name.name='a']", message: RAW_ELEMENT_MSG },
];

export default defineConfig([
  ...nextVitals,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/design-system/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@root/design-system/*", "@root/design-system/**"],
              message:
                "Import design-system components from the @root/design-system barrel only.",
            },
          ],
        },
      ],
      "no-restricted-syntax": ["error", ...sealSyntax, ...sealElements],
    },
  },
]);
