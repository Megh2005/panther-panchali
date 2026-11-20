"use client";

import Image from "next/image";
import { useState } from "react";
import {
  LuArrowLeft,
  LuArrowRight,
  LuCheck,
  LuCompass,
  LuFileText,
  LuFilm,
  LuGitFork,
  LuLoaderCircle,
  LuMail,
  LuMaximize,
  LuRepeat,
  LuUmbrella,
} from "react-icons/lu";
import type {
  Chapter,
  CulturalCuriosity,
  Emotion,
  JourneyThread,
  TimeOfDay,
  TransformationType,
} from "@/lib/models/journey";

const EMOTIONS: Array<{ label: Emotion; desc: string }> = [
  {
    label: "Monsoon Melancholy",
    desc: "Rain on ancient green wooden shutters",
  },
  { label: "Nostalgic Solitude", desc: "Echoes along empty colonial porticos" },
  {
    label: "Vibrant Adda",
    desc: "Steam, animated debates, clinking clay cups",
  },
  { label: "Devotional Awe", desc: "Dhak drums echoing from clay sculptors" },
  {
    label: "Quiet Reverie",
    desc: "Watching slow ferries glide past the ghats",
  },
];

const TIMES_OF_DAY: Array<{ label: TimeOfDay; desc: string }> = [
  { label: "Dawn", desc: "First tram bells in blue mist" },
  { label: "Afternoon", desc: "Slanted sun over dusty bookstalls" },
  { label: "Twilight", desc: "Yellow gas lamps reflecting on water" },
  { label: "Midnight", desc: "Empty avenues & boiling tea kettles" },
];

const CURIOSITIES: Array<{ label: CulturalCuriosity; desc: string }> = [
  {
    label: "Kumartuli Clay Sculptors",
    desc: "Straw and river silt turning into goddesses",
  },
  {
    label: "College Street Old Bookstalls",
    desc: "Centuries of poetry stacked to the sky",
  },
  {
    label: "Bagbazar Ghat Ferry Bells",
    desc: "Crossing the muddy currents of the Hooghly",
  },
  {
    label: "Midnight Chai at Shyambazar",
    desc: "Earthen pots shattered on wet cobblestones",
  },
  {
    label: "Victoria Memorial Morning Mist",
    desc: "White marble dissolving into gray clouds",
  },
  {
    label: "Durga Puja Pandal Procession",
    desc: "Vermilion clouds, incense, and ecstatic brass",
  },
];

