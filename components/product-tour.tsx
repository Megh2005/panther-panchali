"use client";

import { useState } from "react";
import {
  LuArrowLeft,
  LuArrowRight,
  LuCheck,
  LuSparkles,
  LuX,
} from "react-icons/lu";

interface TourStep {
  title: string;
  subtitle: string;
  description: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "The Living Canvas",
    subtitle: "Step 01 · Overview",
    description:
      "A sensory co-creation experience designed to let you shape and explore the living memory and atmosphere of Kolkata.",
  },
  {
    title: "Calibrate Emotional Mood",
    subtitle: "Step 02 · Emotion",
    description:
      "Select your emotional resonance—from monsoon melancholy on shuttered windows to vibrant adda debates over hot chai.",
  },
  {
    title: "Set Atmospheric Light",
    subtitle: "Step 03 · Time of Day",
    description:
      "Pick the hour of the city: misty dawn tram bells, slanted afternoon light, yellow twilight lamps, or midnight quiet.",
  },
  {
    title: "Cultural Crossroads",
    subtitle: "Step 04 · Setting",
    description:
      "Choose an iconic landmark such as the Kumartuli clay studios or College Street bookstalls to synthesize bespoke literary prose and 35mm visuals.",
  },
];

export default function ProductTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleOpen = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  return (
    <>
      {/* Tour Launcher Pill */}
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 rounded-full border border-[#B5532F]/40 bg-[#EDE4D3] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#B5532F] transition-all hover:bg-[#B5532F] hover:text-[#FFFFFF] shadow-xs cursor-pointer"
        style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        aria-label="Start guided tour"
      >
        <LuSparkles size={14} />
        <span>Experience Guide</span>
      </button>

      {/* Tour Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B1A17]/40 backdrop-blur-[3px] animate-fadeIn">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tour-modal-title"
            className="relative w-full max-w-105 rounded-2xl border border-[#6B6458]/25 bg-[#EDE4D3] p-7 text-left shadow-[0_16px_48px_-8px_rgba(27,26,23,0.3),0_0_0_1px_rgba(107,100,88,0.15)] animate-scaleUp"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-[#6B6458] hover:text-[#B5532F] hover:bg-[#1B1A17]/5 transition-colors cursor-pointer"
              aria-label="Close guide"
            >
              <LuX size={18} />
            </button>

            {/* Step Counter Pill */}
            <div className="flex items-center gap-2">
              <span
                className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                {step.subtitle}
              </span>
              <span className="text-xs text-[#6B6458]/50">·</span>
              <span
                className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[#6B6458]"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                {currentStep + 1} of {TOUR_STEPS.length}
              </span>
            </div>

            {/* Step Title */}
            <h2
              id="tour-modal-title"
              className="mt-2 text-2xl font-light tracking-normal text-[#1B1A17]"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontVariationSettings: '"opsz" 36, "SOFT" 85, "WONK" 1',
              }}
            >
              {step.title}
            </h2>

            {/* Step Description */}
            <p
              className="mt-3 text-sm italic leading-relaxed text-[#6B6458]"
              style={{ fontFamily: "var(--font-newsreader), serif" }}
            >
              {step.description}
            </p>

            {/* Progress Dots */}
            <div className="mt-6 flex items-center gap-1.5">
              {TOUR_STEPS.map((tourStep, idx) => (
                <div
                  key={tourStep.title}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? "w-6 bg-[#B5532F]"
                      : idx < currentStep
                        ? "w-2 bg-[#B5532F]/50"
                        : "w-2 bg-[#6B6458]/30"
                  }`}
                />
              ))}
            </div>

            {/* Modal Footer Controls */}
            <div className="mt-6 pt-4 border-t border-[#6B6458]/15 flex items-center justify-between gap-3">
              {/* Prev Button */}
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#6B6458]/30 bg-[#F6F1E6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1B1A17] transition-all hover:bg-[#EDE4D3] hover:text-[#B5532F] hover:border-[#B5532F] cursor-pointer"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  <LuArrowLeft size={14} />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {/* Next / Complete Button - HIGH CONTRAST Terracotta Background with Crisp White Text */}
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-full border border-[#B5532F] bg-[#B5532F] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-[#FFFFFF] shadow-[0_2px_10px_rgba(181,83,47,0.35)] transition-all hover:bg-[#1B1A17] hover:border-[#1B1A17] hover:text-[#FFFFFF] cursor-pointer"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                <span>{isLast ? "Done" : "Next"}</span>
                {isLast ? <LuCheck size={14} /> : <LuArrowRight size={14} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
