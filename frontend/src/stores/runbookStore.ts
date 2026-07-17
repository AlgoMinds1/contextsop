import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type StepStatus = "pending" | "active" | "completed" | "skipped";

export interface VerificationLog {
  status: "success" | "failure" | "running";
  message: string;
  timestamp: string;
}

export interface OfflineSyncEvent {
  executionId: string;
  completedSteps: string[];
  status: "running" | "completed" | "failed" | "aborted";
  variableState: Record<string, string>;
  timestamp: number;
}

export interface RunbookState {
  sopId: string | null;
  executionId: string | null;
  stepsProgress: Record<string, StepStatus>;
  variablesState: Record<string, string>;
  activeStepIndex: number;
  verificationLogs: Record<string, VerificationLog>;

  // Offline Caching states
  isOffline: boolean;
  offlineQueue: OfflineSyncEvent[];

  initializeRun: (
    sopId: string,
    stepIds: string[],
    initialVariables: Record<string, string>,
    executionId?: string | null,
  ) => void;
  setExecutionId: (executionId: string | null) => void;
  updateVariable: (name: string, value: string) => void;
  setStepStatus: (stepId: string, status: StepStatus) => void;
  setActiveStepIndex: (index: number) => void;
  setVerificationLog: (stepId: string, log: VerificationLog) => void;
  resetRun: () => void;

  // Offline syncing actions
  setOfflineStatus: (isOffline: boolean) => void;
  queueOfflineUpdate: (event: Omit<OfflineSyncEvent, "timestamp">) => void;
  clearOfflineQueue: () => void;
}

export const useRunbookStore = create<RunbookState>()(
  persist(
    (set) => ({
      sopId: null,
      executionId: null,
      stepsProgress: {},
      variablesState: {},
      activeStepIndex: 0,
      verificationLogs: {},

      isOffline: false,
      offlineQueue: [],

      initializeRun: (sopId, stepIds, initialVariables, executionId = null) =>
        set((state) => {
          if (state.sopId === sopId) {
            return {};
          }
          const progress: Record<string, StepStatus> = {};
          stepIds.forEach((id, idx) => {
            progress[id] = idx === 0 ? "active" : "pending";
          });
          return {
            sopId,
            executionId,
            stepsProgress: progress,
            variablesState: initialVariables,
            activeStepIndex: 0,
            verificationLogs: {},
          };
        }),

      setExecutionId: (executionId) => set(() => ({ executionId })),

      updateVariable: (name, value) =>
        set((state) => ({
          variablesState: { ...state.variablesState, [name]: value },
        })),

      setStepStatus: (stepId, status) =>
        set((state) => ({
          stepsProgress: { ...state.stepsProgress, [stepId]: status },
        })),

      setActiveStepIndex: (index) =>
        set(() => ({
          activeStepIndex: index,
        })),

      setVerificationLog: (stepId, log) =>
        set((state) => ({
          verificationLogs: { ...state.verificationLogs, [stepId]: log },
        })),

      resetRun: () =>
        set(() => ({
          sopId: null,
          executionId: null,
          stepsProgress: {},
          variablesState: {},
          activeStepIndex: 0,
          verificationLogs: {},
          offlineQueue: [],
        })),

      setOfflineStatus: (isOffline) => set(() => ({ isOffline })),

      queueOfflineUpdate: (event) =>
        set((state) => {
          // Filter out older duplicate sync actions for this execution to prevent database spamming
          const filtered = state.offlineQueue.filter(
            (q) => q.executionId !== event.executionId,
          );
          return {
            offlineQueue: [...filtered, { ...event, timestamp: Date.now() }],
          };
        }),

      clearOfflineQueue: () => set(() => ({ offlineQueue: [] })),
    }),
    {
      name: "active-runbook-execution",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
