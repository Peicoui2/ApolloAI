import { styles } from './styles/styles';
import PropTypes from 'prop-types';

export const Logo = ({ src = "src/assets/AA-White.svg" }) => {
    return (
        <img
            src={src}
            alt="ChatGPT Avatar"
            style={styles.logoAvatar}
        />
    );
};

Logo.propTypes = {
    src: PropTypes.string
};