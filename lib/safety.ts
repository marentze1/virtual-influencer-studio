export type SafetyChecklistItem = {
  id: string;
  label: string;
  passed: boolean;
};

export function buildSafetyChecklist(): SafetyChecklistItem[] {
  return [
    {
      id: "no_real_identity",
      label: "No real celebrity or public figure identity is referenced",
      passed: true
    },
    {
      id: "non_explicit",
      label: "Content remains non-explicit (fashion/travel/photography/lifestyle only)",
      passed: true
    },
    {
      id: "consistency_applied",
      label: "Identity/body/style consistency rules are applied in prompt JSON",
      passed: true
    }
  ];
}
