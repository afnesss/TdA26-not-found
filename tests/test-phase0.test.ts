import { expect, it } from "vitest";
import { phase, RUN_URL } from "./phase-utils";

phase(0, () => {
  it("Test / is a valid page", async () => {
    const res = await fetch(`${RUN_URL}/`);
    expect(res.headers.get("content-type")).toContain("text/html");
    const content = await res.text();
    expect(content).toContain("Hello TdA");
  });
  it("Test /api/ is a valid endpoint", async () => {
    const res = await fetch(`${RUN_URL}/api/`);
    console.log(await res.clone().text());
    expect(res.status).not.toBeGreaterThanOrEqual(400);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(await res.json()).toEqual({ organization: "Student Cyber Games" });
  });
});
