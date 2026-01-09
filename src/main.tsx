import { CssBaseline, ThemeProvider } from 'convertupleads-theme'
import { createRoot } from 'react-dom/client'
import App from './App'
import { Provider } from 'react-redux'
import { store } from './state/store'
import { ToastContainer, Flip } from 'react-toastify';

createRoot(document.getElementById('root')!).render(
    <ThemeProvider>
        <CssBaseline />
        <Provider store={store}>
            <App />
        </Provider>
        <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            transition={Flip}
        />
    </ThemeProvider>,
)
