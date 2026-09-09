// One choice in a SegmentedToggle. The value is the union member it stands for.
export interface Segment<T extends string> {
  value: T;
  label: string;
}
