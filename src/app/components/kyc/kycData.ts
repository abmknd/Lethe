/**
 * The shape onboarding collects, separated from the component that renders it
 * so the steps can import the type without importing the flow.
 *
 * Selections are stored as INDICES into the lists in constants/kyc.ts and
 * constants/roles.ts, and mapped to strings once, at save time.
 */
export interface KYCData {
  city: string | null;
  timezone: string | null;
  objectives: Set<number>;
  meetWho: Set<number>;
  meetWhere: Set<number>;
  hobbies: Set<string>;
  intro: string;
  bioAsProfile: boolean;
  socials: {
    linkedin: string;
    twitter: string;
    website: string;
    github: string;
  };
  profileImage: string;
  /** Index into ROLE_OPTIONS. */
  userType: number | null;
  /** Free text, used when userType is the "Something else" family. What the
   *  user types is what persists — never the literal "Something else". */
  roleOther: string;
  /** Indices into MEETABLE_ROLE_OPTIONS. */
  preferredUserTypes: Set<number>;
  /** Supersedes preferredUserTypes: it is the answer that makes the list moot. */
  openToAnyone: boolean;
  availabilityDays: Set<number>;
  availabilityWindows: Set<string>;
}

export const emptyKYCData = (): KYCData => ({
  city: null,
  timezone: null,
  objectives: new Set(),
  meetWho: new Set(),
  meetWhere: new Set(),
  hobbies: new Set(),
  intro: '',
  bioAsProfile: true,
  socials: { linkedin: '', twitter: '', website: '', github: '' },
  profileImage: '',
  userType: null,
  roleOther: '',
  preferredUserTypes: new Set(),
  openToAnyone: false,
  availabilityDays: new Set(),
  availabilityWindows: new Set(),
});

export interface StepProps {
  data: KYCData;
  updateData: (updates: Partial<KYCData>) => void;
}
