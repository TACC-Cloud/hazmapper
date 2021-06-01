// This creates a temporary element to copy a string to clipboard
export function copyToClipboard(text: string): void {
  const tempText = document.createElement('textarea');
  tempText.style.position = 'fixed';
  tempText.style.left = '0';
  tempText.style.top = '0';
  tempText.style.opacity = '0';
  tempText.value = text;
  document.body.appendChild(tempText);
  tempText.focus();
  tempText.select();
  document.execCommand('copy');
  document.body.removeChild(tempText);
}
