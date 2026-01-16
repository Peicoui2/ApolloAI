import React from 'react';
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
    <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
    }}>
        <img 
            src='src/assets/logo-apolloai-grey.png'
            alt="Apollo AI Logo"
            style={{ maxWidth: '250px', marginBottom: '30px' }}
        />
        <div style={styles.signInButton}>
            <button
                style={{
                    ...styles.buttonBase,
                    padding: '15px 30px',
                    fontSize: '1.2rem'
                }}
                onClick={googleSignIn}
                type="button"
                aria-label="Sign in with Google"
            >
                Sign In with Google
            </button>
        </div>
    </div>
);
};

SignInButton.propTypes = {
  supabase: PropTypes.shape({
    auth: PropTypes.shape({
      signInWithOAuth: PropTypes.func.isRequired
    }).isRequired
  }).isRequired
};