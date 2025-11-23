// Placeholder: assemble a print-ready PDF for a card job.
// Returns a mock URL; replace with a real PDF pipeline later.
module.exports = async function assembleCardPdf({ cardJobId }) {
  return `https://example.com/card-pdf/${cardJobId || 'preview'}.pdf`;
};
