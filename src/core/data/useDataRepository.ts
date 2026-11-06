import { DataRepository } from '@/shared/types/contracts';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { LocalRepository } from './LocalRepository';
import { SupabaseRepository } from './SupabaseRepository';

let localRepository: LocalRepository | null = null;
let supabaseRepository: SupabaseRepository | null = null;

/** Returns the repository matching the current auth state (singletons, ARCHITECTURE 5.1). */
export function getDataRepository(): DataRepository {
  return useAuthStore.getState().isGuest ? getLocalRepository() : getSupabaseRepository();
}

export function getLocalRepository(): LocalRepository {
  localRepository ??= new LocalRepository();
  return localRepository;
}

export function getSupabaseRepository(): SupabaseRepository {
  supabaseRepository ??= new SupabaseRepository();
  return supabaseRepository;
}

/** React hook form: components re-render when the user switches between Guest and Authenticated. */
export function useDataRepository(): DataRepository {
  const isGuest = useAuthStore((state) => state.isGuest);
  return isGuest ? getLocalRepository() : getSupabaseRepository();
}
