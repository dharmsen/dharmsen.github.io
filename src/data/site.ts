export const site = {
  name: 'Dalton Harmsen',
  role: 'phd · ai foundation models · tue / openeurollm',
  shortBio:
    'PhD student at Eindhoven University of Technology working on efficient inference for large language models.',
  social: {
    scholar: 'https://scholar.google.com/citations?user=O5wWI0gAAAAJ',
    github: 'https://github.com/dharmsen',
    linkedin: 'https://www.linkedin.com/in/dalton-harmsen',
    x: 'https://x.com/daltonharmsen',
  },
  nav: [
    { label: 'research', href: '/research' },
    { label: 'talks', href: '/talks' },
    { label: 'teaching', href: '/teaching' },
    { label: 'notes', href: '/notes' },
    { label: 'hobby', href: '/hobby' },
  ],
} as const;

export type Site = typeof site;
