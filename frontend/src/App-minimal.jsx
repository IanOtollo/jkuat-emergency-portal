// MINIMAL TEST VERSION - Use this to test if React is working

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', background: 'white', color: '#333', padding: '40px', borderRadius: '12px' }}>
        <h1>✅ React is Working!</h1>
        <p>If you see this, the frontend is loading correctly.</p>
        <p>Now we can restore the full JKUAT app.</p>
      </div>
    </div>
  );
}

export default App;
