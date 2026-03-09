#!/usr/bin/env tsx

interface SmokeTestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

interface TestConfig {
  webUrl: string;
  apiUrl: string;
  environment: "staging" | "production";
}

class SmokeTestRunner {
  private results: SmokeTestResult[] = [];
  private config: TestConfig;

  constructor(config: TestConfig) {
    this.config = config;
  }

  async runAll(): Promise<void> {
    console.log(`\nRunning smoke tests for ${this.config.environment}...\n`);

    await this.testWebHomepage();
    await this.testApiHealth();
    await this.testApiGraphQL();
    await this.testWebPerformance();

    this.printResults();
  }

  private async testWebHomepage(): Promise<void> {
    const testName = "Web: Homepage loads";
    const startTime = Date.now();

    try {
      const response = await fetch(this.config.webUrl);
      const duration = Date.now() - startTime;

      if (response.ok) {
        const html = await response.text();
        const hasTitle = html.includes("VizTechStack") || html.includes("rebuilt");

        if (hasTitle) {
          this.results.push({ name: testName, passed: true, duration });
          console.log(`PASS ${testName} (${duration}ms)`);
        } else {
          throw new Error("Homepage missing expected content");
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: testName,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`FAIL ${testName} (${duration}ms)`);
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async testApiHealth(): Promise<void> {
    const testName = "API: Health check responds";
    const startTime = Date.now();

    try {
      const endpoints = [
        `${this.config.apiUrl}/health`,
        `${this.config.apiUrl}/api/health`,
        `${this.config.apiUrl}/`,
      ];

      let success = false;
      let lastError: Error | null = null;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            success = true;
            break;
          }
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
        }
      }

      const duration = Date.now() - startTime;

      if (success) {
        this.results.push({ name: testName, passed: true, duration });
        console.log(`PASS ${testName} (${duration}ms)`);
      } else {
        throw lastError || new Error("All health check endpoints failed");
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: testName,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`FAIL ${testName} (${duration}ms)`);
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async testApiGraphQL(): Promise<void> {
    const testName = "API: GraphQL endpoint responds";
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.config.apiUrl}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "{ __typename }",
        }),
      });

      const duration = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.__typename) {
          this.results.push({ name: testName, passed: true, duration });
          console.log(`PASS ${testName} (${duration}ms)`);
        } else {
          throw new Error("GraphQL response missing expected data");
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: testName,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`FAIL ${testName} (${duration}ms)`);
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async testWebPerformance(): Promise<void> {
    const testName = "Web: Performance check (< 3s)";
    const startTime = Date.now();

    try {
      const response = await fetch(this.config.webUrl);
      const duration = Date.now() - startTime;

      if (response.ok && duration < 3000) {
        this.results.push({ name: testName, passed: true, duration });
        console.log(`PASS ${testName} (${duration}ms)`);
      } else if (duration >= 3000) {
        throw new Error(`Page load too slow: ${duration}ms (expected < 3000ms)`);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name: testName,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`FAIL ${testName} (${duration}ms)`);
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private printResults(): void {
    console.log(`\n${"=".repeat(60)}`);
    console.log("SMOKE TEST RESULTS");
    console.log("=".repeat(60));

    const passed = this.results.filter((result) => result.passed).length;
    const failed = this.results.filter((result) => !result.passed).length;
    const total = this.results.length;

    console.log(`\nTotal: ${total} | Passed: ${passed} | Failed: ${failed}`);

    if (failed > 0) {
      console.log("\nFAILED TESTS:");
      this.results
        .filter((result) => !result.passed)
        .forEach((result) => {
          console.log(`   - ${result.name}`);
          if (result.error) {
            console.log(`     Error: ${result.error}`);
          }
        });
    }

    console.log(`\n${"=".repeat(60)}`);

    if (failed === 0) {
      console.log("All smoke tests passed!");
      process.exit(0);
    }

    console.log("Some smoke tests failed!");
    process.exit(1);
  }
}

async function main() {
  const environment = process.argv[2] as "staging" | "production";

  if (!environment || !["staging", "production"].includes(environment)) {
    console.error("Usage: tsx smoke-tests.ts <staging|production>");
    process.exit(1);
  }

  let webUrl: string;
  let apiUrl: string;

  if (environment === "staging") {
    webUrl = process.env.STAGING_WEB_URL || "https://viztechstack-staging.vercel.app";
    apiUrl = process.env.STAGING_API_URL || "https://viz-tech-stack-api-staging.vercel.app";
  } else {
    webUrl = process.env.PRODUCTION_WEB_URL || "https://viztechstack.com";
    apiUrl = process.env.PRODUCTION_API_URL || "https://api.viztechstack.com";
  }

  console.log(`Environment: ${environment}`);
  console.log(`Web URL: ${webUrl}`);
  console.log(`API URL: ${apiUrl}`);

  const runner = new SmokeTestRunner({
    webUrl,
    apiUrl,
    environment,
  });

  await runner.runAll();
}

main().catch((error) => {
  console.error("Error running smoke tests:", error);
  process.exit(1);
});
