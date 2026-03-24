export interface CountryCollegeStat {
  countryCode: string; // ISO-2
  countryName: string;
  collegeCount: number;
  centroid: [number, number]; // [lng, lat]
}

export const worldCollegeStats: CountryCollegeStat[] = [
  { countryCode: "IN", countryName: "India", collegeCount: 43796, centroid: [78.9629, 20.5937] },
  { countryCode: "US", countryName: "United States", collegeCount: 5916, centroid: [-95.7129, 37.0902] },
  { countryCode: "GB", countryName: "United Kingdom", collegeCount: 398, centroid: [-3.4360, 55.3781] },
  { countryCode: "CN", countryName: "China", collegeCount: 3013, centroid: [104.1954, 35.8617] },
  { countryCode: "BR", countryName: "Brazil", collegeCount: 2407, centroid: [-51.9253, -14.2350] },
  { countryCode: "RU", countryName: "Russia", collegeCount: 1450, centroid: [105.3188, 61.5240] },
  { countryCode: "DE", countryName: "Germany", collegeCount: 426, centroid: [10.4515, 51.1657] },
  { countryCode: "FR", countryName: "France", collegeCount: 367, centroid: [2.2137, 46.2276] },
  { countryCode: "AU", countryName: "Australia", collegeCount: 1100, centroid: [133.7751, -25.2744] },
  { countryCode: "JP", countryName: "Japan", collegeCount: 786, centroid: [138.2529, 36.2048] },
  { countryCode: "CA", countryName: "Canada", collegeCount: 223, centroid: [-96.8165, 56.1304] },
  { countryCode: "KR", countryName: "South Korea", collegeCount: 432, centroid: [127.7669, 35.9078] },
  { countryCode: "MX", countryName: "Mexico", collegeCount: 3591, centroid: [-102.5528, 23.6345] },
  { countryCode: "IT", countryName: "Italy", collegeCount: 92, centroid: [12.5674, 41.8719] },
  { countryCode: "ES", countryName: "Spain", collegeCount: 86, centroid: [-3.7492, 40.4637] },
  { countryCode: "TR", countryName: "Turkey", collegeCount: 208, centroid: [35.2433, 38.9637] },
  { countryCode: "PK", countryName: "Pakistan", collegeCount: 218, centroid: [69.3451, 30.3753] },
  { countryCode: "NG", countryName: "Nigeria", collegeCount: 228, centroid: [8.6753, 9.0820] },
  { countryCode: "AR", countryName: "Argentina", collegeCount: 134, centroid: [-63.6167, -38.4161] },
  { countryCode: "ID", countryName: "Indonesia", collegeCount: 4498, centroid: [113.9213, -0.7893] },
  { countryCode: "SA", countryName: "Saudi Arabia", collegeCount: 31, centroid: [45.0792, 23.8859] },
  { countryCode: "ZA", countryName: "South Africa", collegeCount: 26, centroid: [22.9375, -30.5595] },
  { countryCode: "EG", countryName: "Egypt", collegeCount: 34, centroid: [30.8025, 26.8206] },
  { countryCode: "PH", countryName: "Philippines", collegeCount: 2324, centroid: [122.8720, 12.8797] },
  { countryCode: "MY", countryName: "Malaysia", collegeCount: 565, centroid: [109.6973, 4.2105] },
  { countryCode: "BD", countryName: "Bangladesh", collegeCount: 3000, centroid: [90.3563, 23.6850] },
  { countryCode: "NL", countryName: "Netherlands", collegeCount: 86, centroid: [5.2913, 52.1326] },
  { countryCode: "SE", countryName: "Sweden", collegeCount: 50, centroid: [18.6435, 60.1282] },
  { countryCode: "CH", countryName: "Switzerland", collegeCount: 12, centroid: [8.2275, 46.8182] },
  { countryCode: "SG", countryName: "Singapore", collegeCount: 34, centroid: [103.8198, 1.3521] },
  { countryCode: "NZ", countryName: "New Zealand", collegeCount: 28, centroid: [174.8860, -40.9006] },
  { countryCode: "UA", countryName: "Ukraine", collegeCount: 289, centroid: [31.1656, 48.3794] },
  { countryCode: "PL", countryName: "Poland", collegeCount: 395, centroid: [19.1451, 51.9194] },
  { countryCode: "IR", countryName: "Iran", collegeCount: 200, centroid: [53.6880, 32.4279] },
  { countryCode: "TH", countryName: "Thailand", collegeCount: 171, centroid: [100.9925, 15.8700] },
  { countryCode: "VN", countryName: "Vietnam", collegeCount: 240, centroid: [108.2772, 14.0583] },
  { countryCode: "ET", countryName: "Ethiopia", collegeCount: 45, centroid: [40.4897, 9.1450] },
  { countryCode: "GH", countryName: "Ghana", collegeCount: 78, centroid: [-1.0232, 7.9465] },
  { countryCode: "KE", countryName: "Kenya", collegeCount: 70, centroid: [37.9062, -0.0236] },
  { countryCode: "CO", countryName: "Colombia", collegeCount: 329, centroid: [-74.2973, 4.5709] },
];
