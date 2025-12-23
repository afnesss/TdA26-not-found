// Using global fetch in Node 18+

const BASE_URL = "http://localhost:8080/api";

async function apiRequest<T>(method: string, endpoint: string, body?: any) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = response.status !== 204 ? await response.json() : null;
  return { data: data as T, response };
}

async function apiGet<T>(endpoint: string) {
  return apiRequest<T>("GET", endpoint);
}

async function apiPost<T>(endpoint: string, body: any) {
  return apiRequest<T>("POST", endpoint, body);
}

async function apiPut<T>(endpoint: string, body: any) {
  return apiRequest<T>("PUT", endpoint, body);
}

async function apiDelete(endpoint: string) {
  return apiRequest("DELETE", endpoint);
}

function expect(actual: any) {
  return {
    toBe: (expected: any) => {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
    toBeDefined: () => {
      if (actual === undefined || actual === null) {
        throw new Error(`Expected ${actual} to be defined`);
      }
    },
    toBeString: () => {
        if (typeof actual !== 'string') {
            throw new Error(`Expected ${actual} to be a string`);
        }
    },
    toBeArray: () => {
        if (!Array.isArray(actual)) {
            throw new Error(`Expected ${actual} to be an array`);
        }
    }
  };
}

async function runTests() {
  console.log("Starting Phase 1 Tests...");
  let testCourseId: string | undefined;

  try {
    // Test 1: List all courses
    console.log("Test 1: List all courses...");
    const { data: listData, response: listResponse } = await apiGet<any[]>("/courses");
    expect(listResponse.ok).toBe(true);
    expect(listData).toBeDefined();
    expect(listData).toBeArray();

    if (listData && listData.length > 0) {
        const course = listData[0];
        expect(course.uuid).toBeDefined();
        expect(course.name).toBeDefined();
        expect(typeof course.uuid).toBe("string");
        expect(typeof course.name).toBe("string");
    }
    console.log("  Pass");

    // Test 2: Create a new course
    console.log("Test 2: Create a new course...");
    const newCourse = {
      name: "Test Course for Phase 1",
      description: "This is a test course created during automated testing"
    };
    const { data: createData, response: createResponse } = await apiPost<any>("/courses", newCourse);
    expect(createResponse.ok).toBe(true);
    expect(createData).toBeDefined();
    expect(createData.uuid).toBeDefined();
    expect(createData.name).toBe(newCourse.name);
    expect(createData.description).toBe(newCourse.description);
    
    testCourseId = createData.uuid;
    console.log("  Pass: Course created with UUID", testCourseId);

    // Test 3: Get course details
    console.log("Test 3: Get course details...");
    if (!testCourseId) throw new Error("testCourseId not set");
    
    const { data: detailData, response: detailResponse } = await apiGet<any>(`/courses/${testCourseId}`);
    expect(detailResponse.ok).toBe(true);
    expect(detailData.uuid).toBe(testCourseId);
    expect(detailData.name).toBe("Test Course for Phase 1");
    expect(detailData.description).toBe("This is a test course created during automated testing");
    
    // Check for empty arrays (phase 1 requirements)
    if (detailData.materials !== undefined) expect(detailData.materials).toBeArray();
    if (detailData.quizzes !== undefined) expect(detailData.quizzes).toBeArray();
    if (detailData.feed !== undefined) expect(detailData.feed).toBeArray();
    console.log("  Pass");

    // Test 4: Update a course
    console.log("Test 4: Update a course...");
    const updatedData = {
      name: "Updated Test Course",
      description: "This course has been updated"
    };
    const { data: updateData, response: updateResponse } = await apiPut<any>(`/courses/${testCourseId}`, updatedData);
    expect(updateResponse.ok).toBe(true);
    expect(updateData.uuid).toBe(testCourseId);
    expect(updateData.name).toBe(updatedData.name);
    expect(updateData.description).toBe(updatedData.description);
    console.log("  Pass");

    // Test 5: Delete a course
    console.log("Test 5: Delete a course...");
    const { response: deleteResponse } = await apiDelete(`/courses/${testCourseId}`);
    expect(deleteResponse.status).toBe(204);
    
    // Verify deletion
    const { response: verifyResponse } = await apiGet(`/courses/${testCourseId}`);
    expect(verifyResponse.status).toBe(404);
    console.log("  Pass");
    
    // Reset testCourseId since it's deleted
    testCourseId = undefined;

    // Test 6: Non-existent course
    console.log("Test 6: Non-existent course...");
    const fakeUuid = "00000000-0000-0000-0000-000000000000";
    const { response: fakeResponse } = await apiGet(`/courses/${fakeUuid}`);
    expect(fakeResponse.status).toBe(404);
    console.log("  Pass");

    console.log("\nALL PHASE 1 TESTS PASSED! 🚀");

  } catch (error) {
    console.error("\nTEST FAILED:", error);
    if (testCourseId) {
        try { await apiDelete(`/courses/${testCourseId}`); } catch(e) {}
    }
    process.exit(1);
  }
}

runTests();
