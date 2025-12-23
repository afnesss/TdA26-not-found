// Using global fetch in Node 18+
import http from 'http';

const BASE_URL = "http://localhost:8080/api"; // Adjust port if needed based on docker-compose

// --- API Helpers ---

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

// --- SSE Client Helper ---

function listenToSSE(endpoint: string, onEvent: (event: string, data: any) => void) {
  console.log(`Connecting to SSE: ${BASE_URL}${endpoint}`);
  
  const options = {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache',
      'Accept': 'text/event-stream',
    }
  };

  // Remove protocol from URL for http.request
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  const req = http.request({
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'GET',
    headers: options.headers
  }, (res) => {
    console.log(`SSE Connected. Status: ${res.statusCode}`);
    
    res.on('data', (chunk) => {
      const text = chunk.toString();
      const lines = text.split('\n');
      
      let currentEvent = '';
      
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.replace('event: ', '').trim();
        } else if (line.startsWith('data: ')) {
          const dataStr = line.replace('data: ', '').trim();
          try {
            const data = JSON.parse(dataStr);
            onEvent(currentEvent, data);
          } catch (e) {
            console.error("Failed to parse SSE data:", dataStr);
          }
        }
      }
    });
  });

  req.on('error', (e) => {
    console.error(`SSE Error: ${e.message}`);
  });

  req.end();

  return req; // return request object to abort later
}

// --- Test Suite ---

async function runTest() {
  console.log("=== Starting Phase 4 (Feed & SSE) Test ===");

  let courseId: string;
  let sseConnection: http.ClientRequest | undefined;
  const receivedEvents: { event: string, data: any }[] = [];

  try {
    // 1. Create a Course
    console.log("\n1. Creating Course...");
    const { data: course } = await apiRequest<any>("POST", "/courses", {
      name: "SSE Test Course",
      description: "Testing Feed and SSE"
    });
    courseId = course.uuid;
    console.log(`   Course created: ${courseId}`);

    // 2. Connect to SSE Stream
    console.log("\n2. Connecting to SSE Stream...");
    
    // Create a promise that resolves when we get our first event (to ensure connection is active)
    // Actually, SSE connection is immediate, but we need to wait a bit before triggering events
    sseConnection = listenToSSE(`/courses/${courseId}/feed/stream`, (event, data) => {
      console.log(`   [SSE RECEIVED] Event: ${event}, Message: ${data.message || 'No message'}`);
      receivedEvents.push({ event, data });
    });

    // Wait 1 second for connection establishment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Create Manual Post
    console.log("\n3. Creating Manual Feed Post...");
    const { data: post1 } = await apiRequest<any>("POST", `/courses/${courseId}/feed`, {
      message: "Hello SSE World!"
    });
    console.log(`   Post created: ${post1.uuid}`);

    // Wait for SSE propagation
    await new Promise(resolve => setTimeout(resolve, 500));

    // 4. Update Manual Post
    console.log("\n4. Updating Manual Feed Post...");
    await apiRequest<any>("PUT", `/courses/${courseId}/feed/${post1.uuid}`, {
        message: "Hello SSE World! (Edited)",
        edited: true
    });
    // Note: My implementation currently doesn't broadcast updates, only creation.
    // The spec example only showed `event: new_post`.
    // I will verify standard CRUD persistence though.

    // 5. Create Material (System Event)
    console.log("\n5. Creating Material (should trigger System Event)...");
    await apiRequest<any>("POST", `/courses/${courseId}/materials`, {
      type: "url",
      name: "Relevant Link",
      url: "https://example.com"
    });

    // Wait for SSE propagation
    await new Promise(resolve => setTimeout(resolve, 500));

    // 6. Create Quiz (System Event)
    console.log("\n6. Creating Quiz (should trigger System Event)...");
    await apiRequest<any>("POST", `/courses/${courseId}/quizzes`, {
      title: "Pop Quiz",
      questions: [
        {
          type: "singleChoice",
          question: "Is SSE cool?",
          options: ["Yes", "No"],
          correctIndex: 0
        }
      ]
    });

    // Wait for SSE propagation
    await new Promise(resolve => setTimeout(resolve, 500));


    // --- Verification ---
    console.log("\n=== Verification Results ===");
    
    // Check Events
    const manualEvents = receivedEvents.filter(e => e.data.type === 'manual');
    const systemEvents = receivedEvents.filter(e => e.data.type === 'system');

    console.log(`Total Events Received: ${receivedEvents.length}`);
    
    if (manualEvents.length > 0 && manualEvents[0].data.message === "Hello SSE World!") {
      console.log("✅ Manual Post Event received");
    } else {
      console.error("❌ Manual Post Event MISSING");
    }

    if (systemEvents.some(e => e.data.message.includes("New material added"))) {
      console.log("✅ Material System Event received");
    } else {
      console.error("❌ Material System Event MISSING");
    }

    if (systemEvents.some(e => e.data.message.includes("New quiz added"))) {
      console.log("✅ Quiz System Event received");
    } else {
      console.error("❌ Quiz System Event MISSING");
    }

    // Check Feed History API
    console.log("\nChecking Feed History via API...");
    const { data: feedHistory } = await apiRequest<any[]>("GET", `/courses/${courseId}/feed`);
    
    if (feedHistory && feedHistory.length >= 3) {
       console.log(`✅ Feed History contains ${feedHistory.length} items`);
    } else {
       console.error(`❌ Feed History incorrect. Found ${feedHistory?.length} items`);
    }

    // Verify Course Detail inclusion
    console.log("\nChecking Course Detail inclusion...");
    const { data: courseDetail } = await apiRequest<any>("GET", `/courses/${courseId}`);
    if (courseDetail.feed && courseDetail.feed.length >= 3) {
        console.log("✅ Course Detail includes Feed");
    } else {
        console.error("❌ Course Detail missing Feed");
    }

  } catch (error) {
    console.error("Test Failed:", error);
  } finally {
    if (sseConnection) {
      console.log("\nClosing SSE Connection...");
      sseConnection.destroy();
    }
  }
}

runTest();
