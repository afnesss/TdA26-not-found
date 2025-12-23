// Using global fetch in Node 18+

// run with npx ts-node apps/api/scripts/test-phase3.ts

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
    toBeGreaterThanOrEqual: (expected: number) => {
      if (actual < expected) {
        throw new Error(`Expected ${actual} to be >= ${expected}`);
      }
    },
    toBeLessThan: (expected: number) => {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be < ${expected}`);
      }
    },
    toBeTruthy: () => {
      if (!actual) {
        throw new Error(`Expected ${actual} to be truthy`);
      }
    },
  };
}

async function runTests() {
  console.log("Starting Phase 3 Tests...");
  let testCourseId: string | undefined = undefined; // Initialize as undefined
  let testQuizId: string;
  let singleChoiceQuestionUuid: string;
  let multipleChoiceQuestionUuid: string;

  try {
    // Setup: Create a test course
    console.log("Test 0: Creating test course...");
    const { data: courseData, response: courseResponse } = await apiPost<any>(
      "/courses",
      {
        name: "Test Course for Phase 3",
        description: "Testing course quizzes",
      }
    );

    if (!courseResponse.ok)
      throw new Error(
        `Failed to create course: ${courseResponse.status} - ${JSON.stringify(courseData)}`
      );
    testCourseId = courseData.uuid;
    console.log("  Pass: Course created with UUID", testCourseId);

    // Test 1: List quizzes (should be empty initially)
    console.log("Test 1: List quizzes (empty)...");
    const { data: quizzesData, response: quizzesResponse } = await apiGet<
      any[]
    >(`/courses/${testCourseId}/quizzes`);
    expect(quizzesResponse.ok).toBe(true);
    expect(quizzesData?.length).toBe(0);
    console.log("  Pass");

    // Test 2: Create a quiz with singleChoice questions
    console.log("Test 2: Create singleChoice quiz...");
    const newQuiz = {
      title: "Introduction Quiz",
      questions: [
        {
          type: "singleChoice",
          question: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          correctIndex: 1,
        },
      ],
    };
    const { data: createData, response: createResponse } = await apiPost<any>(
      `/courses/${testCourseId}/quizzes`,
      newQuiz
    );
    if (!createResponse.ok)
      throw new Error(
        `Failed to create quiz: ${createResponse.status} - ${JSON.stringify(createData)}`
      );
    testQuizId = createData.uuid;
    singleChoiceQuestionUuid = createData.questions[0].uuid;
    expect(createData.title).toBe(newQuiz.title);
    expect(createData.questions.length).toBe(1);
    console.log("  Pass: Quiz created with UUID", testQuizId);

    // Test 3: Get quiz details
    console.log("Test 3: Get quiz details...");
    const { data: getData, response: getResponse } = await apiGet<any>(
      `/courses/${testCourseId}/quizzes/${testQuizId}`
    );
    if (!getResponse.ok)
      throw new Error(
        `Failed to get quiz: ${getResponse.status} - ${JSON.stringify(getData)}`
      );
    expect(getData.uuid).toBe(testQuizId);
    console.log("  Pass");

    // Test 4: Update quiz title
    console.log("Test 4: Update quiz title...");
    const updatedQuiz = {
      title: "Updated Introduction Quiz",
      questions: [
        {
          uuid: singleChoiceQuestionUuid, // Keep the same question
          type: "singleChoice",
          question: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          correctIndex: 1,
        },
      ],
    };
    const { data: updateData, response: updateResponse } = await apiPut<any>(
      `/courses/${testCourseId}/quizzes/${testQuizId}`,
      updatedQuiz
    );
    if (!updateResponse.ok)
      throw new Error(
        `Failed to update quiz title: ${updateResponse.status} - ${JSON.stringify(updateData)}`
      );
    expect(updateData.title).toBe("Updated Introduction Quiz");
    console.log("  Pass");

    // Test 5: Update quiz to add multipleChoice question
    console.log("Test 5: Add multipleChoice question...");
    const updatedQuiz2 = {
      title: "Updated Introduction Quiz",
      questions: [
        {
          uuid: singleChoiceQuestionUuid,
          type: "singleChoice",
          question: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          correctIndex: 1,
        },
        {
          type: "multipleChoice",
          question: "Which are prime numbers?",
          options: ["2", "3", "4", "5"],
          correctIndices: [0, 1, 3],
        },
      ],
    };
    const { data: updateData2, response: updateResponse2 } = await apiPut<any>(
      `/courses/${testCourseId}/quizzes/${testQuizId}`,
      updatedQuiz2
    );
    if (!updateResponse2.ok)
      throw new Error(
        `Failed to add multiple choice question: ${updateResponse2.status} - ${JSON.stringify(updateData2)}`
      );
    expect(updateData2.questions.length).toBe(2);
    const mcQuestion = updateData2.questions.find(
      (q: any) => q.type === "multipleChoice"
    );
    multipleChoiceQuestionUuid = mcQuestion.uuid;
    console.log("  Pass");

    // Test 6: Submit correct answers
    console.log("Test 6: Submit correct answers...");
    const submission = {
      answers: [
        {
          uuid: singleChoiceQuestionUuid,
          selectedIndex: 1,
        },
        {
          uuid: multipleChoiceQuestionUuid,
          selectedIndices: [0, 1, 3],
        },
      ],
    };
    const { data: submitData, response: submitResponse } = await apiPost<any>(
      `/courses/${testCourseId}/quizzes/${testQuizId}/submit`,
      submission
    );
    if (!submitResponse.ok)
      throw new Error(
        `Failed to submit correct answers: ${submitResponse.status} - ${JSON.stringify(submitData)}`
      );
    expect(submitData.score).toBe(submitData.maxScore);
    console.log("  Pass: Score", submitData.score, "/", submitData.maxScore);

    // Test 7: Submit incorrect answers
    console.log("Test 7: Submit incorrect answers...");
    const badSubmission = {
      answers: [
        {
          uuid: singleChoiceQuestionUuid,
          selectedIndex: 0, // Wrong
        },
        {
          uuid: multipleChoiceQuestionUuid,
          selectedIndices: [0, 2], // Wrong
        },
      ],
    };
    const { data: badSubmitData, response: badSubmitResponse } =
      await apiPost<any>(
        `/courses/${testCourseId}/quizzes/${testQuizId}/submit`,
        badSubmission
      );
    if (!badSubmitResponse.ok)
      throw new Error(
        `Failed to submit incorrect answers: ${badSubmitResponse.status} - ${JSON.stringify(badSubmitData)}`
      );
    expect(badSubmitData.score).toBeLessThan(badSubmitData.maxScore);
    console.log(
      "  Pass: Score",
      badSubmitData.score,
      "/",
      badSubmitData.maxScore
    );

    // Test 8: Quiz should appear in course detail
    console.log("Test 8: Check course detail for quizzes...");
    const { data: courseDetail, response: courseDetailResponse } =
      await apiGet<any>(`/courses/${testCourseId}`);
    if (!courseDetailResponse.ok)
      throw new Error(
        `Failed to get course detail: ${courseDetailResponse.status} - ${JSON.stringify(courseDetail)}`
      );
    expect(courseDetail.quizzes.length).toBeGreaterThanOrEqual(1);
    console.log("  Pass");

    // Test 9: Create another quiz to verify listing
    console.log("Test 9: Create second quiz and verify listing...");
    const secondQuiz = {
      title: "Second Quiz",
      questions: [
        {
          type: "singleChoice",
          question: "What is the capital of France?",
          options: ["London", "Paris", "Berlin", "Madrid"],
          correctIndex: 1,
        },
      ],
    };

    const { data: createData2, response: createResponse2 } = await apiPost<any>(
      `/courses/${testCourseId}/quizzes`,
      secondQuiz
    );

    if (!createResponse2.ok)
      throw new Error(
        `Failed to create second quiz: ${createResponse2.status} - ${JSON.stringify(createData2)}`
      );
    expect(createData2?.uuid).toBeDefined();

    // Verify listing returns both quizzes
    const { data: listData, response: listResponse } = await apiGet<any[]>(
      `/courses/${testCourseId}/quizzes`
    );
    if (!listResponse.ok)
      throw new Error(
        `Failed to list quizzes after creating second quiz: ${listResponse.status} - ${JSON.stringify(listData)}`
      );
    expect(listData?.length).toBeGreaterThanOrEqual(2);
    console.log("  Pass");

    // Test 10: Verify UUID format (from previous create, or create a new one to be safe)
    console.log("Test 10: Verify UUID format...");
    const { data: uuidTestData, response: uuidTestResponse } =
      await apiPost<any>(`/courses/${testCourseId}/quizzes`, {
        title: "UUID Test Quiz",
        questions: [
          {
            type: "singleChoice",
            question: "UUID test question?",
            options: ["Yes", "No"],
            correctIndex: 0,
          },
        ],
      });
    if (!uuidTestResponse.ok)
      throw new Error(
        `Failed to create UUID test quiz: ${uuidTestResponse.status} - ${JSON.stringify(uuidTestData)}`
      );
    expect(uuidTestData?.uuid).toBeDefined();
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(
      uuidTestData?.uuid && uuidPattern.test(uuidTestData.uuid)
    ).toBeTruthy();
    console.log("  Pass");

    // Test 11: Delete quiz
    console.log("Test 11: Delete quiz...");
    const { response: deleteResponse } = await apiDelete(
      `/courses/${testCourseId}/quizzes/${testQuizId}`
    );
    expect(deleteResponse.status).toBe(204);

    // Verify deletion
    const { response: verifyDelete } = await apiGet(
      `/courses/${testCourseId}/quizzes/${testQuizId}`
    );
    expect(verifyDelete.status).toBe(404);
    console.log("  Pass");

    // Cleanup
    console.log("Cleanup: Deleting test course...");
    if (testCourseId) {
      await apiDelete(`/courses/${testCourseId}`);
      console.log("  Test course cleaned up.");
    } else {
      console.log("  No test course to clean up.");
    }

    console.log("\nALL TESTS PASSED SUCCESSFULLY! 🚀");
    process.exit(0);
  } catch (error) {
    console.error("\nTEST FAILED:", error);
    if (testCourseId) {
      console.log("Attempting cleanup of course", testCourseId);
      try {
        await apiDelete(`/courses/${testCourseId}`);
        console.log("  Test course cleaned up successfully after failure.");
      } catch (cleanupError) {
        console.error("  Failed to cleanup test course:", cleanupError);
      }
    }
    process.exit(1);
  }
}

runTests();
