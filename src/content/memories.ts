export interface MemoryItem {
  id: string;
  image: string;
  title: string;
  date: string;
  caption: string;
  details?: string;
}

export const memories: MemoryItem[] = [
  {
    id: "memory-01",
    image: "/media/memories/memory-01.jpg",
    title: "A Frame of You",
    date: "FEB 2024",
    caption: "Most Beautifull Soul Of The Day",
    details: "OPTIONAL DETAILS HERE"
  },
  {
    id: "memory-02",
    image: "/media/memories/memory-02.jpg",
    title: "A Beautiful Pause",
    date: "FEB 2023",
    caption: "Time moved on. The memory stayed.",
    details: "OPTIONAL DETAILS HERE"
  }
];

export default memories;
