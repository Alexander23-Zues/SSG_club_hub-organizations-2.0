// Returns the correct service module based on whether the user is in demo mode
import * as realServices from './services';
import * as demoServices from './demoServices';

const DEMO_UIDS = new Set(['demo-admin-uid', 'demo-officer-uid', 'demo-student-uid']);

export const useServices = (currentUser) => {
  return DEMO_UIDS.has(currentUser?.uid) ? demoServices : realServices;
};
