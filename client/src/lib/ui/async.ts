import { useAppStore } from "@/store/store";

// React hook helper to run async actions with unified loading + toast feedback
export function useAsyncAction() {
  const { startLoading, stopLoading, setToast, isLoading } = useAppStore();
  async function run<T>(key: string, message: string, fn: () => Promise<T>, successMsg?: string, errorMsg?: string): Promise<T | undefined> {
    if (isLoading(key)) return undefined;
    startLoading(key, message);
    try {
      const result = await fn();
      if (successMsg) setToast(successMsg);
      return result;
    } catch (e) {
      if (errorMsg) setToast(errorMsg);
      return undefined;
    } finally {
      stopLoading(key);
    }
  }
  return { run, isLoading };
}
