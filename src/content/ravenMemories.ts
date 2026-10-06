export interface RavenMemory {
  id: string;
  number: string;
  observation?: string;
  title: string;
  date: string;
  author?: string;
  memory: string;
  personalLine?: string;
}

export const ravenMemories: RavenMemory[] = [
  {
    id: "raven-memory-01",
    number: "I",
    observation: "OBSERVATION I // FILE 05",
    // Write the title of memory I here
    title: "THE FIRST CONVERSATION",
    // Add the approximate date or time period here
    date: "OCTOBER 14 // 11:42 PM",
    // Author of the memory
    author: "ARYAN MEENA",
    // Write the full personal memory here
    memory: "Some things are spoken once and echo forever in the quiet corridors of memory. That evening, when the autumn mist settled over the old library courtyard, words were exchanged that needed no embellishment—only the quiet certainty that time could neither diminish nor overwrite them.",
    // Optional short personal line, inside joke, or closing thought
    personalLine: "",
  },
  {
    id: "raven-memory-02",
    number: "II",
    observation: "OBSERVATION II // FILE 05",
    // Write the title of memory II here
    title: "THE MIDNIGHT RAIN",
    // Add the approximate date or time period here
    date: "NOVEMBER 03 // 02:15 AM",
    // Author of the memory
    author: "ARYAN MEENA",
    // Write the full personal memory here
    memory: "The steady cadence of raindrops against the leaded stained glass created a shelter against the forward rush of hours. We sat without lighting the lamps, understanding that presence alone was sufficient protection from whatever was to follow at dawn.",
    // Optional short personal line, inside joke, or closing thought
    personalLine: "",
  },
  {
    id: "raven-memory-03",
    number: "III",
    observation: "OBSERVATION III // FILE 05",
    // Write the title of memory III here
    title: "THE PROMISED HORIZON",
    // Add the approximate date or time period here
    date: "DECEMBER 21 // 06:50 AM",
    // Author of the memory
    author: "ARYAN MEENA",
    // Write the full personal memory here
    memory: "Before the sun breached the frostbitten peaks, a pact was sealed without ink or parchment—solely by mutual gaze over the awakening valley. The sentinel bore witness, inscribing this vow upon the enduring ledger of the skies.",
    // Optional short personal line, inside joke, or closing thought
    personalLine: "",
  },
];

export default ravenMemories;

