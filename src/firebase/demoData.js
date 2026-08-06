// Demo data — used when logged in as demo admin (no Firebase needed)
import { addDays, subDays, subHours, subWeeks } from 'date-fns';

const now = new Date();

export const DEMO_ORGS = [
  { id: 'org1', name: 'Computer Science Society', description: 'A community for CS enthusiasts to learn, build, and grow together.', logoUrl: '', createdBy: 'admin-uid', memberCount: 3, createdAt: { toDate: () => subDays(now, 30) } },
  { id: 'org2', name: 'Mathematics Club',          description: 'Exploring the beauty of numbers, proofs, and problem solving.',   logoUrl: '', createdBy: 'admin-uid', memberCount: 2, createdAt: { toDate: () => subDays(now, 20) } },
  { id: 'org3', name: 'Environmental Advocates',   description: 'Promoting sustainability and environmental awareness on campus.',  logoUrl: '', createdBy: 'admin-uid', memberCount: 1, createdAt: { toDate: () => subDays(now, 15) } },
  { id: 'org4', name: 'Debate Society',            description: 'Sharpening critical thinking and public speaking skills.',         logoUrl: '', createdBy: 'admin-uid', memberCount: 1, createdAt: { toDate: () => subDays(now, 10) } },
];

export const DEMO_EVENTS = [
  { id: 'ev1', title: 'General Assembly 2025',       description: 'Annual general assembly for all SSG members.',           date: { toDate: () => addDays(now, 3)   }, location: 'Main Auditorium', organizationId: 'org1', createdBy: 'admin-uid' },
  { id: 'ev2', title: 'Hackathon: Build for Good',   description: '24-hour hackathon focused on social impact projects.',   date: { toDate: () => addDays(now, 7)   }, location: 'CS Lab 3',        organizationId: 'org1', createdBy: 'admin-uid' },
  { id: 'ev3', title: 'Math Olympiad Prep',          description: 'Intensive review session for the upcoming olympiad.',    date: { toDate: () => addDays(now, 5)   }, location: 'Room 204',        organizationId: 'org2', createdBy: 'admin-uid' },
  { id: 'ev4', title: 'Campus Clean-Up Drive',       description: 'Join us in keeping our campus clean and green.',         date: { toDate: () => addDays(now, 2)   }, location: 'Campus Grounds',  organizationId: 'org3', createdBy: 'admin-uid' },
  { id: 'ev5', title: 'Inter-School Debate Finals',  description: 'Watch our best debaters compete at the regional level.',  date: { toDate: () => subDays(now, 5)  }, location: 'Gymnasium',       organizationId: 'org4', createdBy: 'admin-uid' },
  { id: 'ev6', title: 'Python Workshop',             description: 'Beginner-friendly Python programming workshop.',          date: { toDate: () => subDays(now, 10) }, location: 'CS Lab 1',        organizationId: 'org1', createdBy: 'admin-uid' },
  { id: 'ev7', title: 'Leadership Seminar',          description: 'Developing leadership skills for student officers.',      date: { toDate: () => subDays(now, 14) }, location: 'AVR',             organizationId: 'org1', createdBy: 'admin-uid' },
  { id: 'ev8', title: 'Math Quiz Bee',               description: 'Inter-section math competition for all year levels.',     date: { toDate: () => subDays(now, 18) }, location: 'Room 101',        organizationId: 'org2', createdBy: 'admin-uid' },
  { id: 'ev9', title: 'Tree Planting Activity',      description: 'Community tree planting in the school grounds.',          date: { toDate: () => subDays(now, 22) }, location: 'School Garden',   organizationId: 'org3', createdBy: 'admin-uid' },
  { id: 'ev10',title: 'Debate Workshop',             description: 'Fundamentals of parliamentary debate for beginners.',     date: { toDate: () => subDays(now, 25) }, location: 'Room 305',        organizationId: 'org4', createdBy: 'admin-uid' },
];

export const DEMO_ANNOUNCEMENTS = [
  { id: 'ann1', title: 'Welcome to SSG Club Hub!',          content: 'We are excited to launch the new SSG Club Hub platform. Explore organizations, join events, and stay connected!', organizationId: '',     createdBy: 'admin-uid', createdAt: { toDate: () => subHours(now, 2)  } },
  { id: 'ann2', title: 'Enrollment for New Members Open',   content: 'All organizations are now accepting new members for this semester. Visit the Organizations page to send your join request.', organizationId: 'org1', createdBy: 'admin-uid', createdAt: { toDate: () => subDays(now, 1)  } },
  { id: 'ann3', title: 'Hackathon Registration Deadline',   content: 'Last day to register for the Hackathon: Build for Good is this Friday. Slots are limited — sign up now!', organizationId: 'org1', createdBy: 'admin-uid', createdAt: { toDate: () => subDays(now, 2)  } },
  { id: 'ann4', title: 'Campus Clean-Up Volunteers Needed', content: 'We need at least 30 volunteers for the Campus Clean-Up Drive. Please sign up at the Environmental Advocates booth.', organizationId: 'org3', createdBy: 'admin-uid', createdAt: { toDate: () => subDays(now, 3)  } },
  { id: 'ann5', title: 'Math Olympiad Results',             content: 'Congratulations to all participants of the Math Olympiad Prep session! Results will be posted on the bulletin board.', organizationId: 'org2', createdBy: 'admin-uid', createdAt: { toDate: () => subDays(now, 7)  } },
  { id: 'ann6', title: 'Python Workshop Recap',             content: 'Thank you to everyone who attended the Python Workshop! Slides and resources are now available on the CS Society page.', organizationId: 'org1', createdBy: 'admin-uid', createdAt: { toDate: () => subDays(now, 9)  } },
  { id: 'ann7', title: 'Debate Finals Highlights',          content: 'Our Debate Society placed 2nd in the Inter-School Debate Finals! Congratulations to our debaters!', organizationId: 'org4', createdBy: 'admin-uid', createdAt: { toDate: () => subDays(now, 12) } },
];

