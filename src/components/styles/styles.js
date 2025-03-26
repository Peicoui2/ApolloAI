export const AppStyle = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        position: 'relative'
        
    },
    main: {
        position: 'relative',
        height: '85vh',  // Adjusted back
        width: '80vh',
        marginBottom: '2rem'  // Reduced margin
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '1rem'
    }
};

export const styles = {
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem',
        fontWeight: 'bold'
    },
    chatContainer: {
        borderRadius: '15px',
        border: '5px solid #404040',
        marginBottom: '1rem',
        backgroundColor: '#e2e0e0',
        padding: '1rem'
    },
    buttonBase: {
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#4CAF50',
        color: 'white',
        cursor: 'pointer'
    },
    signOutButton: {
        display: 'flex', justifyContent: 'center', width: 'auto',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        border: '1px solid black',
        backgroundColor: '#FF5B61',
        color: 'white',
        cursor: 'pointer'
    },
    avatar: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        border: '2px solid #404040',
        margin: '0 8px',
        backgroundColor: '#2C2C2C'
    },
    logoAvatar: {
        position: 'absolute',
        bottom: '1rem',
        right: '2rem',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        border: '4px solid rgb(0, 6, 0)'
    },
    signInButton: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
    }
};