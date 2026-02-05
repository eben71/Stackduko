import { describe, expect, it } from "vitest";
import {
  getLayoutTemplates,
  pickLayoutTemplate,
  validateTemplate,
} from "../../../client/src/logic/stack/layouts";
import { mulberry32 } from "../../../client/src/logic/rng";

describe("layout templates", () => {
  it("returns valid templates", () => {
    const templates = getLayoutTemplates();
    expect(templates.length).toBeGreaterThan(0);
    expect(validateTemplate(templates[0])).toBe(true);
  });

  it("rejects invalid template size", () => {
    const template = getLayoutTemplates()[0];
    const bad = { ...template, positions: template.positions.slice(0, 10) };
    expect(validateTemplate(bad)).toBe(false);
  });

  it("picks a template by difficulty", () => {
    const rng = mulberry32(42);
    const template = pickLayoutTemplate("hard", 5, rng);
    expect(template).toBeDefined();
  });

  it("falls back to last template when roll is NaN", () => {
    const template = pickLayoutTemplate("easy", 1, () => Number.NaN);
    expect(template).toBeDefined();
  });
});
