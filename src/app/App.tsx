import { RouterProvider } from 'react-router-dom';
import { AudioProvider } from './providers/AudioProvider';
import { I18nProvider } from './providers/I18nProvider';
import { MotionProvider } from './providers/MotionProvider';
import { PerformanceProvider } from './providers/PerformanceProvider';
import { SpoilerProvider } from './providers/SpoilerProvider';
import { router } from './router';

export default function App() {
  return (
    <I18nProvider>
      <MotionProvider>
        <PerformanceProvider>
          <AudioProvider>
            <SpoilerProvider>
              <RouterProvider router={router} />
            </SpoilerProvider>
          </AudioProvider>
        </PerformanceProvider>
      </MotionProvider>
    </I18nProvider>
  );
}
