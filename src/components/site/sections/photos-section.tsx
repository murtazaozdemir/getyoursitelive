"use client";

import { Camera } from "lucide-react";
import { useBusiness } from "@/lib/business-context";
import { useEditMode } from "@/lib/edit-mode-context";
import { EditableText } from "@/components/editable/editable-text";
import { EditableImage } from "@/components/editable/editable-image";
import { EditableList, moveInArray } from "@/components/editable/editable-list";
import { SectionBlock } from "@/components/editable/section-block";
import { SectionH2 } from "@/components/site/section-h2";
import type { PhotoItem } from "@/types/site";

function blankPhoto(): PhotoItem {
  return {
    id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    url: "",
    caption: "",
  };
}

export function PhotosSection() {
  const { photos } = useBusiness();
  const edit = useEditMode();

  function patchPhoto(i: number, patch: Partial<PhotoItem>) {
    if (!edit) return;
    const next = [...photos];
    next[i] = { ...next[i], ...patch };
    edit.updateField("photos", next);
  }

  return (
    <SectionBlock name="Photos" visibilityKey="showPhotos" isEmpty={photos.length === 0}>
      <section id="photos" className="photos-section section-shell">
        <div className="photos-section-inner">
          <div className="photos-section-head">
            <span className="photos-eyebrow">
              <Camera className="h-3.5 w-3.5" aria-hidden />
              <span>Gallery</span>
            </span>
            <h2 className="photos-title">
              <SectionH2 titleKey="photos" placeholder="Our Work" />
            </h2>
          </div>

          <div className="photos-grid">
            {edit ? (
              <EditableList
                items={photos}
                keyOf={(p) => p.id}
                addLabel="Add photo"
                onAdd={() => edit.updateField("photos", [...photos, blankPhoto()])}
                onRemove={(i) =>
                  edit.updateField("photos", photos.filter((_, idx) => idx !== i))
                }
                onMove={(i, dir) =>
                  edit.updateField("photos", moveInArray(photos, i, dir))
                }
                renderItem={(photo, i) => (
                  <figure className="photo-card">
                    <EditableImage
                      value={photo.url}
                      onCommit={(url) => patchPhoto(i, { url })}
                      uploadLabel="Upload photo"
                      className="photo-card-image-wrap"
                    >
                      {photo.url ? (
                        <img
                          src={photo.url}
                          alt={photo.caption || "Photo"}
                          className="photo-card-image"
                          loading="lazy"
                        />
                      ) : (
                        <span className="photo-card-placeholder">
                          <Camera className="h-8 w-8" aria-hidden />
                          <span>Upload a photo</span>
                        </span>
                      )}
                    </EditableImage>
                    <figcaption className="photo-card-caption">
                      <EditableText
                        value={photo.caption}
                        onCommit={(v) => patchPhoto(i, { caption: v })}
                        placeholder="Add a caption"
                      />
                    </figcaption>
                  </figure>
                )}
              />
            ) : (
              photos.map((photo) => (
                <figure key={photo.id} className="photo-card">
                  {photo.url && (
                    <img
                      src={photo.url}
                      alt={photo.caption || "Photo"}
                      className="photo-card-image"
                      loading="lazy"
                    />
                  )}
                  {photo.caption && (
                    <figcaption className="photo-card-caption">
                      {photo.caption}
                    </figcaption>
                  )}
                </figure>
              ))
            )}
          </div>
        </div>
      </section>
    </SectionBlock>
  );
}
