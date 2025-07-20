"use client"
import { useEffect, useState } from 'react';

const visionPrompts = [
  "build a website for...",
  "create an internal tool for...",
  "generate a dashboard for...",
  "design a landing page for...",
  "build a form that collects...",
];

export const useTypewriterPlaceholder = () => {
  const [index, setIndex] = useState(0); // which prompt
  const [subIndex, setSubIndex] = useState(0); // how many chars to show
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = visionPrompts[index];

    if (!deleting && subIndex === current.length) {
      setTimeout(() => setDeleting(true), 1000); // pause before deleting
      return;
    }

    if (deleting && subIndex === 0) {
      setDeleting(false);
      setIndex((prev) => (prev + 1) % visionPrompts.length); // go to next
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (deleting ? -1 : 1));
    }, deleting ? 40 : 75); // faster deleting, slower typing

    return () => clearTimeout(timeout);
  }, [subIndex, deleting, index]);

  return `Ask Vision to ${visionPrompts[index].substring(0, subIndex)}`;
};
