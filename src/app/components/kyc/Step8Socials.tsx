import type { KYCData, StepProps } from './kycData';
import { SOCIAL_FIELDS } from '../../constants/kyc';
import { FieldInput, FieldShell, IconTile, StepHeader } from '../../../rebrand/primitives';

export function Step8Socials({ data, updateData }: StepProps) {
  const update = (platform: keyof KYCData['socials'], value: string) => {
    updateData({ socials: { ...data.socials, [platform]: value } });
  };

  return (
    <div>
      <StepHeader
        label="YOUR PRESENCE"
        heading={
          <>
            Let others
            <br />
            <span className="text-[var(--color-blue-600)]">find you.</span>
          </>
        }
        body="Optional. Shown on your match profile so they can get a sense of your work before you meet."
      />

      <div className="flex flex-col gap-[8px]">
        {SOCIAL_FIELDS.map((field) => (
          <FieldShell key={field.key}>
            {/* Text marks, not brand glyphs: a row of logos is five more
                typefaces and five licences. */}
            <IconTile size={28}>{field.mark}</IconTile>
            <span className="w-[72px] shrink-0 text-[12px] font-medium leading-[120%] tracking-[0.5px] text-[var(--color-black-500)]">
              {field.label}
            </span>
            <FieldInput
              type="text"
              value={data.socials[field.key]}
              onChange={(e) => update(field.key, e.target.value)}
              placeholder={field.placeholder}
              aria-label={field.label}
            />
          </FieldShell>
        ))}
      </div>

      <p className="mt-[16px] text-center text-[13px] leading-[18px] text-[var(--color-black-500)]">
        All fields are optional. You can update these from your profile at any time.
      </p>
    </div>
  );
}
