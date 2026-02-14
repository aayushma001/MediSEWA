export interface UserDetails {
  fullName: string;
  email: string;
  phone: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  profileImage?: string;
  twoFactor?: boolean;
  dataSharing?: boolean;
}

export const getUserDetails = (): Partial<UserDetails> => {
  try {
    const user = localStorage.getItem('userDetails');
    return user ? JSON.parse(user) : {};
  } catch {
    return {};
  }
};

export const saveUserDetails = (details: Partial<UserDetails>) => {
  try {
    const existing = getUserDetails();
    const updated = { ...existing, ...details };
    localStorage.setItem('userDetails', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save user details:', error);
  }
};

export const clearUserDetails = () => {
  try {
    localStorage.removeItem('userDetails');
  } catch (error) {
    console.error('Failed to clear user details:', error);
  }
};
