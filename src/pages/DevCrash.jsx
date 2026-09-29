// Dev-only route that throws during render, so the error screen can be checked in a real browser.
export default function DevCrash() {
  throw new Error('DevCrash: intentional render error');
}
