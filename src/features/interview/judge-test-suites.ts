// Server-held executable interview catalog (#176/#178).
// Raw stdin/expected output lives in worker-only JSON payloads. Web requests
// receive hashes and category metadata only.
import { createHash } from "node:crypto";
import catalog01 from "../../../services/interview-judge/catalog-fixtures-01.json";
import catalog02 from "../../../services/interview-judge/catalog-fixtures-02.json";
import catalog03a from "../../../services/interview-judge/catalog-fixtures-03a.json";
import catalog03b1 from "../../../services/interview-judge/catalog-fixtures-03b1.json";
import catalog03b2 from "../../../services/interview-judge/catalog-fixtures-03b2.json";
import catalog03b3 from "../../../services/interview-judge/catalog-fixtures-03b3.json";
import catalog03b4 from "../../../services/interview-judge/catalog-fixtures-03b4.json";
import catalog03b5 from "../../../services/interview-judge/catalog-fixtures-03b5.json";
import catalog04a from "../../../services/interview-judge/catalog-fixtures-04a.json";
import catalog04b from "../../../services/interview-judge/catalog-fixtures-04b.json";
import catalog05a from "../../../services/interview-judge/catalog-fixtures-05a.json";
import catalog05b from "../../../services/interview-judge/catalog-fixtures-05b.json";
import catalog06a from "../../../services/interview-judge/catalog-fixtures-06a.json";
import catalog06b from "../../../services/interview-judge/catalog-fixtures-06b.json";
import { DEFAULT_JUDGE_LIMITS } from "./judge-contract";
import type { JudgeWorkerTest } from "../../../services/interview-judge/protocol";
import type { JudgeFixture } from "../../../services/interview-judge/worker-runner";

export type JudgeProblemTestCase = {
  id: string;
  name: string;
  hidden: boolean;
  category: string;
  stdin: string;
  expectedStdout: string;
};

export type JudgeProblemSuite = {
  problemId: string;
  version: number;
  ioDescription: string;
  visibleTests: JudgeWorkerTest[];
  hiddenTests: JudgeWorkerTest[];
  fixtures: JudgeFixture[];
};

type RawDefinition = {
  problemId: string;
  version: number;
  ioDescription: string;
  cases: JudgeProblemTestCase[];
};

const DEFINITIONS = [
  ...catalog01.definitions,
  ...catalog02.definitions,
  ...catalog03a.definitions,
  ...catalog03b1.definitions,
  ...catalog03b2.definitions,
  ...catalog03b3.definitions,
  ...catalog03b4.definitions,
  ...catalog03b5.definitions,
  ...catalog04a.definitions,
  ...catalog04b.definitions,
  ...catalog05a.definitions,
  ...catalog05b.definitions,
  ...catalog06a.definitions,
  ...catalog06b.definitions
] as RawDefinition[];

const BY_ID = new Map(DEFINITIONS.map((definition) => [definition.problemId, definition]));

function fixtureHash(test: JudgeProblemTestCase): string {
  return createHash("sha256").update(`${test.stdin}\0${test.expectedStdout}`).digest("hex");
}

function toWorkerTest(test: JudgeProblemTestCase): JudgeWorkerTest {
  return {
    id: test.id,
    name: test.name,
    hidden: test.hidden,
    category: test.category,
    fixtureHash: fixtureHash(test)
  };
}

function toFixture(test: JudgeProblemTestCase): JudgeFixture {
  return {
    testId: test.id,
    stdin: test.stdin,
    expectedStdout: test.expectedStdout
  };
}

export function getJudgeProblemSuite(problemId: string): JudgeProblemSuite | null {
  const definition = BY_ID.get(problemId);
  if (!definition || definition.cases.length > DEFAULT_JUDGE_LIMITS.maxTests) {
    return null;
  }

  const visible = definition.cases.filter((test) => !test.hidden);
  const hidden = definition.cases.filter((test) => test.hidden);
  if (visible.length === 0 || hidden.length === 0) {
    return null;
  }

  return {
    problemId,
    version: definition.version,
    ioDescription: definition.ioDescription,
    visibleTests: visible.map(toWorkerTest),
    hiddenTests: hidden.map(toWorkerTest),
    fixtures: definition.cases.map(toFixture)
  };
}

export function judgeSupportedProblemIds(): string[] {
  return [...BY_ID.keys()].sort();
}

export function getJudgeIoDescription(problemId: string): string | null {
  return BY_ID.get(problemId)?.ioDescription ?? null;
}
