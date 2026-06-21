import { cookies } from "next/headers";
import { getChoicesForItem } from "@/features/learning-items/learning-item-seed";
import { gradeChoiceAttempt } from "@/features/learning-items/grading";
import {
  buildGoalEvaluationFindings,
  selectNextGoalEvaluationItem,
  type GoalEvaluationResponse
} from "./evaluation-engine";
import {
  GOAL_EVALUATION_ALGORITHM_VERSION,
  GOAL_EVALUATION_ITEM_POOL_VERSION,
  GOAL_EVALUATION_QUESTION_COUNT,
  getGoalEvaluationCatalog,
  validateGoalEvaluationCatalog,
  type GoalEvaluationDiagnosticItem
} from "./evaluation-catalog";
import type { EvaluationMutationResult } from "./evaluation-service-types";
import type { GoalEvaluationQuestion, GoalEvaluationView } from "./evaluation-view";

const COOKIE_NAME = "cppfan_goal_evaluation_local";
const LOCAL_PREFIX = "local:";
const TTL_SECONDS = 60 * 60 * 24 * 7;

type LocalStoredResponse = { itemId: string; choiceId: string };

type LocalSession = {
  id: string;
  status: GoalEvaluationView["status"];
  currentItemId: string | null;
  questionIndex: number;
  answerCount: number;
  algorithmVersion: string;
  itemPoolVersion: number;
  expiresAt: string;
  responses: LocalStoredResponse[];
  findings: GoalEvaluationView["findings"];
};

function emptyReadyView(authenticated: boolean): GoalEvaluationView {
  return {
    state: "ready",
    authenticated,
    sessionId: null,
    status: "not_started",
    questionIndex: 1,
    answerCount: 0,
    algorithmVersion: GOAL_EVALUATION_ALGORITHM_VERSION,
    itemPoolVersion: GOAL_EVALUATION_ITEM_POOL_VERSION,
    expiresAt: null,
    currentQuestion: null,
    responses: [],
    findings: []
  };
}

function toQuestion(item: GoalEvaluationDiagnosticItem): GoalEvaluationQuestion {
  return {
    itemId: item.itemId,
    moduleId: item.moduleId,
    moduleTitle: item.moduleTitle,
    prompt: item.prompt,
    choices: item.choices
  };
}

function buildResponses(catalog: GoalEvaluationDiagnosticItem[], stored: LocalStoredResponse[]): GoalEvaluationResponse[] {
  const byId = new Map(catalog.map((item) => [item.itemId, item]));
  return stored.flatMap((response) => {
    const item = byId.get(response.itemId);
    if (!item) return [];
    const grade = gradeChoiceAttempt(getChoicesForItem(response.itemId), response.choiceId);
    if (grade.status !== "graded") return [];
    return [{
      itemId: item.itemId,
      moduleId: item.moduleId,
      primarySkillId: item.primarySkillId,
      difficultyBand: item.difficultyBand,
      diagnosticWeight: item.diagnosticWeight,
      itemType: item.itemType,
      isCorrect: grade.isCorrect
    }];
  });
}

function toView(session: LocalSession, authenticated: boolean): GoalEvaluationView {
  const catalog = getGoalEvaluationCatalog();
  const current = session.currentItemId ? catalog.find((item) => item.itemId === session.currentItemId) ?? null : null;
  return {
    state: "ready",
    authenticated,
    sessionId: session.id,
    status: session.status,
    questionIndex: session.questionIndex,
    answerCount: session.answerCount,
    algorithmVersion: session.algorithmVersion,
    itemPoolVersion: session.itemPoolVersion,
    expiresAt: session.expiresAt,
    currentQuestion: current ? toQuestion(current) : null,
    responses: buildResponses(catalog, session.responses),
    findings: session.findings
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseLocalSession(value: string | undefined): LocalSession | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    if (!isRecord(parsed)) return null;
    if (typeof parsed.id !== "string" || !parsed.id.startsWith(LOCAL_PREFIX)) return null;
    if (!["active", "completed", "abandoned", "not_started"].includes(String(parsed.status))) return null;
    if (typeof parsed.questionIndex !== "number" || typeof parsed.answerCount !== "number") return null;
    if (typeof parsed.expiresAt !== "string" || !Array.isArray(parsed.responses)) return null;
    return {
      id: parsed.id,
      status: parsed.status as GoalEvaluationView["status"],
      currentItemId: typeof parsed.currentItemId === "string" ? parsed.currentItemId : null,
      questionIndex: parsed.questionIndex,
      answerCount: parsed.answerCount,
      algorithmVersion: typeof parsed.algorithmVersion === "string" ? parsed.algorithmVersion : GOAL_EVALUATION_ALGORITHM_VERSION,
      itemPoolVersion: typeof parsed.itemPoolVersion === "number" ? parsed.itemPoolVersion : GOAL_EVALUATION_ITEM_POOL_VERSION,
      expiresAt: parsed.expiresAt,
      responses: parsed.responses.filter(isRecord).flatMap((response) => {
        if (typeof response.itemId !== "string" || typeof response.choiceId !== "string") return [];
        return [{ itemId: response.itemId, choiceId: response.choiceId }];
      }),
      findings: Array.isArray(parsed.findings) ? parsed.findings as GoalEvaluationView["findings"] : []
    };
  } catch {
    return null;
  }
}

