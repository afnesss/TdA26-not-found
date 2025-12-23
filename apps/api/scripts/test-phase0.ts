// Using global fetch in Node 18+

const BASE_URL = "http://localhost:8080/api";

async function apiGet<T>(endpoint: string) {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  const data = response.status !== 204 ? await response.json() : null;
  return { data: data as T, response };
}

function expect(actual: any) {
  return {
    not: {
      toBeGreaterThanOrEqual: (expected: number) => {
        if (actual >= expected) {
          throw new Error(`Expected ${actual} NOT to be >= ${expected}`);
        }
      },
    },
    toBe: (expected: any) => {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
    toContain: (expected: string) => {
      if (typeof actual !== "string" || !actual.includes(expected)) {
        throw new Error(`Expected "${actual}" to contain "${expected}"`);
      }
    },
    toEqual: (expected: any) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
      }
    },
  };
}

async function runTests() {
  console.log("Starting Phase 0 Tests...");

  try {
    // Test /api/ is a valid endpoint
    console.log("Test /api/ is a valid endpoint...");
    const { data, response } = await apiGet<any>("/");
    expect(response.status).not.toBeGreaterThanOrEqual(400);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(data).toEqual({ organization: "Student Cyber Games" });
    console.log("  Pass");

    console.log("\nALL PHASE 0 TESTS PASSED! 🚀");

  } catch (error) {
    console.error("\nTEST FAILED:", error);
    process.exit(1);
  }
}

runTests();
