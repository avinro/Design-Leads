"use client";

import {
  useEffect,
  useRef,
  useState,
  createElement,
  useMemo,
  useCallback,
  forwardRef,
  type ElementType,
  type ReactNode,
} from "react";
import { gsap } from "gsap";

// ---------------------------------------------------------------------------
// TextType — typewriter effect component
//
// TypeScript port of React Bits TextType (JS original).
// Key changes from the source:
//   - Full TypeScript prop types
//   - No separate CSS file — Tailwind utilities only
//   - Internal prefers-reduced-motion gate: when the user has requested
//     reduced motion the component renders all phrases immediately as static
//     text and skips every GSAP tween and setTimeout typing loop.
//   - gsap.killTweensOf cleanup on unmount (original leaks the cursor tween)
// ---------------------------------------------------------------------------

export interface TextTypeProps {
  text: string | string[];
  as?: ElementType;
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  className?: string;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: string | ReactNode;
  cursorBlinkDuration?: number;
  cursorClassName?: string;
  textColors?: string[];
  variableSpeed?: { min: number; max: number };
  onSentenceComplete?: (sentence: string, index: number) => void;
  startOnVisible?: boolean;
  reverseMode?: boolean;
}

export const TextType = forwardRef<HTMLElement, TextTypeProps>(
  (
    {
      text,
      as: Component = "div",
      typingSpeed = 50,
      initialDelay = 0,
      pauseDuration = 2000,
      deletingSpeed = 30,
      loop = true,
      className = "",
      showCursor = true,
      hideCursorWhileTyping = false,
      cursorCharacter = "|",
      cursorBlinkDuration = 0.5,
      cursorClassName = "",
      textColors = [],
      variableSpeed,
      onSentenceComplete,
      startOnVisible = false,
      reverseMode = false,
      ...props
    },
    ref,
  ) => {
    const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

    const prefersReducedMotion = useRef(false);
    useEffect(() => {
      prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }, []);

    const [displayedText, setDisplayedText] = useState("");
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(!startOnVisible);

    const cursorRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(containerRef.current);
      } else {
        ref.current = containerRef.current;
      }
    }, [ref]);

    const getRandomSpeed = useCallback(() => {
      if (!variableSpeed) return typingSpeed;
      const { min, max } = variableSpeed;
      return Math.random() * (max - min) + min;
    }, [variableSpeed, typingSpeed]);

    const getCurrentTextColor = () => {
      if (textColors.length === 0) return "inherit";
      return textColors[currentTextIndex % textColors.length];
    };

    useEffect(() => {
      if (!startOnVisible || !containerRef.current) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setIsVisible(true);
          });
        },
        { threshold: 0.1 },
      );
      observer.observe(containerRef.current);
      return () => {
        observer.disconnect();
      };
    }, [startOnVisible]);

    useEffect(() => {
      if (!showCursor || !cursorRef.current) return;
      if (prefersReducedMotion.current) return;

      gsap.set(cursorRef.current, { opacity: 1 });
      gsap.to(cursorRef.current, {
        opacity: 0,
        duration: cursorBlinkDuration,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });

      const cursorEl = cursorRef.current;
      return () => {
        gsap.killTweensOf(cursorEl);
      };
    }, [showCursor, cursorBlinkDuration]);

    useEffect(() => {
      if (!prefersReducedMotion.current) return;
      const joined = textArray.join(" ");
      setDisplayedText(joined);
      if (onSentenceComplete) {
        const lastIndex = textArray.length - 1;
        void Promise.resolve().then(() => {
          onSentenceComplete(textArray[lastIndex] ?? "", lastIndex);
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (prefersReducedMotion.current) return;
      if (!isVisible) return;

      let timeout: ReturnType<typeof setTimeout>;
      const currentText = textArray[currentTextIndex] ?? "";
      const processedText = reverseMode ? currentText.split("").reverse().join("") : currentText;

      const executeTypingAnimation = () => {
        if (isDeleting) {
          if (displayedText === "") {
            setIsDeleting(false);
            if (currentTextIndex === textArray.length - 1 && !loop) return;
            if (onSentenceComplete) {
              onSentenceComplete(textArray[currentTextIndex] ?? "", currentTextIndex);
            }
            setCurrentTextIndex((prev) => (prev + 1) % textArray.length);
            setCurrentCharIndex(0);
            timeout = setTimeout(() => {
              // intentional no-op — just waits for pauseDuration
            }, pauseDuration);
          } else {
            timeout = setTimeout(() => {
              setDisplayedText((prev) => prev.slice(0, -1));
            }, deletingSpeed);
          }
        } else {
          if (currentCharIndex < processedText.length) {
            timeout = setTimeout(
              () => {
                setDisplayedText((prev) => prev + (processedText[currentCharIndex] ?? ""));
                setCurrentCharIndex((prev) => prev + 1);
              },
              variableSpeed ? getRandomSpeed() : typingSpeed,
            );
          } else if (textArray.length >= 1) {
            if (!loop && currentTextIndex === textArray.length - 1) {
              if (onSentenceComplete) {
                onSentenceComplete(textArray[currentTextIndex] ?? "", currentTextIndex);
              }
              return;
            }
            timeout = setTimeout(() => {
              setIsDeleting(true);
            }, pauseDuration);
          }
        }
      };

      if (currentCharIndex === 0 && !isDeleting && displayedText === "") {
        timeout = setTimeout(executeTypingAnimation, initialDelay);
      } else {
        executeTypingAnimation();
      }

      return () => {
        clearTimeout(timeout);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      currentCharIndex,
      displayedText,
      isDeleting,
      typingSpeed,
      deletingSpeed,
      pauseDuration,
      textArray,
      currentTextIndex,
      loop,
      initialDelay,
      isVisible,
      reverseMode,
      variableSpeed,
      onSentenceComplete,
    ]);

    const shouldHideCursor =
      hideCursorWhileTyping &&
      (currentCharIndex < (textArray[currentTextIndex]?.length ?? 0) || isDeleting);

    return createElement(
      Component,
      {
        ref: containerRef,
        className: `inline-block whitespace-pre-wrap ${className}`,
        ...props,
      },
      <span className="text-type__content" style={{ color: getCurrentTextColor() || "inherit" }}>
        {displayedText}
      </span>,
      showCursor && (
        <span
          ref={cursorRef}
          className={`ml-1 inline-block ${shouldHideCursor ? "hidden" : ""} ${cursorClassName}`}
        >
          {cursorCharacter}
        </span>
      ),
    );
  },
);

TextType.displayName = "TextType";