async function readLocalSession(): Promise<LocalSession | null> {
  const cookieStore = await cookies();
  return parseLocalSession(cookieStore.get(COOKIE_NAME)?.value);
}

async function writeLocalSession(session: LocalSession) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encodeURIComponent(JSON.stringify(session)), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_SECONDS
  });
}

async function clearLocalSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function isLocalGoalEvaluationSessionId(sessionId: string) {
  return sessionId.startsWith(LOCAL_PREFIX);
}

export async function getLocalGoalEvaluationView(authenticated: boolean): Promise<GoalEvaluationView | null> {
  const session = await readLocalSession();
  return session ? toView(session, authenticated) : null;
}

export function createLocalReadyGoalEvaluationView(authenticated: boolean): GoalEvaluationView {
  return emptyReadyView(authenticated);
}

export async function startLocalGoalEvaluation(authenticated = true): Promise<EvaluationMutationResult> {
  const validated = validateGoalEvaluationCatalog();
  if (validated.errors.length > 0 || validated.catalog.length < GOAL_EVALUATION_QUESTION_COUNT) return { status: "pool_invalid" };
  const current = selectNextGoalEvaluationItem({ catalog: validated.catalog, responses: [] });
  if (!current) return { status: "pool_invalid" };
  const session: LocalSession = {
    id: `${LOCAL_PREFIX}${crypto.randomUUID()}`,
    status: "active",
    currentItemId: current.itemId,
    questionIndex: 1,
    answerCount: 0,
    algorithmVersion: GOAL_EVALUATION_ALGORITHM_VERSION,
    itemPoolVersion: GOAL_EVALUATION_ITEM_POOL_VERSION,
    expiresAt: new Date(Date.now() + TTL_SECONDS * 1000).toISOString(),
    responses: [],
    findings: []
  };
  await writeLocalSession(session);
  return { status: "ok", view: toView(session, authenticated) };
}

export async function submitLocalGoalEvaluationChoice(input: {
  sessionId: string;
  expectedQuestionIndex: number;
  choiceId: string;
}): Promise<EvaluationMutationResult> {
  const session = await readLocalSession();
  if (!session || session.id !== input.sessionId || session.status !== "active") return { status: "stale" };
  if (session.questionIndex !== input.expectedQuestionIndex || !session.currentItemId) return { status: "stale" };
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await clearLocalSession();
    return { status: "stale" };
  }
  const catalog = getGoalEvaluationCatalog();
  const current = catalog.find((item) => item.itemId === session.currentItemId);
  if (!current) return { status: "pool_invalid" };
  const grade = gradeChoiceAttempt(getChoicesForItem(current.itemId), input.choiceId);
  if (grade.status !== "graded") return { status: "invalid" };
  const storedResponses = [...session.responses, { itemId: current.itemId, choiceId: input.choiceId }];
  const responses = buildResponses(catalog, storedResponses);
  const answerCount = storedResponses.length;
  const next = answerCount >= GOAL_EVALUATION_QUESTION_COUNT ? null : selectNextGoalEvaluationItem({ catalog, responses });
  if (answerCount < GOAL_EVALUATION_QUESTION_COUNT && !next) return { status: "pool_invalid" };
  const nextSession: LocalSession = {
    ...session,
    status: answerCount >= GOAL_EVALUATION_QUESTION_COUNT ? "completed" : "active",
    currentItemId: next?.itemId ?? null,
    questionIndex: answerCount >= GOAL_EVALUATION_QUESTION_COUNT ? GOAL_EVALUATION_QUESTION_COUNT : session.questionIndex + 1,
    answerCount,
    responses: storedResponses,
    findings: answerCount >= GOAL_EVALUATION_QUESTION_COUNT ? buildGoalEvaluationFindings(catalog, responses) : []
  };
  await writeLocalSession(nextSession);
  return { status: "ok", view: toView(nextSession, true) };
}

export async function abandonLocalGoalEvaluation(): Promise<EvaluationMutationResult> {
  await clearLocalSession();
  return { status: "ok", view: emptyReadyView(true) };
}
