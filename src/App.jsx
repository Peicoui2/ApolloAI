import { imports } from "./utils/importInjector";
import { LoadingScreen } from './components/LoadingScreen';
import { ChatMessage } from './components/ChatMessage';
import { styles, AppStyle } from './components/styles/styles';
import { useChatLogic } from './hooks/useChatLogic';
import { SignOutButton } from './components/SignOutButton';
import { SignInButton } from './components/SignInButton';
import { Logo } from './components/Logo';

const {
  MainContainer,
  ChatContainer,
  MessageList,
  MessageInput,
  TypingIndicator,
  useSession,
  useSupabaseClient,
  useSessionContext,
} = imports;

function App() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const { isLoading } = useSessionContext();

  const {
    messages,
    typing,
    handleSend
  } = useChatLogic(session); 

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="App" style={AppStyle.container}>
      <main style={AppStyle.main}>
        {session ? (
          <>
            <MainContainer style={{...styles.chatContainer}}>
              <ChatContainer>
                <MessageList
                  scrollBehavior='smooth'
                  typingIndicator={
                    typing ? (
                      <TypingIndicator 
                        content="ChatGPT is typing" 
                        style={{ 
                          backgroundColor: '#2C2C2C', 
                          color: '#FFFFFF',
                          padding: '0.8rem',
                          borderRadius: '8px',
                          margin: '1rem 0'
                        }} 
                      />
                    ) : null
                  }
                  style={{ backgroundColor: '#FFFFF'}}
                >
                  {messages.map((msg, i) => (
                    <ChatMessage key={i} msg={msg} index={i} />
                  ))}
                </MessageList>
                <MessageInput 
                  placeholder="Type message here" 
                  onSend={handleSend}
                  style={{
                    backgroundColor: '#e2e0e0',
                    color: '#FFFFFF',
                    border: '2px solid #404040',
                  }}
                />
              </ChatContainer>
            </MainContainer>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
              <SignOutButton supabase={supabase} />
            </div>
          </>
        ) : (
          <SignInButton supabase={supabase} />
        )}
      </main>
      <footer style={AppStyle.footer}>
        <Logo />
      </footer>
    </div>
  );
}

export default App;
