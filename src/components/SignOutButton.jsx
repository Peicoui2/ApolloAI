import React from 'react';
import { styles } from './styles/styles';
import PropTypes from 'prop-types';

export const SignOutButton = ({ supabase }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '1rem' }}>
      <button
        style={styles.signOutButton}
        onClick={() => supabase.auth.signOut()}
      >
        Sign Out
      </button>
    </div>
  );
};

SignOutButton.propTypes = {
  supabase: PropTypes.shape({
    auth: PropTypes.shape({
      signOut: PropTypes.func.isRequired
    }).isRequired
  }).isRequired
};