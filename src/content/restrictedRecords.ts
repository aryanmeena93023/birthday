export interface RestrictedRecord {
  id: string;
  label: string;
  title: string;
  description: string;
  identifier?: string;
  videoPath: string;
  pitch: number;
}

export const restrictedRecords: RestrictedRecord[] = [
  {
    id: 'record-01',
    label: 'PERSONAL RECORD I',
    title: 'A MOMENT KEPT FOR YOU',
    description: 'Some memories deserve to be kept a little longer.',
    identifier: 'GAU-1984-A',
    videoPath: '/media/chest/video-01.mp4',
    pitch: 440
  },
  {
    id: 'record-02',
    label: 'PERSONAL RECORD II',
    title: 'ANOTHER MOMENT TO REMEMBER',
    description: 'A second little piece of the story, saved here for you.',
    identifier: 'GAU-1984-B',
    videoPath: '/media/chest/video-02.mp4',
    pitch: 523.25
  }
];
