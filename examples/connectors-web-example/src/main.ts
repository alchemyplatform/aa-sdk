import { sendEmailOtp, submitOtpCode, loginWithOauth, handleOauthRedirect } from '@alchemy/wagmi-core'
import { resolveAlchemyAuthConnector } from '@alchemy/connectors-web'
import { Buffer } from 'buffer'
import { connect, disconnect, reconnect, watchAccount, getAccount, signMessage, verifyMessage } from '@wagmi/core'
import { config } from './wagmi'
import './style.css'

globalThis.Buffer = Buffer

// DOM helper functions
function updateStatus(elementId: string, message: string) {
  const element = document.getElementById(elementId)
  if (element) element.innerText = message
}

function getInputValue(elementId: string): string {
  const input = document.getElementById(elementId) as HTMLInputElement
  return input?.value || ''
}

function focusElement(elementId: string) {
  const element = document.getElementById(elementId)
  element?.focus()
}

function getSelectedOauthMode(): 'popup' | 'redirect' {
  const checkedRadio = document.querySelector<HTMLInputElement>('input[name="oauth-mode"]:checked')
  return (checkedRadio?.value as 'popup' | 'redirect') || 'popup'
}

// Authentication handlers
async function handleSendOtp() {
  const email = getInputValue('email-input')
  if (!email) {
    updateStatus('auth-status', 'Please enter an email address')
    return
  }

  try {
    updateStatus('auth-status', 'Sending OTP...')
    await sendEmailOtp(config, { email })
    updateStatus('auth-status', 'OTP sent! Check your email.')
    focusElement('otp-input')
  } catch (error) {
    updateStatus('auth-status', `Error: ${(error as Error).message}`)
  }
}

async function handleSubmitOtp() {
  const otpCode = getInputValue('otp-input')
  if (!otpCode) {
    updateStatus('auth-status', 'Please enter the OTP code')
    return
  }

  try {
    updateStatus('auth-status', 'Verifying OTP...')
    await submitOtpCode(config, { otpCode })
    updateStatus('auth-status', 'Authentication successful!')
  } catch (error) {
    updateStatus('auth-status', `Error: ${(error as Error).message}`)
  }
}

async function handleOauthLogin(provider: string) {
  const mode = getSelectedOauthMode()

  try {
    updateStatus('oauth-status', `Initiating ${provider} OAuth (${mode})...`)
    await loginWithOauth(config, { provider, mode })
    updateStatus('oauth-status', `${provider} authentication successful!`)
  } catch (error) {
    updateStatus('oauth-status', `Error: ${(error as Error).message}`)
  }
}

async function handleSignMessage() {
  const account = getAccount(config)
  if (account.status !== 'connected') {
    alert('Not connected')
    return
  }

  const message = getInputValue('message-input')
  if (!message) {
    alert('Please enter a message')
    return
  }

  try {
    const signature = await signMessage(config, { message })
    const isValid = await verifyMessage(config, { message, signature, address: account.address })
    console.log({ signature, isValid })
    alert(`Signature: ${signature}\n\n Verified: ${isValid}`)
  } catch (error) {
    console.error(error)
    alert('Failed to sign message')
  }
}

// OAuth redirect handling on page load
function handleOauthRedirectOnLoad() {
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('alchemy-bundle') || urlParams.get('alchemy-org-id')) {
    handleOauthRedirect(config)
      .then(() => {
        updateStatus('oauth-status', 'OAuth redirect completed successfully!')
        window.history.replaceState({}, document.title, window.location.pathname)
      })
      .catch((error: Error) => {
        updateStatus('oauth-status', `OAuth redirect error: ${error.message}`)
      })
  }
}

