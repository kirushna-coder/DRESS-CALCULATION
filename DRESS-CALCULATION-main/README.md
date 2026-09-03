# DRESS CALCULATION

## AI-Based Smart Dress Size Recommendation System

SmartTailor is a React, TypeScript, and Vite application for measurement-led dress sizing and tailoring operations. It combines a local intelligent recommendation engine with the existing fabric calculator, 2D preview, CAD pattern studio, customer directory, order workflow, and invoice tools.

### Smart sizing workflow

`User measurements -> Validation -> BMI -> Body shape -> Smart size -> Personalized styles -> PDF report`

The **Size Intelligence** tab accepts gender, age, height, weight, chest/bust, waist, hip, and preferred fit. It calculates an XS-XXL recommendation from all three key circumferences, reports a confidence score and explanation, classifies body shape using ratios, and suggests three clothing styles. The logic runs entirely in the browser; it does not require an API or backend.

### Included features

- Women, men, and kids interactive size charts with highlighted results
- BMI value and general category with a health-assessment disclaimer
- Optional body image upload with local preview only; no measurement claims
- Calculation history stored in localStorage, including load, delete, and clear actions
- Downloadable PDF size report generated with jsPDF
- Persistent light/dark theme for the smart sizing studio
- Validation messages, analysis loading state, reset action, accessible labels, and responsive mobile layout
- Existing fabric, garment, cost, CAD, order, invoice, and customer functionality preserved

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal. Production verification:

```bash
npm run build
npm run lint
```

## Project map

- `src/components/SmartSizeStudio.tsx` - smart sizing interface, history, upload preview, chart, and report action
- `src/components/SmartSizeStudio.css` - responsive premium UI and theme styles
- `src/utils/smartRecommendation.ts` - typed local sizing, BMI, body-shape, confidence, and style engine
- `src/App.tsx` - preserves the original application router and mounts the new Size Intelligence view
- `src/components/Navigation.tsx` - adds the Size Intelligence navigation entry

All profile history, current measurements, theme preference, customers, and orders remain client-side localStorage data.
