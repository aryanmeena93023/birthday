export interface BirthdayLetter {
  greeting: string;
  paragraphs: string[];
  closing: string;
  signature: string;
  annotation: string;
}

const birthdayLetter: BirthdayLetter = {
  greeting: 'Dear Khushi,',
  paragraphs: [
    'Some things are meant to be written.',
    'Some are meant to be remembered.',
    'And some are meant to be kept somewhere safe, until the right person finds them.',
    'Tonight, a rather unusual file was recovered from the archive.',
    'It contained no classified information, no forgotten secret, and nothing that could explain why it had been hidden for so long.',
    'It contained only one thing:',
    'your name.',
    'And perhaps that is because some people are simply too special to be filed away as ordinary.',
    'So, on this particular day, I wanted to leave something behind for you—a small reminder that your presence has made ordinary moments feel a little less ordinary, conversations a little more memorable, and certain memories impossible to forget.',
    'I hope this year brings you the kind of happiness that arrives unexpectedly, stays longer than expected, and becomes a memory worth keeping.',
    'Keep laughing. Keep being you. Keep creating moments that deserve to be archived.',
    
    'Happy Birthday, "3000"',
  ],
  closing: 'With love,',
  signature: 'Aryan',
  annotation: 'For Khushi !!',
};

export default birthdayLetter;
