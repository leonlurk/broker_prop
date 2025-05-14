import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  updateEmail as firebaseUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import { auth, db } from "./config";
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";

// Register a new user
export const registerUser = async (username, email, password, refId = null) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with the username
    await updateProfile(user, {
      displayName: username
    });
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Prepare user data for Firestore
    const userData = {
      uid: user.uid,
      username,
      email,
      display_name: username,
      created_time: serverTimestamp(),
      referralCount: 0, // Initialize for the new user
      withdrawals_wallet: "", // Initialize for the new user
      preferredLanguage: 'es', // Default language preference
    };

    if (refId) {
      userData.referredBy = refId;
    }

    // Store additional user data in Firestore for the new user
    await setDoc(doc(db, "users", user.uid), userData);

    // If referred, increment referrer's count
    if (refId) {
      try {
        const referrerDocRef = doc(db, "users", refId);
        // Atomically increment the referralCount by 1
        await updateDoc(referrerDocRef, {
          referralCount: increment(1)
        });
        console.log(`Referral count incremented for referrer: ${refId}`);
      } catch (referrerError) {
        console.error(`Failed to update referral count for referrer ${refId}:`, referrerError);
        // Optionally, decide how to handle this error. 
        // For now, the new user registration will still succeed.
      }
    }
    
    return { user };
  } catch (error) {
    return { error };
  }
};

// Sign in existing user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error) {
    return { error };
  }
};

// Sign out user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { error };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { error };
  }
};

// Update user email
export const updateUserEmail = async (newEmail, currentPassword) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No user is currently logged in');
    }
    
    // Reauthenticate the user before changing sensitive information
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    
    // Update email in Firebase Auth
    await firebaseUpdateEmail(user, newEmail);
    
    // Send verification email
    await sendEmailVerification(user);
    
    // Update email in Firestore
    await updateDoc(doc(db, "users", user.uid), {
      email: newEmail,
      email_verified: false,
      last_updated: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    return { error };
  }
};

// Re-authenticate user (useful before security-sensitive operations)
export const reauthenticateUser = async (password) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No user is currently logged in');
    }
    
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    
    return { success: true };
  } catch (error) {
    return { error };
  }
};

// Verify code function (simulated, as Firebase handles this directly via email links)
export const verifyCode = async (code) => {
  // In a real implementation, this would validate a verification code
  // For Firebase, email verification happens through a link sent to email
  console.log("Verification code:", code);
  return { success: true };
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Set up auth state listener
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};