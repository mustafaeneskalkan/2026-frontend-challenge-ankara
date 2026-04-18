export type SearchScope = "any" | "person" | "location" | "content";

export type PersonEntry = {
  key: string;
  label: string;
  count: number;
};
