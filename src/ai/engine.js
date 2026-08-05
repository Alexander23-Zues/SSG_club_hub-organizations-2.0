/**
 * SSG Club Hub — AI Engine
 * All AI features run client-side (no API key needed).
 * Uses pattern matching, heuristics, and smart templates
 * to provide practical, context-aware suggestions.
 */

// ─── Tone definitions ──────────────────────────────────────────────────────
const TONES = {
  formal: {
    label: 'Formal',
    emoji: '📋',
    opener: ['We are pleased to inform all members that', 'This is to officially announce that', 'The organization hereby announces that', 'Please be informed that'],
    closer: ['We look forward to your active participation.', 'Your cooperation and attendance are highly appreciated.', 'For inquiries, please contact the organization secretary.', 'Thank you for your continued support.'],
  },
  casual: {
    label: 'Casual',
    emoji: '😊',
    opener: ["Hey everyone! Just a heads up —", "Quick announcement for all members!", "Exciting news from your org!", "Attention fam!"],
    closer: ["See you there! 🎉", "Don't miss out — spread the word!", "Stay tuned for more updates!", "Hype it up and share with your friends! 🙌"],
  },
  urgent: {
    label: 'Urgent',
    emoji: '🚨',
    opener: ['URGENT NOTICE:', 'IMPORTANT ANNOUNCEMENT:', 'ACTION REQUIRED:', 'IMMEDIATE ATTENTION NEEDED:'],
    closer: ['Please act immediately. Failure to comply may result in consequences.', 'This is time-sensitive. Please respond ASAP.', 'Do not ignore this notice. Contact officers immediately.', 'Deadline is strict. No extensions will be given.'],
  },
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── 1. Announcement Writer (multi-tone) ──────────────────────────────────
export const generateAnnouncement = (title, orgName = 'the organization', tone = 'formal') => {
  if (!title) return '';
  const t = TONES[tone] || TONES.formal;
  const body = buildAnnouncementBody(title, orgName, tone);
  return `${pick(t.opener)} ${body}\n\n${pick(t.closer)}`;
};

const buildAnnouncementBody = (title, orgName, tone) => {
  const lc = title.toLowerCase();
  if (lc.includes('meeting') || lc.includes('assembly') || lc.includes('general'))
    return `${orgName} will be holding a ${title}. All members are required to attend. Please check the event details for the date, time, and venue.`;
  if (lc.includes('election') || lc.includes('vote') || lc.includes('officer'))
    return `${orgName} will be conducting ${title}. All registered members are eligible to vote. Please prepare your valid student ID.`;
  if (lc.includes('deadline') || lc.includes('submission') || lc.includes('requirement'))
    return `the deadline for ${title} is fast approaching. Please submit all required documents on time to avoid penalties.`;
  if (lc.includes('event') || lc.includes('activity') || lc.includes('program'))
    return `${orgName} is organizing ${title}. This is a great opportunity to connect with fellow members and showcase your talents.`;
  if (lc.includes('seminar') || lc.includes('workshop') || lc.includes('training'))
    return `${orgName} will be hosting ${title}. This is a valuable learning opportunity for all members. Registration is required.`;
  if (lc.includes('fund') || lc.includes('fundrais') || lc.includes('donation'))
    return `${orgName} is launching ${title}. Your generous support will go a long way in funding our upcoming activities.`;
  return `${orgName} has an important update regarding ${title}. Please read this announcement carefully and take the necessary action.`;
};

// ─── 2. Event Description Generator ──────────────────────────────────────
export const generateEventDescription = (title, orgName = '', location = '') => {
  if (!title) return '';
  const lc = title.toLowerCase();
  const loc = location ? ` at ${location}` : '';
  const org = orgName ? ` by ${orgName}` : '';

  if (lc.includes('general assembly') || lc.includes('ga'))
    return `Join us for the General Assembly${org}${loc}. This is a mandatory meeting for all members where we will discuss organizational updates, upcoming activities, financial reports, and other important matters. Your presence and active participation are highly encouraged.`;
  if (lc.includes('election'))
    return `${orgName || 'The organization'} will be holding its Officer Elections${loc}. All registered members are entitled to vote for their preferred candidates. Candidates will present their platforms before the voting proper. Please bring your valid student ID.`;
  if (lc.includes('seminar') || lc.includes('workshop'))
    return `Enhance your skills and knowledge at this ${title}${org}${loc}. Expert speakers will share valuable insights and practical knowledge. Open to all members and interested students. Registration may be required — check with your officer for details.`;
  if (lc.includes('sportsfest') || lc.includes('sports') || lc.includes('game'))
    return `Get ready to compete and have fun at ${title}${org}${loc}! Show your team spirit and athletic skills in various sports competitions. Prizes await the winners. Wear comfortable attire and bring your school ID.`;
  if (lc.includes('cultural') || lc.includes('night') || lc.includes('show') || lc.includes('perform'))
    return `Experience an unforgettable evening at ${title}${org}${loc}. Witness the talents of our members through performances, exhibits, and cultural presentations. This is a celebration of creativity, culture, and community.`;
  if (lc.includes('clean') || lc.includes('plant') || lc.includes('environment'))
    return `Be part of the change at ${title}${org}${loc}. Join us as we take action for our environment through hands-on activities. Wear appropriate clothing and bring your enthusiasm for making a difference.`;
  if (lc.includes('orientation'))
    return `Welcome to ${orgName || 'the organization'}! This ${title}${loc} is designed to help new members get acquainted with the organization's vision, mission, programs, and officers. Attendance is required for all new members.`;

  return `Join us for ${title}${org}${loc}. This is an exciting opportunity for all members to come together, learn, and grow as a community. More details will be announced soon. Stay tuned and mark your calendars!`;
};

// ─── 3. Smart Event Tags ──────────────────────────────────────────────────
export const suggestEventTags = (title, description = '') => {
  const text = `${title} ${description}`.toLowerCase();
  const tagMap = [
    { keywords: ['meeting', 'assembly', 'ga', 'general'], tag: 'Meeting' },
    { keywords: ['election', 'vote', 'officer', 'campaign'], tag: 'Election' },
    { keywords: ['seminar', 'workshop', 'training', 'webinar'], tag: 'Learning' },
    { keywords: ['sports', 'game', 'tournament', 'athletic', 'sportsfest'], tag: 'Sports' },
    { keywords: ['cultural', 'arts', 'perform', 'show', 'night'], tag: 'Cultural' },
    { keywords: ['fund', 'fundrais', 'donation', 'charity'], tag: 'Fundraising' },
    { keywords: ['clean', 'plant', 'environment', 'eco', 'green'], tag: 'Environment' },
    { keywords: ['orientation', 'welcome', 'induction', 'onboard'], tag: 'Orientation' },
    { keywords: ['deadline', 'submission', 'requirement', 'form'], tag: 'Deadline' },
    { keywords: ['party', 'celebration', 'anniversary', 'birthday'], tag: 'Celebration' },
    { keywords: ['outreach', 'community', 'service', 'volunteer'], tag: 'Community Service' },
    { keywords: ['competition', 'contest', 'quiz', 'battle'], tag: 'Competition' },
  ];
  return tagMap.filter(t => t.keywords.some(k => text.includes(k))).map(t => t.tag).slice(0, 4);
};

// ─── 4. Dashboard Smart Insights ─────────────────────────────────────────
export const getDashboardInsights = (role, orgs, events, announcements, members = []) => {
  const now = new Date();
  const upcoming = events.filter(e => { const d = e.date?.toDate ? e.date.toDate() : new Date(e.date); return d > now; });
  const thisWeek = upcoming.filter(e => { const d = e.date?.toDate ? e.date.toDate() : new Date(e.date); return (d - now) < 7 * 86400000; });
  const pending = members.filter(m => m.status === 'pending');
  const insights = [];

  if (role === 'admin') {
    if (pending.length > 0) insights.push({ type: 'action', icon: '👥', text: `${pending.length} member request${pending.length > 1 ? 's' : ''} waiting for approval.`, priority: 'high' });
    if (orgs.length === 0) insights.push({ type: 'tip', icon: '🏢', text: 'No organizations yet. Create the first one to get started!', priority: 'high' });
    if (thisWeek.length > 0) insights.push({ type: 'info', icon: '📅', text: `${thisWeek.length} event${thisWeek.length > 1 ? 's' : ''} happening this week. Make sure everything is prepared.`, priority: 'medium' });
    if (announcements.length === 0) insights.push({ type: 'tip', icon: '📢', text: 'No announcements posted yet. Keep members informed with regular updates.', priority: 'medium' });
    if (upcoming.length === 0 && orgs.length > 0) insights.push({ type: 'tip', icon: '💡', text: 'No upcoming events. Encourage officers to schedule activities to keep members engaged.', priority: 'low' });
    if (insights.length === 0) insights.push({ type: 'success', icon: '✅', text: `All good! ${orgs.length} orgs, ${upcoming.length} upcoming events. Keep up the great work!`, priority: 'low' });
  } else if (role === 'officer') {
    if (upcoming.length === 0) insights.push({ type: 'tip', icon: '📅', text: 'No upcoming events. Create one to keep your members engaged and active!', priority: 'high' });
    if (thisWeek.length > 0) insights.push({ type: 'info', icon: '🔔', text: `You have ${thisWeek.length} event${thisWeek.length > 1 ? 's' : ''} this week. Post an announcement to remind your members!`, priority: 'high' });
    if (pending.length > 0) insights.push({ type: 'action', icon: '👋', text: `${pending.length} student${pending.length > 1 ? 's' : ''} want to join your organization. Review their requests!`, priority: 'medium' });
    if (insights.length === 0) insights.push({ type: 'success', icon: '🌟', text: 'Your organization is active! Keep creating events and engaging your members.', priority: 'low' });
  } else {
    if (upcoming.length > 0) insights.push({ type: 'info', icon: '🎉', text: `${upcoming.length} upcoming event${upcoming.length > 1 ? 's' : ''} available. Check them out and RSVP!`, priority: 'medium' });
    if (orgs.length > 0) insights.push({ type: 'tip', icon: '🏢', text: `${orgs.length} organizations are active. Find one that matches your interests and join!`, priority: 'low' });
    if (insights.length === 0) insights.push({ type: 'info', icon: '👋', text: 'Welcome! Explore organizations and join one to get started.', priority: 'low' });
  }

  return insights.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]));
};

