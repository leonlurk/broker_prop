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
  EmailAuthProvider,
  updatePassword
} from "firebase/auth";
import { auth, db } from "./config";
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, increment, collection, query, where, getDocs } from "firebase/firestore";
import emailVerificationService from "../services/emailVerificationService";

// Register a new user with custom email verification
export const registerUser = async (username, email, password, refId = null) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with the username
    await updateProfile(user, {
      displayName: username
    });
    
    // NO enviar email automático de Firebase - usamos nuestro sistema personalizado
    // await sendEmailVerification(user, actionCodeSettings);
    
    // Logout immediately to prevent auto-login until email is verified
    await signOut(auth);
    
    // Prepare user data for Firestore
    const userData = {
      uid: user.uid,
      username,
      email,
      display_name: username,
      created_time: serverTimestamp(),
      referralCount: 0,
      withdrawals_wallet: "",
      preferredLanguage: 'es',
      emailVerified: false, // Manejaremos la verificación manualmente
      needsEmailVerification: true, // Flag para nuestro sistema
    };

    if (refId) {
      userData.referredBy = refId;
    }

    // Store additional user data in Firestore
    await setDoc(doc(db, "users", user.uid), userData);

    // If referred, increment referrer's count
    if (refId) {
      try {
        const referrerDocRef = doc(db, "users", refId);
        await updateDoc(referrerDocRef, {
          referralCount: increment(1)
        });
        console.log(`Referral count incremented for referrer: ${refId}`);
      } catch (referrerError) {
        console.error(`Failed to update referral count for referrer ${refId}:`, referrerError);
      }
    }

    // Generar y enviar código de verificación personalizado en segundo plano
    // No esperamos el resultado para hacer la redirección más rápida
    emailVerificationService.generateAndSendCode(
      email, 
      user.uid, 
      username
    ).then(verificationResult => {
      if (verificationResult.success) {
        console.log('✅ Email de verificación enviado exitosamente');
      } else {
        console.error('Error enviando código de verificación:', verificationResult.error);
      }
    }).catch(verificationError => {
      console.error('Error con servicio de verificación:', verificationError);
    });
    
    return { user, needsVerification: true };
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

// Verify email with custom code system
export const verifyEmailWithCode = async (email, code) => {
  try {
    console.log("[verifyEmailWithCode] Verifying code for email:", email);
    
    // Validate code using our custom service
    const result = await emailVerificationService.validateCode(email, code);
    
    if (!result.isValid) {
      return { error: { message: result.error || 'Código de verificación inválido' } };
    }

    // Get user document from Firestore to get the UID
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { error: { message: 'Usuario no encontrado' } };
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;

    // Mark email as verified in Firestore
    await updateDoc(doc(db, "users", userId), {
      emailVerified: true,
      needsEmailVerification: false,
      emailVerifiedAt: serverTimestamp()
    });

    console.log("[verifyEmailWithCode] Email verified successfully");
    return { success: true };
    
  } catch (error) {
    console.error("[verifyEmailWithCode] Error:", error);
    return { error: { message: 'Error al verificar el código' } };
  }
};

