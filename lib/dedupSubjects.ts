import type { SubjectData } from '../types';

export function dedupSubjects(subjects: SubjectData[]): SubjectData[] {
  const seen = new Set<string>();
  return subjects.filter(s => {
    const key = s.name.trim().toLowerCase();
    return seen.has(key) ? false : (seen.add(key), true);
  });
}