// ─── 5. Best Time to Post ─────────────────────────────────────────────────
export const getBestPostTime = () => {
  const hour = new Date().getHours();
  if (hour < 7)  return { time: '8:00 AM', reason: 'Students check notifications in the morning before class.' };
  if (hour < 12) return { time: '12:00 PM', reason: 'Lunch break is peak engagement time for students.' };
  if (hour < 17) return { time: '5:00 PM', reason: 'After class hours get the most reads and RSVPs.' };
  if (hour < 20) return { time: 'Now', reason: 'Evening is a great time — students are free and checking their phones.' };
  return { time: '8:00 AM tomorrow', reason: 'Late night posts get buried. Schedule for morning instead.' };
};

// ─── 6. Member Engagement Score ──────────────────────────────────────────
export const getMemberEngagementScore = (members, events, rsvps = []) => {
  if (members.length === 0) return { score: 0, label: 'No Data', color: 'slate' };
  const approved = members.filter(m => m.status === 'approved').length;
  const pending = members.filter(m => m.status === 'pending').length;
  const rsvpRate = events.length > 0 ? Math.min(rsvps.length / (events.length * Math.max(approved, 1)), 1) : 0;
  const score = Math.round(((approved / Math.max(members.length, 1)) * 50) + (rsvpRate * 50));
  if (score >= 80) return { score, label: 'Highly Engaged', color: 'emerald' };
  if (score >= 60) return { score, label: 'Active',         color: 'blue' };
  if (score >= 40) return { score, label: 'Moderate',       color: 'yellow' };
  if (score >= 20) return { score, label: 'Low Activity',   color: 'orange' };
  return { score, label: 'Needs Attention', color: 'red' };
};

