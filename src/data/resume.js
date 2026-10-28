/**
 * Public Resume / CV configuration.
 * Place the official CV PDF in `public/CV-M-Ghifari-Bima-Khadafi.pdf`
 * and set `RESUME_AVAILABLE = true` (or configure `VITE_RESUME_URL` in `.env`)
 * to enable the Download CV button in Hero and Navbar.
 */
export const RESUME_URL = import.meta.env.VITE_RESUME_URL || '/CV-M-Ghifari-Bima-Khadafi.pdf';
export const RESUME_FILENAME = 'CV-M-Ghifari-Bima-Khadafi.pdf';
export const RESUME_AVAILABLE = Boolean(import.meta.env.VITE_RESUME_URL);
