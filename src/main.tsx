import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ReminderCenter } from './components/ReminderCenter';
import { getSavedProfile } from './utils/storage';
import './index.css';

const lang = getSavedProfile().language || 'ar';

createRoot(document.getElementById('root')!).render(
  <>
    <App />
    <ReminderCenter lang={lang} />
  </>,
);
