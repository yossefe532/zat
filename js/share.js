export function initShare() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent('اكتشف منحة ZAT التعليمية');

  const fb = document.getElementById('share-facebook');
  const wa = document.getElementById('share-whatsapp');
  const tw = document.getElementById('share-twitter');
  const cp = document.getElementById('share-copy');

  if (fb) fb.addEventListener('click', () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank'));
  if (wa) wa.addEventListener('click', () => window.open(`https://wa.me/?text=${text}%20${url}`, '_blank'));
  if (tw) tw.addEventListener('click', () => window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank'));
  
  if (cp) {
    cp.addEventListener('click', function() {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const original = this.textContent;
        this.textContent = '✓';
        setTimeout(() => this.textContent = original, 2000);
      });
    });
  }
}
