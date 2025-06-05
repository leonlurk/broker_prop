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
    
    // Send email verification with custom redirect
    const actionCodeSettings = {
      url: `${window.location.origin}/registration-success`,
      handleCodeInApp: true
    };
    
    await sendEmailVerification(user, actionCodeSettings);
    
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
    console.error("Registration error:", error);
    
    // Handle specific Firebase Auth errors with friendly messages
    let friendlyMessage = "Error al registrarse. Por favor, intente nuevamente.";
    
    if (error.code === 'auth/email-already-in-use') {
      friendlyMessage = "Este correo electrónico ya está registrado. Intenta iniciar sesión o usa otro email.";
    } else if (error.code === 'auth/weak-password') {
      friendlyMessage = "La contraseña es muy débil. Debe tener al menos 6 caracteres.";
    } else if (error.code === 'auth/invalid-email') {
      friendlyMessage = "El formato del correo electrónico no es válido.";
    } else if (error.code === 'auth/operation-not-allowed') {
      friendlyMessage = "El registro con email está deshabilitado temporalmente.";
    }
    
    return { error: { message: friendlyMessage, code: error.code } };
  }
};

// Sign in existing user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if email is verified
    if (!user.emailVerified) {
      // Sign out the user if email is not verified
      await signOut(auth);
      return { 
        error: { 
          message: "Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada y haz clic en el enlace de verificación.",
          code: 'auth/email-not-verified'
        } 
      };
    }
    
    return { user: userCredential.user };
  } catch (error) {
    console.error("[loginUser] Login process error:", error);
    let friendlyMessage = "Error al iniciar sesión. Por favor, intente nuevamente.";
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-email') {
        friendlyMessage = "Las credenciales ingresadas son incorrectas.";
    }
    return { error: { message: friendlyMessage } };
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
    const actionCodeSettings = {
      url: "http://localhost:5175/verification", // Cambia por tu dominio real en producción
      handleCodeInApp: true
    };
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
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
    
    // Send verification email with custom redirect
    const actionCodeSettings = {
      url: `${window.location.origin}/registration-success`,
      handleCodeInApp: true
    };
    
    await sendEmailVerification(user, actionCodeSettings);
    
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

// Re-send email verification
export const resendEmailVerification = async (email) => {
  try {
    // If there's a current user, use them, otherwise try to sign in temporarily
    let user = auth.currentUser;
    
    if (!user && email) {
      // We can't resend verification without the user being authenticated
      // Return instructions to check email instead
      throw new Error('Para reenviar el email de verificación, necesitas intentar hacer login primero.');
    }
    
    if (!user) {
      throw new Error('No se puede reenviar el email de verificación en este momento.');
    }
    
    // Send verification email with custom redirect
    const actionCodeSettings = {
      url: `${window.location.origin}/registration-success`,
      handleCodeInApp: true
    };
    
    await sendEmailVerification(user, actionCodeSettings);
    return { success: true };
  } catch (error) {
    return { error };
  }
};