declare module "zipcodes" {
  interface ZipInfo {
    zip: string;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    country: string;
  }
  function lookup(zip: string): ZipInfo | undefined;
  function lookupByName(city: string, state: string): ZipInfo[];
  function distance(zipA: string, zipB: string): number | null;
}
