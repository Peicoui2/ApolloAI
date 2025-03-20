import { styles } from './styles/styles';
import PropTypes from 'prop-types';

export const SignInButton = ({ supabase }) => {
  const googleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/calendar',
          redirectTo: window.location.origin
        }
      });

      if (error) {
        console.error('Auth error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert("Error de autenticación con Google");
    }
  };

  return (
    <>
    <div style={styles.signInButton}>
      <button
        style={styles.buttonBase}
        onClick={googleSignIn}
      >
        Sign In with Google
      </button>
    </div>

    </>
  );
};

SignInButton.propTypes = {
  supabase: PropTypes.shape({
    auth: PropTypes.shape({
      signInWithOAuth: PropTypes.func.isRequired
    }).isRequired
  }).isRequired
};