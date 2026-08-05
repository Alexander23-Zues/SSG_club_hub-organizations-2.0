// Run this once from the browser console (as admin) to seed sample data:
// import { seedSampleData } from './firebase/seedData'; seedSampleData();
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

const sampleOrgs = [
  { name: 'Computer Science Society', description: 'For students passionate about technology, programming, and innovation.' },
  { name: 'Environmental Awareness Club', description: 'Promoting sustainability and environmental consciousness on campus.' },
  { name: 'Student Publication', description: 'The official student newspaper and media organization.' },
  { name: 'Mathematics Club', description: 'Exploring the beauty of mathematics through competitions and workshops.' },
  { name: 'Cultural Arts Society', description: 'Celebrating Filipino culture through arts, music, and performance.' },
];

const sampleEvents = (orgIds) => [
  { title: 'General Assembly', description: 'Quarterly general assembly for all members.', date: new Date(Date.now() + 7 * 86400000), location: 'Main Auditorium', organizationId: orgIds[0] },
  { title: 'Coding Bootcamp', description: 'Intensive 2-day coding workshop for beginners.', date: new Date(Date.now() + 14 * 86400000), location: 'Computer Lab 1', organizationId: orgIds[0] },
  { title: 'Tree Planting Activity', description: 'Community tree planting in partnership with the local government.', date: new Date(Date.now() + 10 * 86400000), location: 'City Park', organizationId: orgIds[1] },
  { title: 'Math Olympiad', description: 'Annual inter-school mathematics competition.', date: new Date(Date.now() + 21 * 86400000), location: 'Science Building', organizationId: orgIds[3] },
  { title: 'Cultural Night', description: 'Annual showcase of Filipino arts and culture.', date: new Date(Date.now() + 30 * 86400000), location: 'School Gymnasium', organizationId: orgIds[4] },
];

const sampleAnnouncements = (orgIds) => [
  { title: 'Welcome to the New Semester!', content: 'We are excited to welcome all students to the new semester. Check out our upcoming events and join an organization today!', organizationId: '' },
  { title: 'Membership Drive Open', content: 'The Computer Science Society is now accepting new members. Sign up before the deadline!', organizationId: orgIds[0] },
  { title: 'Eco Week Announcement', content: 'Join us for Eco Week — a series of activities promoting environmental awareness on campus.', organizationId: orgIds[1] },
];

export const seedSampleData = async (createdBy = 'system') => {
  console.log('Seeding sample data...');

  // Create orgs
  const orgIds = [];
  for (const org of sampleOrgs) {
    const ref = await addDoc(collection(db, 'organizations'), {
      ...org, logoUrl: '', createdBy, createdAt: serverTimestamp()
    });
    orgIds.push(ref.id);
    console.log('Created org:', org.name);
  }

  // Create events
  for (const event of sampleEvents(orgIds)) {
    await addDoc(collection(db, 'events'), {
      ...event, createdBy, createdAt: serverTimestamp()
    });
    console.log('Created event:', event.title);
  }

  // Create announcements
  for (const ann of sampleAnnouncements(orgIds)) {
    await addDoc(collection(db, 'announcements'), {
      ...ann, createdBy, createdAt: serverTimestamp()
    });
    console.log('Created announcement:', ann.title);
  }

  console.log('✅ Sample data seeded successfully!');
};
