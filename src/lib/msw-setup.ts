import { setupWorker } from 'msw/browser';
import { handlers } from './msw-handlers';

export async function setupMSW() {
  if (typeof window === 'undefined') return;
  
  const worker = setupWorker(...handlers);
  await worker.start({ onUnhandledRequest: 'bypass' });
  console.log('MSW started');
}