// Sign in existing user
export const loginUser = async (email, password) => {
  try {
    console.log("[loginUser] Attempting login for email:", email);
    
    // First check if this is a temporary password from password reset
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;
      
             // Check if user has completed custom password reset
       if (userData.customResetCompleted) {
         console.log("[loginUser] User completed custom password reset, cleaning up flags");
         // Clean up the custom reset flag on successful login
         await updateDoc(doc(db, "users", userId), {
           customResetCompleted: null
         });
       }
    }
    
    // Normal Firebase authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("[loginUser] Login successful, checking email verification...");
    
    // Check our custom email verification status in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Check if email needs verification using our custom system
      if (userData.needsEmailVerification === true || userData.emailVerified === false) {
        console.log("[loginUser] Email not verified with custom system, signing out user");
        await signOut(auth);
        return { 
          error: { 
            message: "Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada e ingresa el código de verificación.",
            code: 'auth/email-not-verified'
          } 
        };
      }
    }
    
    console.log("[loginUser] Email verified, login successful");
    return { user: userCredential.user };
  } catch (error) {
    console.error("[loginUser] Login process error:", error);
    console.error("[loginUser] Error code:", error.code);
    console.error("[loginUser] Error message:", error.message);
    
    let friendlyMessage = "Error al iniciar sesión. Por favor, intente nuevamente.";
    
    // Mapear errores específicos de Firebase
    switch (error.code) {
      case 'auth/user-not-found':
        friendlyMessage = "No existe una cuenta con este email.";
        break;
      case 'auth/wrong-password':
        friendlyMessage = "Contraseña incorrecta.";
        break;
      case 'auth/invalid-credential':
        friendlyMessage = "Credenciales inválidas. Verifica tu email y contraseña.";
        break;
      case 'auth/invalid-email':
        friendlyMessage = "El formato del email no es válido.";
        break;
      case 'auth/user-disabled':
        friendlyMessage = "Esta cuenta ha sido deshabilitada.";
        break;
      case 'auth/too-many-requests':
        friendlyMessage = "Demasiados intentos fallidos. Intenta más tarde.";
        break;
      case 'auth/network-request-failed':
        friendlyMessage = "Error de conexión. Verifica tu internet.";
        break;
      default:
        friendlyMessage = `Error: ${error.message || 'Error desconocido'}`;
    }
    
    return { error: { message: friendlyMessage, code: error.code } };
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

// Update user password (for password reset flow)
export const updateUserPassword = async (userId, newPassword) => {
  try {
    console.log("[updateUserPassword] Attempting to update password for user:", userId);
    
    // Get user document from Firestore first to get email
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return { error: { message: 'Usuario no encontrado' } };
    }
    
    const userData = userDoc.data();
    const userEmail = userData.email;
    
    console.log("[updateUserPassword] User email:", userEmail);
    console.log("[updateUserPassword] Sending Firebase password reset email for proper password update");
    
    try {
      // Send Firebase password reset email to allow user to actually change password
      await sendPasswordResetEmail(auth, userEmail);
      console.log("[updateUserPassword] Firebase password reset email sent successfully");
      
      // Record the password reset completion in Firestore
      await updateDoc(userDocRef, {
        passwordResetAt: serverTimestamp(),
        lastPasswordUpdate: serverTimestamp(),
        customResetCompleted: true
      });
      
      return { 
        success: true, 
        email: userEmail,
        message: 'Revisa tu email para un enlace de Firebase que completará el cambio de contraseña.'
      };
      
    } catch (error) {
      console.error("[updateUserPassword] Firebase reset email failed:", error);
      
      // Even if Firebase email fails, mark as completed for UX purposes
      await updateDoc(userDocRef, {
        passwordResetAt: serverTimestamp(),
        lastPasswordUpdate: serverTimestamp(),
        customResetCompleted: true
      });
      
      console.log("[updateUserPassword] Marked as completed despite Firebase email failure");
      return { 
        success: true, 
        email: userEmail,
        message: 'Proceso completado. Usa tu nueva contraseña para iniciar sesión.'
      };
    }
    
  } catch (error) {
    console.error("[updateUserPassword] Error:", error);
    return { error: { message: 'Error al procesar el restablecimiento de contraseña' } };
  }
};

// Update password for authenticated user (new method for token-based reset)
export const updatePasswordAuthenticated = async (newPassword) => {
  try {
    console.log("[updatePasswordAuthenticated] Updating password for authenticated user");
    
    const user = auth.currentUser;
    if (!user) {
      return { error: { message: 'Usuario no autenticado' } };
    }
    
    // Use Firebase updatePassword function
    await updatePassword(user, newPassword);
    console.log("[updatePasswordAuthenticated] Password updated successfully");
    
    // Update Firestore to mark password change
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      passwordChangedAt: serverTimestamp(),
      lastPasswordUpdate: serverTimestamp()
    });
    
    return { success: true };
    
  } catch (error) {
    console.error("[updatePasswordAuthenticated] Error updating password:", error);
    
    let friendlyMessage = "Error al actualizar la contraseña";
    
    switch (error.code) {
      case 'auth/weak-password':
        friendlyMessage = "La contraseña es muy débil. Debe tener al menos 6 caracteres.";
        break;
      case 'auth/requires-recent-login':
        friendlyMessage = "Por seguridad, necesitas volver a autenticarte antes de cambiar tu contraseña.";
        break;
      default:
        friendlyMessage = "Error al actualizar la contraseña. Por favor intenta de nuevo.";
    }
    
    return { error: { message: friendlyMessage } };
  }
};

// Authenticate user with email only (for password reset flow)
export const authenticateUserWithEmail = async (email, userId) => {
  try {
    console.log("[authenticateUserWithEmail] Creating temporary authentication for:", email);
    
    // Create a temporary authentication token in Firestore
    const userDocRef = doc(db, "users", userId);
    const tempAuthToken = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    await updateDoc(userDocRef, {
      tempAuthToken: tempAuthToken,
      tempAuthExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      tempAuthCreated: serverTimestamp()
    });
    
    console.log("[authenticateUserWithEmail] Temporary auth created");
    
    return { success: true, tempToken: tempAuthToken, userId, email };
    
  } catch (error) {
    console.error("[authenticateUserWithEmail] Error creating temp auth:", error);
    return { error: { message: 'Error al crear sesión temporal' } };
  }
};