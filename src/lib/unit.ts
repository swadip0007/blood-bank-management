
 const isEligibleToDonate = (lastDonationDate?: string) => {
  if (!lastDonationDate) return true;
  const lastDate = new Date(lastDonationDate);
  const days = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  return days >= 90;
};

const getDaysSinceLastDonation = (lastDonationDate?: string) => {
  if (!lastDonationDate) return 0;
  const lastDate = new Date(lastDonationDate);
  return Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
};

const calculateAge = (dateOfBirth?: string) => {
  if (!dateOfBirth) return 0;
  const dob = new Date(dateOfBirth);
  const diff = Date.now() - dob.getTime();
  const age = new Date(diff).getUTCFullYear() - 1970;
  return age;
};

const getBloodGroupColor = (bloodGroup: string) => {
  switch (bloodGroup) {
    case 'A+':
    case 'A-':
      return 'error.main';
    case 'B+':
    case 'B-':
      return 'warning.main';
    case 'O+':
    case 'O-':
      return 'info.main';
    case 'AB+':
    case 'AB-':
      return 'success.main';
    default:
      return 'grey.400';
  }
};

export default {
  isEligibleToDonate,
  getDaysSinceLastDonation,
  calculateAge,
  getBloodGroupColor,
};
