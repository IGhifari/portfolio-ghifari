/**
 * Public Resume / CV configuration.
 * Placed in `public/docs/M.GhifariBimaKhadafi_CV.pdf`
 * and set `RESUME_AVAILABLE = true` (or configure `VITE_RESUME_URL` in `.env`)
 * to enable the Download CV button in Hero and Navbar.
 */
const envResumeUrl =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_RESUME_URL
    : undefined;

export const RESUME_URL = envResumeUrl || '/docs/M.GhifariBimaKhadafi_CV.pdf';
export const RESUME_FILENAME = 'M.GhifariBimaKhadafi_CV.pdf';
export const RESUME_AVAILABLE = true;
