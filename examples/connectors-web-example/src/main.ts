import { connect, disconnect, getAccount, reconnect, signMessage, watchAccount } from '@wagmi/core'
import { sendEmailOtp, submitOtpCode } from '@alchemy/wagmi-core'
import { Buffer } from 'buffer'

import './style.css'
import { config } from './wagmi'

globalThis.Buffer = Buffer

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
      <h2>Other connectors</h2>
      ${config.connectors
        .filter((connector) => connector.id !== 'alchemyAuth')
        .map(
          (connector) =>
            `<button class="connect" id="${connector.uid}" type="button">${connector.name}</button>`,
        )
        .join('')}
    </div>

    <div id="email-auth">
      <h2>Alchemy Auth</h2>
      
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

    <div id="wallet-actions">
      <h2>Wallet Actions</h2>
      
      <form id="message-form">
        <input type="text" id="message-input" placeholder="Enter message" required />
        <button id="sign-message" type="submit">Sign message</button>
      </form>
    </div>
  </div>
`

setupApp(document.querySelector<HTMLDivElement>('#app')!)

function setupApp(element: HTMLDivElement) {
  const connectElement = element.querySelector<HTMLDivElement>('#connect')
  const buttons = element.querySelectorAll<HTMLButtonElement>('.connect')
  for (const button of buttons) {
    const connector = config.connectors.find(
      (connector) => connector.uid === button.id,
    )!
    button.addEventListener('click', async () => {
      try {
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

      const disconnectButton =
        element.querySelector<HTMLButtonElement>('#disconnect')
      if (disconnectButton)
        disconnectButton.addEventListener('click', () => disconnect(config))
    },
  })

  // Email OTP functionality
  const emailForm = element.querySelector<HTMLFormElement>('#email-form')
  const otpForm = element.querySelector<HTMLFormElement>('#otp-form')
  const emailInput = element.querySelector<HTMLInputElement>('#email-input')
  const otpInput = element.querySelector<HTMLInputElement>('#otp-input')
  const authStatus = element.querySelector<HTMLDivElement>('#auth-status')

  // Signing functionality
  const messageForm = element.querySelector<HTMLFormElement>('#message-form')
  const messageInput = element.querySelector<HTMLInputElement>('#message-input')

  emailForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = emailInput?.value
    if (!email) {
      if (authStatus) authStatus.innerText = 'Please enter an email address'
      return
    }

    try {
      if (authStatus) authStatus.innerText = 'Sending OTP...'
      await sendEmailOtp(config as any, { email })
      if (authStatus) authStatus.innerText = 'OTP sent! Check your email.'
      if (otpInput) otpInput.focus()
    } catch (error) {
      const errorMessage = (error as Error).message
      if (authStatus) authStatus.innerText = `Error: ${errorMessage}`
    }
  })

  otpForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const otpCode = otpInput?.value
    if (!otpCode) {
      if (authStatus) authStatus.innerText = 'Please enter the OTP code'
      return
    }

    try {
      if (authStatus) authStatus.innerText = 'Verifying OTP...'
      await submitOtpCode(config as any, { otpCode })
      if (authStatus) authStatus.innerText = 'Authentication successful!'
    } catch (error) {
      if (authStatus) authStatus.innerText = `Error: ${(error as Error).message}`
    }
  })

  messageForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const account = getAccount(config)
    if (account.status !== 'connected') {
      alert('Not connected')
      return
    }
    const message = messageInput?.value
    if (!message) {
      return
    }

    try {
      const signature = await signMessage(config as any, { message })
      console.log({ signature })
      alert(`Signature: ${signature}`)
    } catch(err) {
      console.error(err)
      alert("Failed to sign message")
    }
  })

  reconnect(config)
    .then(() => {})
    .catch(() => {})
}
