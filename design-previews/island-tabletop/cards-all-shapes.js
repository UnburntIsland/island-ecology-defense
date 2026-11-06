const shapes={
 leaf:'<path d="M19 4C9 2 3 8 5 15c2 7 15 5 14-11Z"/><path d="M4 21 15 9M9 15l-1-5m5 1 4 1"/>',
 sword:'<path d="m15 3 6 0 0 6-11 11-6-6L15 3Z"/><path d="m4 12 8 8M3 21l5-5M17 7l-6 6"/>',
 heart:'<path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-5 5 2 11 8 15 6-4 13-10 8-15Z"/>',
 coin:'<circle cx="12" cy="12" r="9"/><path d="M10 7h4v10h-4z"/>',
 star:'<path d="m12 3 3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 10l6-1Z"/>',
 bird:'<path d="M20 5c-5-3-10 1-9 5-5-1-7-4-8-6-2 10 7 17 13 10l4-4 3-1-3-2Z"/><circle cx="16" cy="7" r=".7"/><path d="m7 16-3 5 7-3"/>',
 paw:'<ellipse cx="12" cy="16" rx="6" ry="4"/><circle cx="5" cy="9" r="2"/><circle cx="10" cy="5" r="2"/><circle cx="16" cy="6" r="2"/><circle cx="20" cy="11" r="2"/>'
};
const icon=n=>`<svg class="icon ${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[n]}</svg>`;

export const islandMark=`<svg class="island-mark" viewBox="0 0 120 100" role="img" aria-label="淮德島識別標誌"><path d="M20 64a43 43 0 1 1 80 0" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="83" cy="27" r="6" fill="currentColor"/><path d="m19 59 24-29 18 21 11-13 29 21Z" fill="currentColor"/><path d="m43 30 9 26 9-5" fill="none" stroke="var(--accent)" stroke-width="3"/><path d="M14 68c12-9 22 9 34 0s22 9 34 0 16-4 24 0M26 79c10-7 18 7 28 0s18 7 28 0 8-3 12 0M42 90c8-5 13 5 21 0s11 0 15 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`;
export {icon};
