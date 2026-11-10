const blocked = [
  "fuck",
  "shit",
  "bitch",
  "bastard",
  "asshole",
  "dick",
  "cock",
  "pussy",
  "whore",
  "slut",
  "cunt",
  "nigger",
  "faggot",
  "retard",
];
export function challengeTextError(value: string) {
  const normalized = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(
      /[013457@$!]/g,
      (c) =>
        ({
          "0": "o",
          "1": "i",
          "3": "e",
          "4": "a",
          "5": "s",
          "7": "t",
          "@": "a",
          $: "s",
          "!": "i",
        })[c] ?? c,
    )
    .replace(/[^a-z0-9]/g, "");
  if (!normalized) return "Enter a challenge name and goal.";
  if (blocked.some((word) => normalized.includes(word)))
    return "Please remove offensive or abusive language from the challenge name and goal.";
  return "";
}
