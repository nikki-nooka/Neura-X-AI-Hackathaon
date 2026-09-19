let loaderPromise: Promise<void> | null = null;

export const DEMO_KEY = "AIzaSyBuLXU75u8g6kBz4NyqdxEFalDPLwC9tXI";
export const GOOGLE_MAPS_API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || DEMO_KEY;

export function loadGoogleMapsScript(): Promise<void> {

  if (typeof window !== 'undefined' && (window as any).google?.maps) {
    return Promise.resolve();
  }

  if (loaderPromise) {
    return loaderPromise;
  }

  loaderPromise = new Promise<void>((resolve, reject) => {
    // Check if script is already present
    const existing = document.querySelector('script[data-gmaps-loader="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (e) => reject(e));
      return;
    }

    const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || DEMO_KEY;
    const script = document.createElement('script');
    script.setAttribute('data-gmaps-loader', 'true');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,marker&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = (err) => {
      console.error('Failed to load Google Maps script', err);
      reject(err);
    };
    document.head.appendChild(script);
  });

  return loaderPromise;
}
