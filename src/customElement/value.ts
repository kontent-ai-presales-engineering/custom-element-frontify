export type FrontifyAsset = Readonly<{
  id: string;
  title: string;
  type: string;
  previewUrl: string | null;
  downloadUrl: string | null;
  filename: string | null;
  extension: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
}>;

export type Value = Readonly<{
  assets: ReadonlyArray<FrontifyAsset>;
}>;

export const parseValue = (input: string | null): Value | null | 'invalidValue' => {
  if (input === null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(input);
    return isValidValue(parsed) ? parsed : 'invalidValue';
  } catch {
    return 'invalidValue';
  }
};

const isValidValue = (value: unknown): value is Value =>
  typeof value === 'object' &&
  value !== null &&
  'assets' in value &&
  Array.isArray((value as Record<string, unknown>).assets);
