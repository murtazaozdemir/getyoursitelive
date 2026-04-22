"use client";

import Image from "next/image";
import { useBusiness } from "@/lib/business-context";
import { useEditMode } from "@/lib/edit-mode-context";
import { EditableText } from "@/components/editable/editable-text";
import { EditableList, moveInArray } from "@/components/editable/editable-list";
import { EditableImage } from "@/components/editable/editable-image";
import { SectionBlock } from "@/components/editable/section-block";

export function AboutSection() {
  const { businessInfo, about } = useBusiness();
  const edit = useEditMode();

  function patchAbout<K extends keyof typeof about>(key: K, value: (typeof about)[K]) {
    edit?.updateField("about", { ...about, [key]: value });
  }

  function patchCard(i: number, patch: Partial<{ title: string; description: string }>) {
    const next = [...about.whyUsCards];
    next[i] = { ...next[i], ...patch };
    patchAbout("whyUsCards", next);
  }

  return (
    <>
      <SectionBlock name="About Story" visibilityKey="showAbout">
        <section id="about" className="section-shell mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-2 md:px-8">
          {edit ? (
            <EditableImage
              value={about.primaryImage}
              onCommit={(url) => patchAbout("primaryImage", url)}
              uploadLabel={about.primaryImage ? "Replace photo" : "Upload photo"}
              className="about-image-frame about-image-frame--primary relative min-h-96 overflow-hidden rounded-2xl block"
            >
              {about.primaryImage && (
                <Image
                  src={about.primaryImage}
                  alt={`${businessInfo.name} service bay`}
                  fill
                  className="about-image"
                />
              )}
            </EditableImage>
          ) : (
            <div className="about-image-frame about-image-frame--primary relative min-h-96 overflow-hidden rounded-2xl">
              {about.primaryImage && (
                <Image
                  src={about.primaryImage}
                  alt={`${businessInfo.name} service bay`}
                  fill
                  className="about-image"
                />
              )}
            </div>
          )}
          <div>
            <h2 className="section-title text-3xl font-bold">
              {edit ? (
                <EditableText
                  value={about.heading}
                  onCommit={(v) => patchAbout("heading", v)}
                  placeholder="About section heading"
                />
              ) : (
                about.heading
              )}
            </h2>
            <p className="mt-4 text-[var(--muted)]">
              {edit ? (
                <EditableText
                  value={about.narrative}
                  onCommit={(v) => patchAbout("narrative", v)}
                  multiline
                  placeholder="A few sentences about your shop"
                />
              ) : (
                about.narrative
              )}
            </p>
            {(edit || about.bullets.length > 0) && (
              <ol className="mt-6 grid gap-3">
                {edit ? (
                  <EditableList
                    items={about.bullets}
                    keyOf={(_, i) => `about-bullet-${i}`}
                    addLabel="Add bullet"
                    onAdd={() => patchAbout("bullets", [...about.bullets, "New bullet"])}
                    onRemove={(i) =>
                      patchAbout("bullets", about.bullets.filter((_, idx) => idx !== i))
                    }
                    onMove={(i, dir) =>
                      patchAbout("bullets", moveInArray(about.bullets, i, dir))
                    }
                    renderItem={(bullet, i) => (
                      <li>
                        {i + 1}.{" "}
                        <EditableText
                          value={bullet}
                          onCommit={(v) => {
                            const next = [...about.bullets];
                            next[i] = v;
                            patchAbout("bullets", next);
                          }}
                          placeholder="A differentiator"
                        />
                      </li>
                    )}
                  />
                ) : (
                  about.bullets.map((bullet, i) => (
                    <li key={bullet}>
                      {i + 1}. {bullet}
                    </li>
                  ))
                )}
              </ol>
            )}
          </div>
        </section>
      </SectionBlock>

      <SectionBlock
        name="About Why-Us Cards"
        visibilityKey="showAboutWhyUs"
        isEmpty={about.whyUsCards.length === 0}
      >
        <section className="section-shell mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-2 md:px-8">
          {edit ? (
            <EditableImage
              value={about.secondaryImage}
              onCommit={(url) => patchAbout("secondaryImage", url)}
              uploadLabel={about.secondaryImage ? "Replace photo" : "Upload photo"}
              className="about-image-frame about-image-frame--secondary relative min-h-96 overflow-hidden rounded-2xl block"
            >
              {about.secondaryImage && (
                <Image
                  src={about.secondaryImage}
                  alt={`${businessInfo.name} workshop`}
                  fill
                  className="about-image"
                />
              )}
            </EditableImage>
          ) : (
            <div className="about-image-frame about-image-frame--secondary relative min-h-96 overflow-hidden rounded-2xl">
              {about.secondaryImage && (
                <Image
                  src={about.secondaryImage}
                  alt={`${businessInfo.name} workshop`}
                  fill
                  className="about-image"
                />
              )}
            </div>
          )}
          <div className="grid gap-4">
            {edit ? (
              <EditableList
                items={about.whyUsCards}
                keyOf={(_, i) => `why-card-${i}`}
                addLabel="Add card"
                onAdd={() =>
                  patchAbout("whyUsCards", [
                    ...about.whyUsCards,
                    { title: "Title", description: "Description" },
                  ])
                }
                onRemove={(i) =>
                  patchAbout("whyUsCards", about.whyUsCards.filter((_, idx) => idx !== i))
                }
                onMove={(i, dir) =>
                  patchAbout("whyUsCards", moveInArray(about.whyUsCards, i, dir))
                }
                renderItem={(card, i) => (
                  <div className="content-card rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <p className="font-semibold">
                      <EditableText
                        value={card.title}
                        onCommit={(v) => patchCard(i, { title: v })}
                        placeholder="Title"
                      />
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      <EditableText
                        value={card.description}
                        onCommit={(v) => patchCard(i, { description: v })}
                        multiline
                        placeholder="Description"
                      />
                    </p>
                  </div>
                )}
              />
            ) : (
              about.whyUsCards.map((card) => (
                <div
                  key={card.title}
                  className="content-card rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <p className="font-semibold">{card.title}</p>
                  <p className="text-sm text-[var(--muted)]">{card.description}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </SectionBlock>
    </>
  );
}
