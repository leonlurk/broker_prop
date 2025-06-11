// FAQ Interaction
document.addEventListener('DOMContentLoaded', () => {
  const faqHeaders = document.querySelectorAll('.faq-header');
  
  faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const faqItem = header.parentElement;
      const content = faqItem.querySelector('.faq-content');
      const arrow = header.querySelector('svg');
      
      // Toggle content visibility
      content.classList.toggle('hidden');
      
      // Rotate arrow
      if (content.classList.contains('hidden')) {
        arrow.style.transform = 'rotate(0deg)';
      } else {
        arrow.style.transform = 'rotate(180deg)';
      }
      
      // Close other FAQs
      faqHeaders.forEach(otherHeader => {
        if (otherHeader !== header) {
          const otherItem = otherHeader.parentElement;
          const otherContent = otherItem.querySelector('.faq-content');
          const otherArrow = otherHeader.querySelector('svg');
          
          otherContent.classList.add('hidden');
          otherArrow.style.transform = 'rotate(0deg)';
        }
      });
    });
  });

  // Add click event to help card items
  const helpCardItems = document.querySelectorAll('#help-card > div:not(:first-child)');
  helpCardItems.forEach(item => {
    item.addEventListener('click', () => {
      // Show ayuda section
      document.getElementById('inicio-section').classList.add('hidden');
      document.getElementById('ayuda-section').classList.remove('hidden');
      
      // Find and open the corresponding FAQ
      const title = item.querySelector('div').textContent.trim();
      const faqHeader = Array.from(document.querySelectorAll('.faq-header')).find(
        header => header.querySelector('div').textContent.trim() === title
      );
      
      if (faqHeader) {
        faqHeader.click();
      }
    });
  });
}); 