export default function LivingCanvasExperience() {
  // 3-step wizard state (1: Mood -> 2: Hour -> 3: Setting)
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);

  const [selectedEmotion, setSelectedEmotion] =
    useState<Emotion>("Monsoon Melancholy");
  const [selectedTime, setSelectedTime] = useState<TimeOfDay>("Twilight");
  const [selectedLocation, setSelectedLocation] = useState<CulturalCuriosity>(
    "Kumartuli Clay Sculptors",
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isTransforming, setIsTransforming] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<JourneyThread | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [branchPromptSeed, setBranchPromptSeed] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email modal state
  const [emailInput, setEmailInput] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // 1. Invoke Story & Atmospheric Art Generation
  const handleInvokeCanvas = async (
    requestedBranchPromptSeed?: string,
    parentChapterId?: string,
  ) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/story/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emotion: selectedEmotion,
          timeOfDay: selectedTime,
          location: selectedLocation,
          threadId: activeThread?.id,
          branchPromptSeed: requestedBranchPromptSeed ?? branchPromptSeed,
          parentChapterId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "The story could not be generated.");
      }
      setActiveThread(data.thread);
      setCurrentChapter(data.chapter);
      setBranchPromptSeed(null);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "The story could not be generated.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 2. In-Scene Atmospheric Transformations
  const handleTransform = async (type: TransformationType, prompt?: string) => {
    if (!activeThread || !currentChapter || isTransforming) return;
    setIsTransforming(type);

    try {
      const res = await fetch("/api/canvas/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: activeThread.id,
          chapterId: currentChapter.chapterId,
          transformationType: type,
          prompt,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Transformation failed.");
      }
      setCurrentChapter((prev) =>
        prev
          ? {
              ...prev,
              currentImageUrl: data.transformedUrl,
              transformations: [...prev.transformations, data.action],
            }
          : null,
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Transformation failed.",
      );
    } finally {
      setIsTransforming(null);
    }
  };

  // 3. Fork Current Thread
  const handleForkThread = async () => {
    if (!activeThread) return;
    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          forkThreadId: activeThread.id,
          reviewerName: "Explorer",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveThread(data.thread);
      }
    } catch (err) {
      console.error("Fork failed:", err);
    }
  };

  // 4. Send Journey by Email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !emailInput) return;
    setIsSendingEmail(true);
    setEmailStatus(null);

    try {
      const res = await fetch("/api/export/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: activeThread.id,
          recipientEmail: emailInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailStatus("Dispatched successfully to your inbox.");
        setTimeout(() => setShowEmailModal(false), 2000);
      } else {
        setEmailStatus(data.error || "Email failed.");
      }
    } catch {
      setEmailStatus("Could not dispatch email.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleReset = () => {
    setActiveThread(null);
    setCurrentChapter(null);
    setBranchPromptSeed(null);
    setErrorMessage(null);
    setFormStep(1);
  };

  return (
    <section
      className="w-full max-w-[80vw] mx-auto py-6 text-center"
      aria-label="Interactive Canvas"
    >
      {!currentChapter ? (
        <div className="mx-auto w-full max-w-165 rounded-3xl border border-[#6B6458]/20 bg-[#EDE4D3] p-6 sm:p-9 shadow-[0_8px_32px_rgba(27,26,23,0.06),0_18px_48px_rgba(227,194,122,0.16)] transition-all">
          {errorMessage && (
            <p
              className="mb-5 rounded-xl border border-[#B5532F]/30 bg-[#B5532F]/10 px-4 py-3 text-sm text-[#B5532F]"
              role="alert"
            >
              {errorMessage}
            </p>
          )}
          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-between pb-6 border-b border-[#6B6458]/15">
            <button
              type="button"
              onClick={() => setFormStep(1)}
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors cursor-pointer ${
                formStep === 1
                  ? "text-[#B5532F]"
                  : "text-[#6B6458] hover:text-[#1B1A17]"
              }`}
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  formStep === 1
                    ? "bg-[#B5532F] text-[#F6F1E6] shadow-sm"
                    : formStep > 1
                      ? "bg-[#B5532F]/15 text-[#B5532F] border border-[#B5532F]/40"
                      : "bg-[#F6F1E6] text-[#6B6458] border border-[#6B6458]/25"
                }`}
              >
                {formStep > 1 ? <LuCheck size={13} /> : "1"}
              </span>
              <span>Mood</span>
            </button>

            <div
              className={`h-px flex-1 mx-3 sm:mx-6 transition-colors duration-300 ${formStep >= 2 ? "bg-[#B5532F]" : "bg-[#6B6458]/25"}`}
            />

            <button
              type="button"
              onClick={() => setFormStep(2)}
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors cursor-pointer ${
                formStep === 2
                  ? "text-[#B5532F]"
                  : "text-[#6B6458] hover:text-[#1B1A17]"
              }`}
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  formStep === 2
                    ? "bg-[#B5532F] text-[#F6F1E6] shadow-sm"
                    : formStep > 2
                      ? "bg-[#B5532F]/15 text-[#B5532F] border border-[#B5532F]/40"
                      : "bg-[#F6F1E6] text-[#6B6458] border border-[#6B6458]/25"
                }`}
              >
                {formStep > 2 ? <LuCheck size={13} /> : "2"}
              </span>
              <span>Hour</span>
            </button>

            <div
              className={`h-px flex-1 mx-3 sm:mx-6 transition-colors duration-300 ${formStep >= 3 ? "bg-[#B5532F]" : "bg-[#6B6458]/25"}`}
            />

            <button
              type="button"
              onClick={() => setFormStep(3)}
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors cursor-pointer ${
                formStep === 3
                  ? "text-[#B5532F]"
                  : "text-[#6B6458] hover:text-[#1B1A17]"
              }`}
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  formStep === 3
                    ? "bg-[#B5532F] text-[#F6F1E6] shadow-sm"
                    : "bg-[#F6F1E6] text-[#6B6458] border border-[#6B6458]/25"
                }`}
              >
                3
              </span>
              <span>Setting</span>
            </button>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* STEP 1: CHOOSE EMOTION                                       */}
          {/* ------------------------------------------------------------ */}
          {formStep === 1 && (
            <div className="pt-6">
              <span
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                Step 01 of 03 · Emotional Tone
              </span>
              <h2
                className="mt-1.5 text-2xl sm:text-3xl font-light tracking-normal text-[#1B1A17]"
                style={{
                  fontFamily: "var(--font-fraunces), serif",
                  fontVariationSettings: '"opsz" 36, "SOFT" 85, "WONK" 1',
                }}
              >
                How does Kolkata call to you?
              </h2>
              <p
                className="mt-1 text-sm italic text-[#6B6458] max-w-115 mx-auto leading-relaxed"
                style={{ fontFamily: "var(--font-newsreader), serif" }}
              >
                Select the emotional mood that will color the narrative prose
                and atmospheric imagery.
              </p>

              <div className="mt-6 flex flex-col gap-2.5 text-left">
                {EMOTIONS.map((emo) => {
                  const isSelected = selectedEmotion === emo.label;
                  return (
                    <button
                      key={emo.label}
                      type="button"
                      onClick={() => setSelectedEmotion(emo.label)}
                      className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-[#F6F1E6] border-[#B5532F] ring-2 ring-[#B5532F]/50 shadow-sm"
                          : "bg-[#F6F1E6]/70 border-[#6B6458]/20 hover:border-[#B5532F]/40 hover:bg-[#F6F1E6]"
                      }`}
                    >
                      <div className="flex-1 pr-3">
                        <span
                          className="text-base font-light tracking-normal text-[#1B1A17]"
                          style={{ fontFamily: "var(--font-fraunces), serif" }}
                        >
                          {emo.label}
                        </span>
                        <p
                          className="mt-0.5 text-xs italic text-[#6B6458]"
                          style={{
                            fontFamily: "var(--font-newsreader), serif",
                          }}
                        >
                          {emo.desc}
                        </p>
                      </div>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                          isSelected
                            ? "bg-[#B5532F] text-[#F6F1E6] border-[#B5532F]"
                            : "border-[#6B6458]/30 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Step 1 Actions */}
              <div className="mt-7 pt-5 border-t border-[#6B6458]/15 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setFormStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-[0.16em] cursor-pointer bg-[#B5532F] text-[#FFFFFF] hover:bg-[#1B1A17] hover:text-[#FFFFFF] border border-[#B5532F] transition-all"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  <span>Continue to Hour</span>
                  <LuArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STEP 2: CHOOSE TIME OF DAY                                   */}
          {/* ------------------------------------------------------------ */}
          {formStep === 2 && (
            <div className="pt-6">
              <span
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                Step 02 of 03 · Atmospheric Light
              </span>
              <h2
                className="mt-1.5 text-2xl sm:text-3xl font-light tracking-normal text-[#1B1A17]"
                style={{
                  fontFamily: "var(--font-fraunces), serif",
                  fontVariationSettings: '"opsz" 36, "SOFT" 85, "WONK" 1',
                }}
              >
                What hour is it in the city?
              </h2>
              <p
                className="mt-1 text-sm italic text-[#6B6458] max-w-115 mx-auto leading-relaxed"
                style={{ fontFamily: "var(--font-newsreader), serif" }}
              >
                Choose the hour to illuminate the river mist, warm sodium lamps,
                or quiet avenues.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {TIMES_OF_DAY.map((time) => {
                  const isSelected = selectedTime === time.label;
                  return (
                    <button
                      key={time.label}
                      type="button"
                      onClick={() => setSelectedTime(time.label)}
                      className={`flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-[#F6F1E6] border-[#B5532F] ring-2 ring-[#B5532F]/50 shadow-sm"
                          : "bg-[#F6F1E6]/70 border-[#6B6458]/20 hover:border-[#B5532F]/40 hover:bg-[#F6F1E6]"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className="text-base font-light tracking-normal text-[#1B1A17]"
                          style={{ fontFamily: "var(--font-fraunces), serif" }}
                        >
                          {time.label}
                        </span>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-bold ${
                            isSelected
                              ? "bg-[#B5532F] text-[#F6F1E6] border-[#B5532F]"
                              : "border-[#6B6458]/30 text-transparent"
                          }`}
                        >
                          ✓
                        </span>
                      </div>
                      <p
                        className="mt-2 text-xs italic text-[#6B6458]"
                        style={{ fontFamily: "var(--font-newsreader), serif" }}
                      >
                        {time.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Step 2 Actions */}
              <div className="mt-7 pt-5 border-t border-[#6B6458]/15 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setFormStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium uppercase tracking-[0.14em] text-[#6B6458] hover:text-[#1B1A17] transition-colors cursor-pointer"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  <LuArrowLeft size={14} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-[0.16em] cursor-pointer bg-[#B5532F] text-[#FFFFFF] hover:bg-[#1B1A17] hover:text-[#FFFFFF] border border-[#B5532F] transition-all"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  <span>Continue to Setting</span>
                  <LuArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STEP 3: CHOOSE CULTURAL LANDMARK                             */}
          {/* ------------------------------------------------------------ */}
          {formStep === 3 && (
            <div className="pt-6">
              <span
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                Step 03 of 03 · Cultural Crossroads
              </span>
              <h2
                className="mt-1.5 text-2xl sm:text-3xl font-light tracking-normal text-[#1B1A17]"
                style={{
                  fontFamily: "var(--font-fraunces), serif",
                  fontVariationSettings: '"opsz" 36, "SOFT" 85, "WONK" 1',
                }}
              >
                Where will your curiosity wander?
              </h2>

              {/* Selected Choices Summary */}
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#B5532F]/25 bg-[#F6F1E6] px-4 py-1 text-xs text-[#1B1A17]">
                <span className="font-semibold text-[#B5532F]">
                  {selectedEmotion}
                </span>
                <span className="text-[#6B6458]">·</span>
                <span className="font-semibold text-[#B5532F]">
                  {selectedTime}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {CURIOSITIES.map((curiosity) => {
                  const isSelected = selectedLocation === curiosity.label;
                  return (
                    <button
                      key={curiosity.label}
                      type="button"
                      onClick={() => setSelectedLocation(curiosity.label)}
                      className={`flex flex-col justify-between p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-[#F6F1E6] border-[#B5532F] ring-2 ring-[#B5532F]/50 shadow-sm"
                          : "bg-[#F6F1E6]/70 border-[#6B6458]/20 hover:border-[#B5532F]/40 hover:bg-[#F6F1E6]"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className="text-sm font-light tracking-normal text-[#1B1A17]"
                          style={{ fontFamily: "var(--font-fraunces), serif" }}
                        >
                          {curiosity.label}
                        </span>
                        <span
                          className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                            isSelected
                              ? "bg-[#B5532F] text-[#F6F1E6] border-[#B5532F]"
                              : "border-[#6B6458]/30 text-transparent"
                          }`}
                        >
                          ✓
                        </span>
                      </div>
                      <p
                        className="mt-1.5 text-xs italic text-[#6B6458] leading-relaxed"
                        style={{ fontFamily: "var(--font-newsreader), serif" }}
                      >
                        {curiosity.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Step 3 Actions */}
              <div className="mt-7 pt-5 border-t border-[#6B6458]/15 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setFormStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium uppercase tracking-[0.14em] text-[#6B6458] hover:text-[#1B1A17] transition-colors cursor-pointer"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  <LuArrowLeft size={14} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInvokeCanvas()}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-semibold uppercase tracking-[0.18em] shadow-md transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer bg-[#B5532F] text-[#FFFFFF] hover:bg-[#1B1A17] hover:text-[#FFFFFF] border border-[#B5532F]"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  {isLoading ? (
                    <>
                      <LuLoaderCircle
                        size={16}
                        className="animate-spin text-[#F6F1E6]"
                      />
                      <span>Synthesizing Scene…</span>
                    </>
                  ) : (
                    <>
                      <LuCompass size={16} />
                      <span>Invoke The Canvas</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-7 w-full">
          {/* Top Actions: Reset, PDF Export, Fork, Email */}
          <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-190 border-b border-[#6B6458]/18 pb-4">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] font-(family-name:--font-instrument) text-[#6B6458] hover:text-[#B5532F] transition-colors cursor-pointer"
            >
              <LuArrowLeft size={14} />
              <span>New Story</span>
            </button>
            <div className="flex flex-wrap items-center gap-2">
              {activeThread && (
                <a
                  href={`/thread/${activeThread.id}/export`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#6B6458]/20 bg-[#EDE4D3] px-3.5 py-1.5 text-xs font-(family-name:--font-instrument) text-[#1B1A17] hover:border-[#B5532F] transition-colors"
                >
                  <LuFileText size={14} className="text-[#B5532F]" />
                  <span>Storybook PDF</span>
                </a>
              )}
              <button
                type="button"
                onClick={handleForkThread}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#6B6458]/20 bg-[#EDE4D3] px-3.5 py-1.5 text-xs font-(family-name:--font-instrument) text-[#1B1A17] hover:border-[#B5532F] transition-colors cursor-pointer"
              >
                <LuGitFork size={14} className="text-[#B5532F]" />
                <span>Fork ({activeThread?.forkCount || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#6B6458]/20 bg-[#EDE4D3] px-3.5 py-1.5 text-xs font-(family-name:--font-instrument) text-[#1B1A17] hover:border-[#B5532F] transition-colors cursor-pointer"
              >
                <LuMail size={14} className="text-[#B5532F]" />
                <span>Email Reel</span>
              </button>
            </div>
          </div>

          {/* Artwork Stage with In-Scene Visual Filters */}
          <div className="relative w-full max-w-190 overflow-hidden rounded-2xl border border-[#6B6458]/20 bg-[#EDE4D3] shadow-[0_8px_32px_rgba(27,26,23,0.08),0_18px_48px_rgba(227,194,122,0.2)]">
            {/* Visual Media Element */}
            <Image
              src={currentChapter.currentImageUrl}
              alt={currentChapter.location}
              width={1280}
              height={720}
              className="w-full aspect-video object-cover transition-all duration-700"
            />

            {/* In-Scene Status Pill */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-[#1B1A17]/70 backdrop-blur-md px-3.5 py-1.5 text-xs text-[#F6F1E6] font-(family-name:--font-instrument)">
              <span className="w-2 h-2 rounded-full bg-[#E3C27A] animate-pulse" />
              <span>Atmospheric Canvas · Live</span>
            </div>

            {/* In-Scene Transformation Toolbar */}
            <div className="flex flex-wrap items-center justify-center gap-2 p-3 bg-[#EDE4D3] border-t border-[#6B6458]/18">
              <button
                type="button"
                disabled={!!isTransforming}
                onClick={() => handleTransform("gen_fill")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#6B6458]/20 bg-[#F6F1E6] px-3 py-2 text-xs font-medium font-(family-name:--font-instrument) text-[#1B1A17] hover:border-[#B5532F] hover:shadow-xs transition-all cursor-pointer"
              >
                <LuMaximize size={14} className="text-[#B5532F]" />
                <span>Expand Alleyways (21:9 Pan)</span>
              </button>

              <button
                type="button"
                disabled={!!isTransforming}
                onClick={() =>
                  handleTransform(
                    "gen_replace",
                    "from_empty street;to_vibrant Durga Puja festivities with vermilion dust and beating dhak drums",
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#6B6458]/20 bg-[#F6F1E6] px-3 py-2 text-xs font-medium font-(family-name:--font-instrument) text-[#1B1A17] hover:border-[#B5532F] hover:shadow-xs transition-all cursor-pointer"
              >
                <LuRepeat size={14} className="text-[#B5532F]" />
                <span>Transform into Durga Puja</span>
              </button>

              <button
                type="button"
                disabled={!!isTransforming}
                onClick={() => handleTransform("celluloid")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#6B6458]/20 bg-[#F6F1E6] px-3 py-2 text-xs font-medium font-(family-name:--font-instrument) text-[#1B1A17] hover:border-[#B5532F] hover:shadow-xs transition-all cursor-pointer"
              >
                <LuFilm size={14} className="text-[#6B6458]" />
                <span>35mm Film Grain</span>
              </button>

              <button
                type="button"
                disabled={!!isTransforming}
                onClick={() => handleTransform("monsoon_overlay")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#6B6458]/20 bg-[#F6F1E6] px-3 py-2 text-xs font-medium font-(family-name:--font-instrument) text-[#1B1A17] hover:border-[#B5532F] hover:shadow-xs transition-all cursor-pointer"
              >
                <LuUmbrella size={14} className="text-[#6B6458]" />
                <span>Monsoon Rain Mist</span>
              </button>
            </div>
          </div>

          {/* First-Person Prose Card */}
          <article className="w-full max-w-190 rounded-2xl border border-[#6B6458]/18 bg-[#EDE4D3] p-7 sm:p-9 text-center shadow-sm">
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              {currentChapter.location} · {currentChapter.timeOfDay}
            </span>
            <h3
              className="mt-2 text-2xl sm:text-3xl font-light tracking-normal text-[#1B1A17]"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontVariationSettings: '"opsz" 36, "SOFT" 85, "WONK" 1',
              }}
            >
              {activeThread?.title}
            </h3>

            <div
              className="mt-4 space-y-4 text-base sm:text-lg italic tracking-normal leading-relaxed text-[#1B1A17] max-w-150 mx-auto whitespace-pre-line text-balance"
              style={{ fontFamily: "var(--font-newsreader), serif" }}
            >
              {currentChapter.storyProse}
            </div>

            {/* Branching Choices */}
            {currentChapter.branches?.length > 0 && (
              <div className="mt-7 border-t border-[#6B6458]/18 pt-5">
                <span
                  className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#6B6458] mb-3.5"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  Where will your curiosity wander next?
                </span>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  {currentChapter.branches.map((branch) => (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => {
                        handleInvokeCanvas(
                          branch.promptSeed,
                          currentChapter.chapterId,
                        );
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#6B6458]/25 bg-[#F6F1E6] hover:border-[#B5532F] text-xs font-medium tracking-normal text-[#1B1A17] transition-all cursor-pointer"
                      style={{
                        fontFamily: "var(--font-instrument), sans-serif",
                      }}
                    >
                      &rarr; {branch.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B1A17]/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-100 rounded-2xl border border-[#6B6458]/20 bg-[#EDE4D3] p-6 text-center shadow-2xl">
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              Dispatch Journey
            </span>
            <h4
              className="mt-1.5 text-2xl font-light tracking-normal text-[#1B1A17]"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              Receive in Your Inbox
            </h4>
            <p
              className="mt-1 text-xs italic text-[#6B6458]"
              style={{ fontFamily: "var(--font-newsreader), serif" }}
            >
              Receive your journey thread, sensory prose, and animated story
              reel.
            </p>

            <form
              onSubmit={handleSendEmail}
              className="mt-5 flex flex-col gap-3"
            >
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@email.com"
                className="w-full rounded-xl border border-[#6B6458]/25 bg-[#F6F1E6] px-4 py-2.5 text-sm text-[#1B1A17] focus:outline-none focus:ring-2 focus:ring-[#B5532F]"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              />

              {emailStatus && (
                <p
                  className="text-xs text-[#B5532F]"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  {emailStatus}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-medium uppercase tracking-widest text-[#6B6458] hover:text-[#1B1A17] cursor-pointer"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-widest cursor-pointer bg-[#B5532F] text-[#FFFFFF] shadow-sm transition-all hover:bg-[#1B1A17] disabled:opacity-50"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  {isSendingEmail ? "Dispatching…" : "Send Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