// ─── 7. AI Natural Language Search ───────────────────────────────────────
export const aiSearch = (query, items, fields = ['name', 'title', 'description']) => {
  if (!query.trim()) return items;
  const q = query.toLowerCase().trim();

  // Keyword synonyms
  const synonyms = {
    'cs': ['computer', 'science', 'coding', 'programming', 'tech'],
    'env': ['environment', 'eco', 'green', 'nature', 'plant'],
    'sports': ['athletic', 'game', 'tournament', 'physical'],
    'arts': ['cultural', 'music', 'dance', 'perform', 'creative'],
    'upcoming': ['future', 'next', 'soon', 'scheduled'],
    'new': ['recent', 'latest', 'fresh'],
  };

  const expandedTerms = [q, ...(synonyms[q] || [])];

  return items.filter(item =>
    expandedTerms.some(term =>
      fields.some(field => item[field]?.toLowerCase().includes(term))
    )
  );
};

// ─── 8. Reports AI Summary ────────────────────────────────────────────────
export const generateReportSummary = (orgs, events, users, announcements, logs) => {
  const now = new Date();
  const upcoming = events.filter(e => { const d = e.date?.toDate ? e.date.toDate() : new Date(e.date); return d >= now; });
  const past = events.filter(e => { const d = e.date?.toDate ? e.date.toDate() : new Date(e.date); return d < now; });
  const admins = users.filter(u => u.role === 'admin').length;
  const officers = users.filter(u => u.role === 'officer').length;
  const students = users.filter(u => u.role === 'student').length;
  const recentActivity = logs.filter(l => {
    const d = l.createdAt?.toDate?.() || new Date(l.createdAt);
    return (now - d) < 7 * 86400000;
  }).length;

  const health = orgs.length > 0 && upcoming.length > 0 && announcements.length > 0 ? 'healthy' : orgs.length > 0 ? 'moderate' : 'needs attention';
  const healthEmoji = { healthy: '🟢', moderate: '🟡', 'needs attention': '🔴' }[health];

  return {
    headline: `${healthEmoji} System is ${health}`,
    summary: `The platform has ${orgs.length} organization${orgs.length !== 1 ? 's' : ''} with ${users.length} registered user${users.length !== 1 ? 's' : ''} (${admins} admin${admins !== 1 ? 's' : ''}, ${officers} officer${officers !== 1 ? 's' : ''}, ${students} student${students !== 1 ? 's' : ''}). There are ${upcoming.length} upcoming and ${past.length} past events, with ${announcements.length} total announcement${announcements.length !== 1 ? 's' : ''} posted.`,
    highlights: [
      recentActivity > 0 ? `${recentActivity} action${recentActivity !== 1 ? 's' : ''} logged in the last 7 days` : 'No activity in the last 7 days',
      upcoming.length > 0 ? `Next event coming up — keep members informed!` : 'No upcoming events — encourage officers to schedule activities',
      students > officers * 5 ? 'Good student-to-officer ratio' : officers > 0 ? 'Consider recruiting more officers' : 'No officers registered yet',
    ],
    recommendation: health === 'healthy'
      ? 'Keep up the momentum! Consider posting weekly announcements to maintain engagement.'
      : health === 'moderate'
      ? 'Create more events and encourage officers to post regular announcements.'
      : 'Start by creating organizations and inviting officers to manage them.',
  };
};