// Force disconnect handler
async function handleForceDisconnect() {
  try {
    updateStatus('disconnect-status', 'Disconnecting and clearing session...')

    // Try to get and disconnect the Alchemy connector directly using the helper
    try {
      const alchemyConnector = resolveAlchemyAuthConnector(config)
      console.log('Found Alchemy connector:', alchemyConnector)

      // Call disconnect on the connector directly
      if (alchemyConnector && typeof alchemyConnector.disconnect === 'function') {
        await alchemyConnector.disconnect()
        console.log('Successfully called connector.disconnect()')
      } else {
        console.warn('Connector does not have disconnect method')
        // Fall back to Wagmi's disconnect
        await disconnect(config)
      }
    } catch (connectorError) {
      console.warn('Could not resolve Alchemy connector, trying general disconnect:', connectorError)
      // Fall back to Wagmi's disconnect
      await disconnect(config)
    }

    // Clear any additional browser storage that might be used
    // This ensures a completely clean state
    localStorage.clear()
    sessionStorage.clear()

    updateStatus('disconnect-status', 'Successfully disconnected and cleared session!')

    // Optionally reload the page to ensure clean state
    setTimeout(() => {
      window.location.reload()
    }, 1000)

  } catch (error) {
    console.error('Disconnect error details:', error)
    updateStatus('disconnect-status', `Disconnect error: ${(error as Error).message}`)
  }
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div id="account">
      <h2>Account</h2>

      <div>
        status:
        <br />
        addresses:
        <br />
        chainId:
      </div>
    </div>

    <div id="connect">
      <h2>3rd Party Connectors</h2>
      ${config.connectors
        .filter((connector) => connector.id !== 'alchemyAuth')
        .map(
          (connector) =>
            `<button class="connect" id="${connector.uid}" type="button">${connector.name}</button>`,
        )
        .join('')}
    </div>

    <div id="email-auth">
      <h2>Email Authentication</h2>

      <form id="email-form">
        <input type="email" id="email-input" placeholder="Enter your email" required autocomplete="off" data-1p-ignore />
        <button id="send-otp" type="submit">Send OTP</button>
      </form>
      <form id="otp-form">
        <input type="text" id="otp-input" placeholder="Enter OTP code" maxlength="6" required autocomplete="off" data-1p-ignore />
        <button id="submit-otp" type="submit">Submit OTP</button>
      </form>
      <div id="auth-status"></div>
    </div>

    <div id="oauth-auth">
      <h2>OAuth Authentication</h2>

      <div class="oauth-buttons">
        <button id="oauth-google" type="button" class="oauth-btn">
          Login with Google
        </button>
        <button id="oauth-facebook" type="button" class="oauth-btn">
          Login with Facebook
        </button>
        <button id="oauth-apple" type="button" class="oauth-btn">
          Login with Apple
        </button>
      </div>

      <div class="oauth-mode">
        <label>
          <input type="radio" name="oauth-mode" value="popup" checked /> Popup
        </label>
        <label>
          <input type="radio" name="oauth-mode" value="redirect" /> Redirect
        </label>
      </div>

      <div id="oauth-status"></div>
    </div>

    <div id="wallet-actions">
      <h2>Wallet Actions</h2>
      
      <form id="message-form">
        <input type="text" id="message-input" placeholder="Enter message" required />
        <button id="sign-message" type="submit">Sign message</button>
      </form>
    </div>

    <div id="session-controls">
      <h2>Session Controls</h2>
      <button id="force-disconnect" type="button" class="disconnect-btn">
        Force Disconnect & Clear Session
      </button>
      <div id="disconnect-status"></div>
    </div>
  </div>
`

setupApp(document.querySelector<HTMLDivElement>('#app')!)

// Setup functions
function setupConnectorButtons(element: HTMLDivElement) {
  const connectElement = element.querySelector<HTMLDivElement>('#connect')
  const buttons = element.querySelectorAll<HTMLButtonElement>('.connect')

  for (const button of buttons) {
    const connector = config.connectors.find(
      (connector) => connector.uid === button.id,
    )!

    button.addEventListener('click', async () => {
      try {
        // Clear previous errors
        const errorElement = element.querySelector<HTMLDivElement>('#error')
        if (errorElement) errorElement.remove()

        await connect(config, { connector })
      } catch (error) {
        const errorElement = document.createElement('div')
        errorElement.id = 'error'
        errorElement.innerText = (error as Error).message
        connectElement?.appendChild(errorElement)
      }
    })
  }
}

function setupAccountWatcher(element: HTMLDivElement) {
  watchAccount(config, {
    onChange(account) {
      const accountElement = element.querySelector<HTMLDivElement>('#account')!
      accountElement.innerHTML = `
        <h2>Account</h2>
        <div>
          status: ${account.status}
          <br />
          addresses: ${
            account.addresses ? JSON.stringify(account.addresses) : ''
          }
          <br />
          chainId: ${account.chainId ?? ''}
        </div>
        ${
          account.status === 'connected'
            ? `<button id="disconnect" type="button">Disconnect</button>`
            : ''
        }
      `

      const disconnectButton = element.querySelector<HTMLButtonElement>('#disconnect')
      if (disconnectButton) {
        disconnectButton.addEventListener('click', () => disconnect(config))
      }
    },
  })
}

function setupEmailAuth() {
  const emailForm = document.querySelector<HTMLFormElement>('#email-form')
  const otpForm = document.querySelector<HTMLFormElement>('#otp-form')

  emailForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    await handleSendOtp()
  })

  otpForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    await handleSubmitOtp()
  })
}

function setupOauthAuth() {
  const oauthButtons = document.querySelectorAll<HTMLButtonElement>('.oauth-btn')

  oauthButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const provider = button.id.replace('oauth-', '') // google, facebook, apple
      await handleOauthLogin(provider)
    })
  })
}

function setupWalletActions() {
  const messageForm = document.querySelector<HTMLFormElement>('#message-form')

  messageForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    await handleSignMessage()
  })
}

function setupSessionControls() {
  const forceDisconnectButton = document.getElementById('force-disconnect')
  forceDisconnectButton?.addEventListener('click', handleForceDisconnect)
}

function setupApp(element: HTMLDivElement) {
  setupConnectorButtons(element)
  setupAccountWatcher(element)
  setupEmailAuth()
  setupOauthAuth()
  setupWalletActions()
  setupSessionControls()

  // Handle OAuth redirect on page load
  handleOauthRedirectOnLoad()

  // Attempt to reconnect on app start
  reconnect(config).catch(() => {
    // Ignore reconnection errors on startup
  })
}
