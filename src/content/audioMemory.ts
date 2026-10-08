export interface AudioMemory {
  id: string;
  pageLabel: string;          // "PERSONAL AUDIO MEMORY I"
  headerBadge: string;        // "NLUJA ASSAM // \"AUDIO MEMORY\""
  headerSubBadge: string;     // "PERSONAL ARCHIVE // SINGLE RECORD"
  heading: string;            // "AUDIO MEMORY"
  tagline: string;            // "A voice kept here for you."
  recordingLabel: string;     // "RECORDING // PERSONAL TESTAMENT I"
  title: string;              // "A VOICE WORTH KEEPING"
  description: string;        // "If You Got My Eyes To See Yourself"
  subHeader?: string;         // "MANUSCRIPT FOLIO // POETIC TESTAMENT"
  messageLines: string[];     // Array of poetic manuscript lines
  audioSrc: string;           // real audio file path
  captionVideoSrc?: string;   // optional video path
  captionPosterSrc?: string;  // optional poster image path
}

export const audioMemoryData: AudioMemory = {
  id: "personal-audio-01",
  pageLabel: "PERSONAL AUDIO AUDIO",
  headerBadge: "NLUJA ASSAM // \"AUDIO MEMORY\"",
  headerSubBadge: "PERSONAL ARCHIVE // SINGLE RECORD",
  heading: "AUDIO MESSAGE",
  tagline: "A voice kept here for you.",
  recordingLabel: "RECORDING // PERSONAL TESTAMENT I",
  title: "Afreen Afreen",
  description: "If You Got My Eyes To See Yourself",
  subHeader: "MANUSCRIPT FOLIO // POETIC TESTAMENT",
  messageLines: [
    "Chehra ek phool ki tarah shadaab hai",
    "Chehra uska hai ya koi mahtaab hai",
    "Chehra jaise ghazal, chehra jaane ghazal",
    "Chehra jaise kali, chehra jaise kanwal",
    "Chehra jaise tasavur bhi, tasveer bhi",
    "Chehra ek khwab bhi, chehra tabeer bhi",
    "Chehra koi aliflailvi dastaan",
    "Chehra ek pal yakeen, chehra ek pal gumah",
    "Chehra jaisa ke chehra kahin bhi nahi",
    "Mahrooh-mahrooh mehjabin-mehjabin",
    "Husn-e-jaana ki tareef mumkin nahi",
    "Husn-e-jaana ki tareef mumkin nahi",
    "AFREEN AFREEN AFREEN AFREEN",
    "Tu bhi dekhe agar toh kahe humnashin",
    "AFREEN AFREEN AFREEN AFREEN",
    "Usne jaana ki tareef mumkin nah",
    "(Afreen afreen)"
  ],
  audioSrc: "/media/audio/memory-01.mp3",
  captionPosterSrc: "/media/archive/archive-master.webp"
};
