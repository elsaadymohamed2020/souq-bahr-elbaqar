// Pitch settings: change these before you record the video or send the link.
export const PITCH = {
  // The market owner, used in the tour and the admin greeting
  ownerName: 'الحاج إبراهيم',
  // How the site calls him (no "ال" after "يا")
  ownerCall: 'حاج إبراهيم',
  // Your name and WhatsApp number (international format, digits only, e.g. 2010XXXXXXXX).
  // While these stay as placeholders, the tour's final "contact me" button stays hidden.
  devName: 'محمد صلاح',
  devPhone: '201092700628',
  devPhoneDisplay: '0109 270 0628',
};

export const isDevContactSet = () => /^\d{10,15}$/.test(PITCH.devPhone) && !PITCH.devName.includes('[');

export const devWhatsAppLink = () =>
  `https://wa.me/${PITCH.devPhone}?text=${encodeURIComponent(`السلام عليكم يا ${PITCH.devName}، شفت الديمو بتاع سوق بحر البقر وعايز نتكلم.`)}`;