export const DEMO_MEMBERS = [
  { id: 'mem1', userId: 'u2',               organizationId: 'org1', userName: 'Bob Santos',    userEmail: 'bob@school.edu',              role: 'member',  status: 'approved', joinedAt: { toDate: () => subDays(now, 18) } },
  { id: 'mem2', userId: 'u8',               organizationId: 'org1', userName: 'Henry Uy',      userEmail: 'henry@school.edu',            role: 'officer', status: 'approved', joinedAt: { toDate: () => subDays(now, 15) } },
  { id: 'mem3', userId: 'u4',               organizationId: 'org1', userName: 'Dan Cruz',      userEmail: 'dan@school.edu',              role: 'member',  status: 'pending',  joinedAt: { toDate: () => subDays(now, 1)  } },
  { id: 'mem4', userId: 'u5',               organizationId: 'org2', userName: 'Eva Torres',    userEmail: 'eva@school.edu',              role: 'member',  status: 'approved', joinedAt: { toDate: () => subDays(now, 12) } },
  { id: 'mem5', userId: 'u6',               organizationId: 'org2', userName: 'Frank Lim',     userEmail: 'frank@school.edu',            role: 'member',  status: 'pending',  joinedAt: { toDate: () => subDays(now, 2)  } },
  { id: 'mem6', userId: 'u7',               organizationId: 'org3', userName: 'Grace Tan',     userEmail: 'grace@school.edu',            role: 'member',  status: 'approved', joinedAt: { toDate: () => subDays(now, 8)  } },
  { id: 'mem7', userId: 'u9',               organizationId: 'org4', userName: 'Iris Dela Cruz',userEmail: 'iris@school.edu',             role: 'member',  status: 'approved', joinedAt: { toDate: () => subDays(now, 6)  } },
  { id: 'mem8', userId: 'u10',              organizationId: 'org4', userName: 'Jake Reyes',    userEmail: 'jake@school.edu',             role: 'member',  status: 'approved', joinedAt: { toDate: () => subDays(now, 3)  } },
];

export const DEMO_USERS = [
  { id: 'admin-uid',        name: 'Admin',         email: 'Admin123@gmail.com',           role: 'admin'   },
  { id: 'u2',               name: 'Bob Santos',    email: 'bob@school.edu',              role: 'student' },
  { id: 'u4',               name: 'Dan Cruz',      email: 'dan@school.edu',              role: 'student' },
  { id: 'u5',               name: 'Eva Torres',    email: 'eva@school.edu',              role: 'student' },
  { id: 'u6',               name: 'Frank Lim',     email: 'frank@school.edu',            role: 'student' },
  { id: 'u7',               name: 'Grace Tan',     email: 'grace@school.edu',            role: 'student' },
  { id: 'u8',               name: 'Henry Uy',      email: 'henry@school.edu',            role: 'officer' },
  { id: 'u9',               name: 'Iris Dela Cruz',email: 'iris@school.edu',             role: 'student' },
  { id: 'u10',              name: 'Jake Reyes',    email: 'jake@school.edu',             role: 'student' },
];

export const DEMO_LOGS = [
  { id: 'log1',  userId: 'admin-uid',   action: 'create_org',          details: { name: 'Computer Science Society'  }, createdAt: { toDate: () => subDays(now, 30) } },
  { id: 'log2',  userId: 'admin-uid',   action: 'create_org',          details: { name: 'Mathematics Club'          }, createdAt: { toDate: () => subDays(now, 20) } },
  { id: 'log3',  userId: 'admin-uid',   action: 'create_org',          details: { name: 'Environmental Advocates'   }, createdAt: { toDate: () => subDays(now, 15) } },
  { id: 'log4',  userId: 'admin-uid',   action: 'create_org',          details: { name: 'Debate Society'            }, createdAt: { toDate: () => subDays(now, 10) } },
  { id: 'log5',  userId: 'admin-uid',   action: 'create_event',        details: { title: 'Python Workshop'          }, createdAt: { toDate: () => subDays(now, 12) } },
  { id: 'log6',  userId: 'admin-uid',   action: 'create_event',        details: { title: 'General Assembly 2025'    }, createdAt: { toDate: () => subDays(now, 8)  } },
  { id: 'log7',  userId: 'admin-uid',   action: 'create_announcement', details: { title: 'Welcome to SSG Club Hub!' }, createdAt: { toDate: () => subHours(now, 2) } },
  { id: 'log8',  userId: 'u2',          action: 'join_request',        details: { orgId: 'org1'                     }, createdAt: { toDate: () => subDays(now, 5)  } },
  { id: 'log9',  userId: 'admin-uid',   action: 'approve_member',      details: { userName: 'Bob Santos'            }, createdAt: { toDate: () => subDays(now, 4)  } },
  { id: 'log10', userId: 'u5',          action: 'join_request',        details: { orgId: 'org2'                     }, createdAt: { toDate: () => subDays(now, 3)  } },
  { id: 'log11', userId: 'admin-uid',   action: 'approve_member',      details: { userName: 'Eva Torres'            }, createdAt: { toDate: () => subDays(now, 2)  } },
  { id: 'log12', userId: 'u8',          action: 'create_event',        details: { title: 'Hackathon: Build for Good'}, createdAt: { toDate: () => subDays(now, 1)  } },
];