// ─── 9. Smart Notification Priority ──────────────────────────────────────
export const prioritizeNotifications = (notifications) => {
  return notifications.map(n => {
    const text = (n.title + ' ' + (n.message || '')).toLowerCase();
    let priority = 'normal';
    if (text.includes('urgent') || text.includes('important') || text.includes('required') || text.includes('deadline')) priority = 'high';
    else if (text.includes('reminder') || text.includes('tomorrow') || text.includes('today')) priority = 'medium';
    return { ...n, priority };
  }).sort((a, b) => {
    const order = { high: 0, medium: 1, normal: 2 };
    return order[a.priority] - order[b.priority];
  });
};

// ─── 10. Event Title Suggestions ─────────────────────────────────────────
export const suggestEventTitles = (orgName = '', partialTitle = '') => {
  const base = [
    'General Assembly', 'Officer Elections', 'Orientation for New Members',
    'Year-End Celebration', 'Sportsfest', 'Cultural Night', 'Seminar on Leadership',
    'Workshop on Public Speaking', 'Community Outreach Program', 'Fundraising Drive',
    'Team Building Activity', 'Academic Quiz Bee', 'Environmental Clean-Up Drive',
    'Induction of Officers', 'General Meeting', 'Budget Planning Session',
  ];
  const filtered = partialTitle
    ? base.filter(t => t.toLowerCase().includes(partialTitle.toLowerCase()))
    : base;
  return filtered.slice(0, 6).map(t => orgName ? `${t} — ${orgName}` : t);
};
