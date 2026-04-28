#!/usr/bin/env npx tsx
/**
 * Extract template data from the platform's TypeScript template system.
 *
 * Usage:
 *   npx tsx scripts/extract-template.ts <vertical> <slug> <name> <phone> <address>
 *
 * Outputs JSON to stdout. The generation script calls this to avoid
 * hardcoding template data in plain JS.
 */

import { autoRepairTemplate } from "../src/lib/templates/auto-repair";
import { barberTemplate } from "../src/lib/templates/barber";

const TEMPLATES: Record<string, typeof autoRepairTemplate> = {
  "auto-repair": autoRepairTemplate,
  "barber": barberTemplate,
};

const [vertical, slug, name, phone, address] = process.argv.slice(2);

if (!vertical || !slug || !name || !phone || !address) {
  console.error("Usage: npx tsx extract-template.ts <vertical> <slug> <name> <phone> <address>");
  process.exit(1);
}

const template = TEMPLATES[vertical];
if (!template) {
  console.error(`Unknown vertical: "${vertical}". Available: ${Object.keys(TEMPLATES).join(", ")}`);
  process.exit(1);
}

const business = template.buildProspectBusiness(slug, name, phone, address);
process.stdout.write(JSON.stringify(business));
