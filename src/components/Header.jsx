import { styles } from './styles/styles';
import { config } from '../config/env.config';

export const Header = () => {
  return (
    <div style={styles.headerContainer}>
      <h1 style={styles.headerText}>
        Welcome to <span style={styles.companyName}>{config.COMPANY_NAME}</span>
      </h1>
      <p style={styles.subheaderText}>Your AI Assistant</p>
    </div>
  );
};