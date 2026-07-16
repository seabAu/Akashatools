export const membershipScenarios = Object.freeze([
  Object.freeze({ scale: "small", size: 1_000, samples: 15 }),
  Object.freeze({ scale: "medium", size: 5_000, samples: 7 }),
  Object.freeze({ scale: "large", size: 20_000, samples: 3 }),
]);

export const collatorScenarios = Object.freeze([
  Object.freeze({ scale: "small", size: 1_000, samples: 15 }),
  Object.freeze({ scale: "medium", size: 10_000, samples: 7 }),
  Object.freeze({ scale: "large", size: 50_000, samples: 3 }),
]);

export const textScenarios = Object.freeze([
  Object.freeze({ scale: "small", minimumLength: 3_800, samples: 21 }),
  Object.freeze({ scale: "medium", minimumLength: 100_000, samples: 11 }),
  Object.freeze({ scale: "large", minimumLength: 1_000_000, samples: 5 }),
]);

/** Source-like stable IDs model COMPOSR/Mindspace record membership. */
export function createMembershipFixture(size) {
  const values = Array.from({ length: size }, (_, index) => `record-${index}`);
  const candidates = Array.from({ length: size }, (_, index) => `record-${index + Math.floor(size / 2)}`);
  return { values, candidates };
}

/** Natural-number labels model task, project, and navigation presentation. */
export function createCollatorFixture(size) {
  return Array.from({ length: size }, (_, index) => `Task ${(index * 7_919) % size} - Review`);
}

/** Multilingual paragraphs model SPLICR text near its configured work limits. */
export function createTextFixture(minimumLength) {
  const paragraph = "## Planning\nAlpha beta écho 🙂. Second clause; final sentence.\n\n";
  return paragraph.repeat(Math.ceil(minimumLength / paragraph.length));
}
