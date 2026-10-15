// Shared by prisma/seed.ts, prisma/reset-demo.ts, and the admin "Clear
// Resources" panel (src/modules/admin) — one definition of what a freshly
// reset demo looks like, so the three reset paths can't drift apart.
export const SAMPLE_RESOURCES = [
  {
    name: 'Conference Room A',
    description: 'Projector, whiteboard, seats 8',
    capacity: 8,
    location: '2nd floor',
  },
  {
    name: 'Conference Room B',
    description: 'Video conferencing setup',
    capacity: 4,
    location: '2nd floor',
  },
  {
    name: 'Portable Projector',
    description: 'HDMI + wireless casting',
    capacity: 1,
    location: 'Equipment room',
  },
];
