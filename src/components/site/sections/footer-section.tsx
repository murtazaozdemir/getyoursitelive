"use client";

import { useBusiness } from "@/lib/business-context";
import { useEditMode } from "@/lib/edit-mode-context";
import { EditableText } from "@/components/editable/editable-text";

export function FooterSection() {
  const { businessInfo, footer } = useBusiness();
  const edit = useEditMode();
  const year = new Date().getFullYear();

  function patchInfo<K extends keyof typeof businessInfo>(key: K, value: (typeof businessInfo)[K]) {
    edit?.updateField("businessInfo", { ...businessInfo, [key]: value });
  }

  function patchFooter<K extends keyof typeof footer>(key: K, value: (typeof footer)[K]) {
    edit?.updateField("footer", { ...footer, [key]: value });
  }

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-6 text-sm md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-8 md:px-8">
        <div>
          <span className="font-semibold">
            {edit ? (
              <EditableText
                value={businessInfo.name}
                onCommit={(v) => patchInfo("name", v)}
                placeholder="Shop name"
              />
            ) : (
              businessInfo.name
            )}
          </span>
          {" — "}
          <span className="text-[var(--muted)]">
            {edit ? (
              <EditableText
                value={businessInfo.tagline}
                onCommit={(v) => patchInfo("tagline", v)}
                placeholder="Tagline"
              />
            ) : (
              businessInfo.tagline
            )}
          </span>
        </div>
        <div className="text-[var(--muted)]">
          <span className="font-semibold text-[var(--text)]">
            {edit ? (
              <EditableText
                value={footer.locationLabel}
                onCommit={(v) => patchFooter("locationLabel", v)}
                placeholder="Location"
              />
            ) : (
              footer.locationLabel
            )}
          </span>
          {": "}
          {edit ? (
            <EditableText
              value={businessInfo.address}
              onCommit={(v) => patchInfo("address", v)}
              placeholder="Address"
            />
          ) : (
            businessInfo.address
          )}
          {" · "}
          <span className="font-semibold text-[var(--text)]">
            {edit ? (
              <EditableText
                value={footer.phoneLabel}
                onCommit={(v) => patchFooter("phoneLabel", v)}
                placeholder="Phone"
              />
            ) : (
              footer.phoneLabel
            )}
          </span>
          {": "}
          {edit ? (
            <EditableText
              value={businessInfo.phone}
              onCommit={(v) => patchInfo("phone", v)}
              placeholder="Phone number"
            />
          ) : (
            <a href={`tel:${businessInfo.phone}`} className="hover:text-[var(--accent)]">
              {businessInfo.phone}
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-4 py-4 text-center text-sm text-[var(--muted)]">
        © {year} {businessInfo.name}.{" "}
        {edit ? (
          <EditableText
            value={footer.copyrightSuffix}
            onCommit={(v) => patchFooter("copyrightSuffix", v)}
            placeholder="All rights reserved."
          />
        ) : (
          footer.copyrightSuffix
        )}
      </div>
    </footer>
  );
}
